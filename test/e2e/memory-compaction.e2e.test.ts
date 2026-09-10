import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setImmediate as nextTick } from "node:timers/promises";
import { type FauxResponseStep, fauxAssistantMessage, fauxToolCall } from "@earendil-works/pi-ai";
import { type CustomMessage, type ExtensionAPI, type ExtensionContext, getPackageDir } from "@earendil-works/pi-coding-agent";
import { describe, expect, it } from "vitest";
import { encodeCwd } from "../../src/output-file.js";
import type { AgentDetails } from "../../src/ui/agent-widget.js";
import { readJournal } from "../../src/workflow/journal.js";
import { agentCall, agentToolResults, type ManagerHandle, runPrintMode } from "../helpers/print-mode-runner.js";

const SENTINEL = "MEMORY-COMPACTION-FINAL-SENTINEL";
const OBSERVATION = "The child must finish the pending task after reading the large result.";
const CONTROL_KEY = Symbol.for("pi-subagents:test:memory-compaction");
const memoryRoot = process.env.PI_OM_TEST_ROOT;

function deferred() {
  let release!: () => void;
  const promise = new Promise<void>(resolve => { release = resolve; });
  return { promise, release };
}

type MemoryRuntime = Record<"enabled" | "configLoaded" | "compactInFlight" | "compactHookInFlight", boolean> & {
  config: { compactAtContextTokens: number; tailTokens: number } & Record<"passive", boolean>;
  memoryRoot: string;
  lastCompactionObserverWait?: string;
  lastWorkerError?: string;
  trackObserverTask(task: Promise<void>): void;
};

function journalPaths(cwd: string): string[] {
  const root = join(tmpdir(), `pi-subagents-${process.getuid?.() ?? 0}`, encodeCwd(cwd));
  if (!existsSync(root)) return [];
  return readdirSync(root).flatMap(session => {
    const tasks = join(root, session, "tasks");
    return existsSync(tasks)
      ? readdirSync(tasks).filter(file => file.endsWith(".workflow.jsonl")).map(file => join(tasks, file))
      : [];
  });
}

async function checkpoint() {
  for (let index = 0; index < 20; index++) await nextTick();
}

async function wait(promise: Promise<unknown>, label: string) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([promise, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Timed out waiting for ${label}`)), 8000);
    })]);
  } finally {
    clearTimeout(timer);
  }
}

async function scenario(mode: "agent" | "workflow", outcome: "compact" | "success" | "error" | "cancel") {
  if (!memoryRoot) throw new Error("Set PI_OM_TEST_ROOT to the read-only observational-memory extension directory.");
  const cwd = mkdtempSync(join(tmpdir(), "subagents-memory-regression-"));
  const observer = deferred();
  const beforeCompact = deferred();
  const childStarted = deferred();
  const finalStarted = deferred();
  const compacted = deferred();
  const finalRelease = deferred();
  const finalEnded = deferred();
  const controller = new AbortController();
  const errors: string[] = [];
  const assistantStops: string[] = [];
  const pressures: number[] = [];
  const compactions: Array<{ summary: string; details?: unknown }> = [];
  const resumptions: Array<Pick<CustomMessage, "customType" | "display">> = [];
  let runtime: MemoryRuntime | undefined;
  let childContext: ExtensionContext | undefined;
  let childCalls = 0;
  let isInvocationSettled = false;
  let isFinalReleased = false;
  let result: Awaited<ReturnType<typeof runPrintMode>> | undefined;

  mkdirSync(join(cwd, ".pi", "agents"), { recursive: true });
  writeFileSync(join(cwd, ".pi", "settings.json"), JSON.stringify({
    compaction: { enabled: false, keepRecentTokens: 64 }, retry: { enabled: false },
  }));
  writeFileSync(join(cwd, ".pi", "subagents.json"), JSON.stringify({ workflowsEnabled: true }));
  writeFileSync(join(cwd, "large.txt"), "large tool result\n".repeat(2000));
  const fixture = join(cwd, "memory-fixture.ts");
  writeFileSync(fixture, [
    `import { Runtime } from ${JSON.stringify(join(memoryRoot, "src/runtime.ts"))};`,
    `import { registerCompactionTrigger } from ${JSON.stringify(join(memoryRoot, "src/hooks/compaction-trigger.ts"))};`,
    `import { registerCompactionHook } from ${JSON.stringify(join(memoryRoot, "src/hooks/compaction-hook.ts"))};`,
    "export default function (pi) {",
    "  const runtime = new Runtime();",
    '  globalThis[Symbol.for("pi-subagents:test:memory-compaction")](pi, runtime);',
    "  registerCompactionTrigger(pi, runtime);",
    "  registerCompactionHook(pi, runtime);",
    "}",
  ].join("\n"));
  writeFileSync(join(cwd, ".pi", "agents", "memory-test.md"), [
    "---", "name: memory-test", "description: Deterministic memory regression child",
    "tools: read", "skills: false", "persist_session: false", "prompt_mode: replace",
    `extensions: [${JSON.stringify(fixture)}]`, "---", "Read the file, then return the final answer.",
  ].join("\n"));

  (globalThis as Record<symbol, unknown>)[CONTROL_KEY] = (pi: ExtensionAPI, memory: MemoryRuntime) => {
    runtime = memory;
    memory.enabled = true;
    memory.configLoaded = true;
    memory.config.compactAtContextTokens = outcome === "compact" || outcome === "cancel" ? 5000 : 1_000_000;
    memory.config.tailTokens = 64;
    memory.config.passive = false;
    memory.memoryRoot = join(cwd, "memory");
    memory.trackObserverTask(observer.promise.then(() => {
      const user = childContext?.sessionManager.getBranch().find(entry =>
        entry.type === "message" && entry.message.role === "user");
      if (!user) return;
      pi.appendEntry("om.observations.recorded", {
        coversUpToId: user.id,
        observations: [{ timestamp: "2026-01-01T00:00:00", content: OBSERVATION, tokenCount: 20 }],
      });
    }));
    pi.on("session_start", (_event, ctx) => { childContext = ctx; });
    pi.on("tool_call", (_event, ctx) => { pressures.push(ctx.getContextUsage()?.tokens ?? -1); });
    pi.on("turn_end", (event, ctx) => {
      if (event.toolResults.length) pressures.push(ctx.getContextUsage()?.tokens ?? -1);
    });
    pi.on("session_before_compact", () => { beforeCompact.release(); });
    pi.on("session_compact", event => {
      compactions.push(event.compactionEntry);
      compacted.release();
    });
    pi.on("session_compact_failed", event => { errors.push(event.errorMessage ?? "Compaction cancelled"); });
    pi.on("message_end", event => {
      if (event.message.role === "custom") resumptions.push({ customType: event.message.customType, display: event.message.display });
      if (event.message.role === "assistant") assistantStops.push(event.message.stopReason);
      if (event.message.role === "assistant" && event.message.content.some(block =>
        block.type === "text" && block.text === SENTINEL)) finalEnded.release();
    });
  };

  const script = [
    'export const meta = { name: "memory-regression", description: "Return the child answer" };',
    'const answer = await agent("Read large.txt and finish", { agentType: "memory-test", label: "memory" });',
    "return answer;",
  ].join("\n");
  const respond: FauxResponseStep = async (context, options) => {
      const isParent = context.tools?.some(tool => tool.name === "Agent");
      if (isParent) {
        const isDispatched = context.messages.some(message => message.role === "toolResult" &&
          message.toolName === (mode === "agent" ? "Agent" : "SubagentWorkflow"));
        if (isDispatched) return fauxAssistantMessage("Parent finished.");
        return fauxAssistantMessage(mode === "agent"
          ? agentCall({ prompt: "Read large.txt and finish", description: "memory", subagent_type: "memory-test", run_in_background: false })
          : fauxToolCall("SubagentWorkflow", { script }), { stopReason: "toolUse" });
      }
      childCalls++;
      childStarted.release();
      if (outcome === "error") return fauxAssistantMessage([], {
        stopReason: "error", errorMessage: "DETERMINISTIC-PROVIDER-FAILURE",
      });
      if ((outcome === "compact" || outcome === "success" || outcome === "cancel") && childCalls === 1) return fauxAssistantMessage(
        fauxToolCall("read", { path: "large.txt" }), { stopReason: "toolUse" });
      if (outcome !== "compact" || compactions.length > 0) finalStarted.release();
      const signal = options?.signal;
      let onAbort = () => {};
      try {
        await Promise.race([finalRelease.promise, new Promise<void>(resolve => {
          onAbort = resolve;
          if (signal?.aborted) resolve();
          else signal?.addEventListener("abort", onAbort, { once: true });
        })]);
        signal?.throwIfAborted();
        return fauxAssistantMessage(SENTINEL);
      } finally {
        signal?.removeEventListener("abort", onAbort);
      }
  };
  const invocation = runPrintMode({
    cwd, prompt: "Delegate the task", live: false, hold: false, signal: controller.signal,
    timeoutMs: 20_000, steps: Array.from({ length: 16 }, () => respond),
  }).then(value => {
    isInvocationSettled = true;
    result = value;
    return value;
  });

  try {
    await wait(childStarted.promise, "child start");
    if (outcome === "compact" || outcome === "cancel") {
      await wait(beforeCompact.promise, "automatic compaction");
      const manager = (globalThis as Record<symbol, unknown>)[Symbol.for("pi-subagents:manager")] as ManagerHandle;
      await checkpoint();
      const journalsWhileHeld = journalPaths(cwd).flatMap(readJournal);
      const pending = {
        isInvocationPending: !isInvocationSettled,
        isChildPending: manager.hasRunning(),
        journalEntries: journalsWhileHeld.length,
      };
      expect(runtime?.compactHookInFlight).toBe(true);
      expect(runtime?.lastCompactionObserverWait).toBe("waited");
      expect(pressures[0]).toBeLessThan(5000);
      expect(pressures[1]).toBeGreaterThanOrEqual(5000);
      expect(compactions).toHaveLength(0);
      expect.soft(pending.isChildPending, JSON.stringify({ pending, journalsWhileHeld })).toBe(true);
      if (mode === "agent") expect.soft(pending.isInvocationPending, "Agent invocation settled during observer wait").toBe(true);
      expect.soft(journalsWhileHeld, "Workflow must not journal a result during observer wait").toEqual([]);
      if (outcome === "cancel") controller.abort();
      observer.release();
      if (outcome === "compact") {
        await wait(compacted.promise, "memory summary");
        await wait(finalStarted.promise, "resumed response");
        await checkpoint();
        expect(compactions).toHaveLength(1);
        expect(compactions[0].details).toMatchObject({ type: "om.folded" });
        expect(compactions[0].summary).toContain(OBSERVATION);
        expect(resumptions).toHaveLength(0);
        expect.soft(manager.hasRunning(), "Child must remain pending until the final model response").toBe(true);
        isFinalReleased = true;
        finalRelease.release();
        await wait(finalEnded.promise, "final sentinel");
        await checkpoint();
        expect(errors).toEqual([]);
        expect(runtime?.lastWorkerError).toBeUndefined();
        console.log(JSON.stringify({ mode, pressures, pending, compactions: compactions.length,
          resumptions, childCalls, assistantStops, journalsWhileHeld, isFinalReleased }));
      }
    } else if (outcome === "success") {
      await wait(finalStarted.promise, "final response");
      finalRelease.release();
    }
    result = await invocation;
    await result.manager?.waitForAll();
    await checkpoint();
    if (outcome === "error" || outcome === "cancel") {
      const toolText = agentToolResults(result.parentSession).join("\n");
      if (outcome === "error") expect(toolText).toContain("Agent failed: DETERMINISTIC-PROVIDER-FAILURE");
      else {
        const message = result.parentSession.messages.find(message => message.role === "toolResult" && message.toolName === "Agent");
        expect(message?.role).toBe("toolResult");
        const details = message?.role === "toolResult" ? message.details as AgentDetails : undefined;
        expect(result.manager?.getRecord(details?.agentId ?? "")).toMatchObject({ status: "stopped" });
        expect(controller.signal.aborted).toBe(true);
        expect(assistantStops).toContain("error");
        expect(toolText).not.toContain(SENTINEL);
      }
      expect(compactions).toHaveLength(0);
      expect(resumptions).toHaveLength(0);
      return;
    }
    if (outcome === "success") {
      expect(compactions).toHaveLength(0);
      expect(resumptions).toHaveLength(0);
    }
    if (mode === "workflow") {
      const journals = journalPaths(cwd).flatMap(readJournal);
      expect(journals).toHaveLength(1);
      expect(journals[0]).toMatchObject({ ok: true, text: SENTINEL });
    } else {
      expect(agentToolResults(result.parentSession).join("\n")).toContain(SENTINEL);
    }
  } finally {
    observer.release();
    await checkpoint();
    finalRelease.release();
    controller.abort();
    result ??= await invocation;
    await result.dispose();
    delete (globalThis as Record<symbol, unknown>)[CONTROL_KEY];
    rmSync(cwd, { recursive: true, force: true });
    rmSync(join(tmpdir(), `pi-subagents-${process.getuid?.() ?? 0}`, encodeCwd(cwd)), { recursive: true, force: true });
  }
}

describe.skipIf(!memoryRoot)("memory compaction recovery on real Pi 0.85.1 (requires PI_OM_TEST_ROOT)", () => {
  it("loads the pinned runtime", () => {
    const runtimeEntry = getPackageDir();
    const version = JSON.parse(readFileSync(join(runtimeEntry, "package.json"), "utf8")).version;
    console.log(JSON.stringify({ runtimeEntry, version, memoryRoot }));
    expect(version).toBe("0.85.1");
  });
  for (const mode of ["agent", "workflow"] as const) {
    it(`${mode}: returns the sentinel without compaction`, () => scenario(mode, "success"), 30_000);
    it(`${mode}: remains pending through automatic memory compaction and returns the sentinel`, () => scenario(mode, "compact"), 30_000);
  }
  it("preserves a real provider failure", () => scenario("agent", "error"), 30_000);
  it("preserves explicit child cancellation", () => scenario("agent", "cancel"), 30_000);
});
