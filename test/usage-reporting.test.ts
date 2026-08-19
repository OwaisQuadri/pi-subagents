/**
 * usage-reporting.test.ts — proves subagent spend actually reaches the parent
 * session (#193), through the real registered tools.
 *
 * Pi folds `toolResult.usage` into `getSessionStats()`, which is what the
 * footer, the statusline and `/cost` read. So the observable contract is not
 * "we tracked a number" but "the tool result carries a complete pi `Usage`" —
 * and every assertion here is about that object: that it appears, that it
 * appears exactly once per message of spend, that it never appears when the
 * user did not ask for it, and that it is complete enough for pi to consume
 * without throwing.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/agent-runner.js", async () => {
  const actual = await vi.importActual<typeof import("../src/agent-runner.js")>("../src/agent-runner.js");
  return { ...actual, runAgent: vi.fn() };
});

import { runAgent } from "../src/agent-runner.js";
import { registerAgents } from "../src/agent-types.js";
import subagentsExtension from "../src/index.js";
import { ctx, flush, type Hermetic, hermeticDir, makePi } from "./helpers/boot-extension.js";

/** Drive one foreground run that spends `usage` on a single assistant message. */
function runSpending(usage: { input: number; output: number; cacheWrite: number; cost?: number }) {
  vi.mocked(runAgent).mockImplementation(async (_c: any, _t: any, _p: any, opts: any) => {
    opts.onAssistantUsage?.(usage);
    return { responseText: "done", session: { dispose: vi.fn() } as any, aborted: false, steered: false };
  });
}

/** Nothing spent — the agent errored before any message_end fired. */
function runSpendingNothing() {
  vi.mocked(runAgent).mockImplementation(async () => (
    { responseText: "done", session: { dispose: vi.fn() } as any, aborted: false, steered: false }
  ));
}

const spawn = (tools: Map<string, any>, toolCallId: string | undefined) =>
  tools.get("Agent").execute(
    toolCallId,
    { prompt: "go", description: "spend", subagent_type: "general-purpose", run_in_background: false },
    undefined, undefined, ctx(),
  );

describe("reporting subagent usage back to the parent session", () => {
  let hermetic: Hermetic;

  function boot(settings: Record<string, unknown>) {
    hermetic = hermeticDir({ settings });
    const { pi, tools, lifecycle } = makePi();
    subagentsExtension(pi);
    return { pi, tools, lifecycle };
  }

  beforeEach(() => {
    vi.mocked(runAgent).mockReset();
  });

  afterEach(() => {
    delete (globalThis as any)[Symbol.for("pi-subagents:manager")];
    registerAgents(new Map());
    hermetic?.restore();
  });

  it("attaches a complete pi Usage to the tool result", async () => {
    const { tools } = boot({ reportUsage: true });
    runSpending({ input: 100, output: 50, cacheWrite: 10, cost: 0.0123 });

    const result = await spawn(tools, "tc-1");

    // Every field pi's `addUsageToTotals` touches must exist: it reads
    // `usage.cost.total` with no guard, so a partial object throws inside pi.
    expect(result.usage).toEqual({
      input: 100,
      output: 50,
      // Zero on purpose (#38): each message's cacheRead is the whole cached
      // prefix re-read, so summing it across turns bills the prefix N times.
      cacheRead: 0,
      cacheWrite: 10,
      totalTokens: 160,
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0.0123 },
    });
  });

  it("reports each message's spend exactly once", async () => {
    const { tools } = boot({ reportUsage: true });
    runSpending({ input: 100, output: 50, cacheWrite: 10, cost: 0.0123 });

    await spawn(tools, "tc-1");
    runSpendingNothing();
    const second = await spawn(tools, "tc-2");

    // Not "the second result is smaller" — a pool that failed to reset would
    // re-report the first run's spend here, and the parent's totals would climb
    // on every later tool call for work that happened once.
    expect(second.usage).toBeUndefined();
  });

  it("carries what a later run spends on the later result", async () => {
    const { tools } = boot({ reportUsage: true });
    runSpending({ input: 100, output: 50, cacheWrite: 10, cost: 0.01 });
    await spawn(tools, "tc-1");

    runSpending({ input: 7, output: 3, cacheWrite: 0, cost: 0.002 });
    const second = await spawn(tools, "tc-2");

    expect(second.usage.totalTokens).toBe(10);
    expect(second.usage.cost.total).toBe(0.002);
  });

  it("attaches nothing when the setting is off", async () => {
    const { tools } = boot({ reportUsage: false });
    runSpending({ input: 100, output: 50, cacheWrite: 10, cost: 0.0123 });

    const result = await spawn(tools, "tc-1");

    expect(result.usage).toBeUndefined();
    // And the text result is untouched — the setting must not change what the
    // orchestrator reads.
    expect(result.content[0].text).toContain("Agent completed");
  });

  it("defaults to off", async () => {
    const { tools } = boot({});
    runSpending({ input: 100, output: 50, cacheWrite: 10, cost: 0.0123 });

    expect((await spawn(tools, "tc-1")).usage).toBeUndefined();
  });

  it("attaches nothing to a call with no tool-call id, and loses none of it", async () => {
    // The `@handle` mention path: a fork of the conversation calls the
    // registered tool with `undefined`, and its session is discarded. Usage hung
    // on that result is spend the user paid for and nobody counted.
    const { tools } = boot({ reportUsage: true });
    runSpending({ input: 100, output: 50, cacheWrite: 10, cost: 0.0123 });

    const cloned = await spawn(tools, undefined);
    expect(cloned.usage).toBeUndefined();

    // It was not dropped — the next result the real session gets carries it.
    runSpendingNothing();
    const real = await spawn(tools, "tc-2");
    expect(real.usage.cost.total).toBe(0.0123);
    expect(real.usage.totalTokens).toBe(160);
  });

  it("attaches nothing when a run produced no usage at all", async () => {
    const { tools } = boot({ reportUsage: true });
    runSpendingNothing();

    expect((await spawn(tools, "tc-1")).usage).toBeUndefined();
  });

  it("reports an unpriced model's tokens with a zero cost rather than dropping them", async () => {
    const { tools } = boot({ reportUsage: true });
    runSpending({ input: 100, output: 50, cacheWrite: 10, cost: 0 });

    const result = await spawn(tools, "tc-1");

    expect(result.usage.totalTokens).toBe(160);
    expect(result.usage.cost.total).toBe(0);
  });

  it("reports spend through get_subagent_result too", async () => {
    // Background agents finish with no tool result of their own to ride on;
    // whichever of our tools is called next has to carry them.
    const { tools } = boot({ reportUsage: true });
    runSpending({ input: 100, output: 50, cacheWrite: 10, cost: 0.0123 });

    await spawn(tools, undefined);   // spend accumulates, nothing attached
    await flush();

    const result = await tools.get("get_subagent_result").execute(
      "tc-2", { agent_id: "nope" }, undefined, undefined, ctx(),
    );

    expect(result.usage.cost.total).toBe(0.0123);
  });
});
