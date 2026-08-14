/**
 * agent-mention-wiring.test.ts — the `input` hook that routes `@handle message`
 * to a subagent.
 *
 * This handler sits in front of every prompt the user types, and returning
 * `handled` discards the text. So the two failures that matter are opposite:
 * claiming input that was meant for the main model (silently eating it), and
 * failing to claim a real mention (sending "@explore fix it" to the main model
 * as if it were prose). Each case below pins one side.
 *
 * Booted through the real extension so the assertions cover the actual wiring —
 * handle assignment in AgentManager, resolution, and the steer/resume split.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/agent-runner.js", async () => {
  const actual = await vi.importActual<typeof import("../src/agent-runner.js")>("../src/agent-runner.js");
  return { ...actual, runAgent: vi.fn(), resumeAgent: vi.fn() };
});

import { resumeAgent, runAgent } from "../src/agent-runner.js";
import subagentsExtension from "../src/index.js";
import { ctx, flush, type Hermetic, hermeticDir, makePi, textOf } from "./helpers/boot-extension.js";

let hermetic: Hermetic | undefined;

beforeEach(() => {
  vi.mocked(runAgent).mockReset();
  vi.mocked(resumeAgent).mockReset();
});

afterEach(() => {
  hermetic?.restore();
  hermetic = undefined;
});

/** Enough of an AgentSession for the manager's and index's hooks. */
function fakeSession(overrides: Record<string, unknown> = {}) {
  return {
    steer: vi.fn().mockResolvedValue(undefined),
    dispose: vi.fn(),
    subscribe: vi.fn(() => () => {}),
    messages: [],
    getActiveToolNames: vi.fn(() => []),
    ...overrides,
  } as any;
}

/** A runAgent that never settles, so the agent stays "running". */
function heldRun(session: any) {
  vi.mocked(runAgent).mockImplementation(
    (_ctx: any, _type: any, _prompt: any, opts: any) =>
      new Promise(() => {
        opts.onSessionCreated?.(session);
      }) as any,
  );
}

/** A runAgent that finishes immediately, leaving a resumable record behind. */
function finishedRun(session: any) {
  vi.mocked(runAgent).mockResolvedValue({
    responseText: "first answer",
    session,
    aborted: false,
    steered: false,
    failure: undefined,
  } as any);
}

/** Boot the real extension. `outputTranscript: false` keeps the run off disk. */
function boot(settings: Record<string, unknown> = {}) {
  hermetic = hermeticDir({ settings: { outputTranscript: false, ...settings } });
  const booted = makePi();
  subagentsExtension(booted.pi);
  return booted;
}

async function spawnBackground(tools: Map<string, any>, subagent_type = "Explore"): Promise<string> {
  const r = await tools.get("Agent").execute(
    "tc-spawn",
    { prompt: "go", description: "find flaky tests", subagent_type, run_in_background: true },
    undefined,
    undefined,
    ctx(),
  );
  return /Agent ID: (\S+)/.exec(textOf(r))![1];
}

const send = (lifecycle: Map<string, any>, text: string, source = "interactive") =>
  lifecycle.get("input")({ type: "input", text, source }, ctx());

describe("messaging a running agent", () => {
  it("steers it, announces it, and spends no main-model turn", async () => {
    const { pi, tools, lifecycle } = boot();
    const session = fakeSession();
    heldRun(session);

    await spawnBackground(tools);
    await flush();

    const uiCtx = ctx();
    const result = await lifecycle.get("input")(
      { type: "input", text: "@explore also check the RPC path", source: "interactive" },
      uiCtx,
    );

    expect(result).toEqual({ action: "handled" });
    expect(session.steer).toHaveBeenCalledWith("also check the RPC path");
    expect(uiCtx.ui.notify).toHaveBeenCalledWith("Sent to @explore", "info");
    expect(pi.sendMessage).not.toHaveBeenCalled();

    await lifecycle.get("session_shutdown")?.();
  });

  it("un-consumes the result so the agent's reply is still relayed", async () => {
    // get_subagent_result may already have read this agent's last answer, which
    // suppresses its completion notification. Without the reset, the reply to
    // the message just sent would never reach the main loop.
    const { tools, lifecycle } = boot();
    heldRun(fakeSession());

    const id = await spawnBackground(tools);
    await flush();
    const record = (globalThis as any)[Symbol.for("pi-subagents:manager")].getRecord(id);
    record.resultConsumed = true;

    await send(lifecycle, "@explore keep going");

    expect(record.resultConsumed).toBe(false);

    await lifecycle.get("session_shutdown")?.();
  });

  it("addresses same-type siblings by their numbered handles", async () => {
    const { tools, lifecycle } = boot();
    const first = fakeSession();
    const second = fakeSession();
    vi.mocked(runAgent)
      .mockImplementationOnce((_c: any, _t: any, _p: any, o: any) => new Promise(() => o.onSessionCreated?.(first)) as any)
      .mockImplementationOnce((_c: any, _t: any, _p: any, o: any) => new Promise(() => o.onSessionCreated?.(second)) as any);

    await spawnBackground(tools);
    await spawnBackground(tools);
    await flush();

    await send(lifecycle, "@explore-2 you take the second half");

    expect(second.steer).toHaveBeenCalledWith("you take the second half");
    expect(first.steer).not.toHaveBeenCalled();

    await lifecycle.get("session_shutdown")?.();
  });
});

describe("messaging a finished agent", () => {
  it("resumes it from its session in the background", async () => {
    const { lifecycle, tools } = boot();
    const session = fakeSession();
    finishedRun(session);
    vi.mocked(resumeAgent).mockResolvedValue({ text: "second answer", failure: undefined } as any);

    await spawnBackground(tools);
    await flush();

    const uiCtx = ctx();
    const result = await lifecycle.get("input")(
      { type: "input", text: "@explore anything else?", source: "interactive" },
      uiCtx,
    );

    expect(result).toEqual({ action: "handled" });
    expect(resumeAgent).toHaveBeenCalledWith(session, "anything else?", expect.anything());
    expect(uiCtx.ui.notify).toHaveBeenCalledWith("Resuming @explore", "info");

    await lifecycle.get("session_shutdown")?.();
  });

  it("honours the agent's output_transcript: false when resuming", async () => {
    // The frontmatter flag overrides the project default (README, Persistent
    // settings), and record.outputFile is the sole gate every downstream
    // consumer keys off — so a resume must not be the path that re-enables a
    // transcript the agent's author switched off.
    hermetic = hermeticDir({
      settings: { outputTranscript: true },
      agentFiles: { quiet: "---\ndescription: writes no transcript\noutput_transcript: false\n---\nbody" },
    });
    const booted = makePi();
    subagentsExtension(booted.pi);
    finishedRun(fakeSession());
    vi.mocked(resumeAgent).mockResolvedValue({ text: "second answer", failure: undefined } as any);

    const id = await spawnBackground(booted.tools, "quiet");
    await flush();
    const record = booted.pi.__manager?.getRecord?.(id)
      ?? (globalThis as any)[Symbol.for("pi-subagents:manager")].getRecord(id);
    expect(record.outputFile).toBeUndefined(); // spawn honoured it

    await send(booted.lifecycle, "@quiet anything else?");

    expect(record.outputFile).toBeUndefined();

    await booted.lifecycle.get("session_shutdown")?.();
  });

  it("does not attribute the new answer to the tool call that spawned it", async () => {
    // The completion notification carries `<tool-use-id>`. A mention-resume has
    // no tool call behind it, so leaving the spawning call's id on the record
    // would point the orchestrator's new result at a call answered runs ago.
    const { pi, lifecycle, tools } = boot();
    finishedRun(fakeSession());
    vi.mocked(resumeAgent).mockResolvedValue({ text: "second answer", failure: undefined } as any);

    await spawnBackground(tools);
    await flush();
    vi.mocked(pi.sendMessage).mockClear();

    await send(lifecycle, "@explore anything else?");
    await new Promise(r => setTimeout(r, 400));

    const [message] = vi.mocked(pi.sendMessage).mock.calls[0];
    expect(message.content).toContain("second answer");
    expect(message.content).not.toContain("<tool-use-id>");

    await lifecycle.get("session_shutdown")?.();
  });

  it("relays the resumed answer through the ordinary completion notification", async () => {
    // The whole point of resuming in the background rather than inline: the
    // main model has to be told the answer came back, or the reply is stranded
    // in the agent's transcript.
    const { pi, lifecycle, tools } = boot();
    finishedRun(fakeSession());
    vi.mocked(resumeAgent).mockResolvedValue({ text: "second answer", failure: undefined } as any);

    await spawnBackground(tools);
    await flush();
    vi.mocked(pi.sendMessage).mockClear();

    await send(lifecycle, "@explore anything else?");
    await new Promise(r => setTimeout(r, 400));

    expect(pi.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ customType: "subagent-notification", content: expect.stringContaining("second answer") }),
      expect.objectContaining({ triggerTurn: true }),
    );

    await lifecycle.get("session_shutdown")?.();
  });
});

describe("stacking the suggestion provider on pi's", () => {
  /** A session_start ctx with the UI surface the registration path touches. */
  const uiCtx = (mode: string) =>
    ctx({
      mode,
      hasUI: mode !== "print",
      ui: {
        setStatus: vi.fn(),
        setWidget: vi.fn(),
        notify: vi.fn(),
        onTerminalInput: vi.fn(() => vi.fn()),
        addAutocompleteProvider: vi.fn(),
      },
    });

  it("registers exactly once, however often session_start fires", async () => {
    // pi appends wrappers to a list it never prunes, so a second registration
    // would layer a duplicate provider on top of the first.
    const { lifecycle } = boot();
    const first = uiCtx("tui");
    const second = uiCtx("tui");

    await lifecycle.get("session_start")({ type: "session_start" }, first);
    await lifecycle.get("session_start")({ type: "session_start" }, second);

    expect(first.ui.addAutocompleteProvider).toHaveBeenCalledTimes(1);
    expect(second.ui.addAutocompleteProvider).not.toHaveBeenCalled();

    await lifecycle.get("session_shutdown")?.();
  });

  it("stays out of non-TUI modes, which have no editor to complete into", async () => {
    const { lifecycle } = boot();
    const rpc = uiCtx("rpc");

    await lifecycle.get("session_start")({ type: "session_start" }, rpc);

    expect(rpc.ui.addAutocompleteProvider).not.toHaveBeenCalled();

    await lifecycle.get("session_shutdown")?.();
  });

  it("hands pi a provider that answers a live handle", async () => {
    const { tools, lifecycle } = boot();
    heldRun(fakeSession());
    const tui = uiCtx("tui");

    await lifecycle.get("session_start")({ type: "session_start" }, tui);
    await spawnBackground(tools);
    await flush();

    const factory = vi.mocked(tui.ui.addAutocompleteProvider).mock.calls[0][0] as any;
    const provider = factory({ getSuggestions: vi.fn().mockResolvedValue(null), applyCompletion: vi.fn() });
    const result = await provider.getSuggestions(["@ex"], 0, 3, { signal: new AbortController().signal });

    expect(result.items.map((i: any) => i.value)).toEqual(["@explore"]);

    await lifecycle.get("session_shutdown")?.();
  });
});

describe("mentioning an agent that has never run", () => {
  it("starts one, using the message as its prompt", async () => {
    const { lifecycle } = boot();
    heldRun(fakeSession());

    const uiCtx = ctx();
    const result = await lifecycle.get("input")(
      { type: "input", text: "@explore find every retry marker", source: "interactive" },
      uiCtx,
    );

    expect(result).toEqual({ action: "handled" });
    expect(runAgent).toHaveBeenCalledWith(
      expect.anything(),
      "Explore",
      "find every retry marker",
      expect.anything(),
    );
    expect(uiCtx.ui.notify).toHaveBeenCalledWith("Started @explore", "info");

    await lifecycle.get("session_shutdown")?.();
  });

  it("leaves model, thinking and max turns to the agent's own config", async () => {
    // runAgent resolves all three from the config when the spawn omits them,
    // so passing anything here would override frontmatter the user wrote.
    const { lifecycle } = boot();
    heldRun(fakeSession());

    await send(lifecycle, "@explore go");

    const opts = vi.mocked(runAgent).mock.calls[0][3] as any;
    expect(opts.model).toBeUndefined();
    expect(opts.thinkingLevel).toBeUndefined();
    expect(opts.maxTurns).toBeUndefined();

    await lifecycle.get("session_shutdown")?.();
  });

  it("runs it in the background so the prompt is not blocked", async () => {
    const { lifecycle } = boot();
    heldRun(fakeSession());

    await send(lifecycle, "@explore go");
    const record = (globalThis as any)[Symbol.for("pi-subagents:manager")]
      .getRecord(vi.mocked(runAgent).mock.calls[0][3].agentId);

    expect(record.isBackground).toBe(true);
    expect(record.description).toBe("go");

    await lifecycle.get("session_shutdown")?.();
  });

  it("messages the running agent rather than starting a second one", async () => {
    const { lifecycle } = boot();
    const session = fakeSession();
    heldRun(session);

    await send(lifecycle, "@explore first task");
    await flush();
    vi.mocked(runAgent).mockClear();

    await send(lifecycle, "@explore actually do this instead");

    expect(runAgent).not.toHaveBeenCalled();
    expect(session.steer).toHaveBeenCalledWith("actually do this instead");

    await lifecycle.get("session_shutdown")?.();
  });

  it("reports a failed start instead of silently doing nothing", async () => {
    const { lifecycle } = boot();
    vi.mocked(runAgent).mockImplementation(() => {
      throw new Error("worktree unavailable");
    });

    const uiCtx = ctx();
    const result = await lifecycle.get("input")(
      { type: "input", text: "@explore go", source: "interactive" },
      uiCtx,
    );

    expect(result).toEqual({ action: "handled" });
    expect(uiCtx.ui.notify).toHaveBeenCalledWith(
      expect.stringContaining("Could not start @explore"),
      "error",
    );

    await lifecycle.get("session_shutdown")?.();
  });
});

describe("input that is not a mention", () => {
  it("passes an unknown handle to the main model rather than eating it", async () => {
    const { lifecycle } = boot();

    expect(await send(lifecycle, "@nosuchagent hello")).toEqual({ action: "continue" });
  });

  it("passes a bare handle to the main model", async () => {
    const { tools, lifecycle } = boot();
    const session = fakeSession();
    heldRun(session);

    await spawnBackground(tools);
    await flush();

    expect(await send(lifecycle, "@explore")).toEqual({ action: "continue" });
    expect(session.steer).not.toHaveBeenCalled();

    await lifecycle.get("session_shutdown")?.();
  });

  it("leaves a leading file attachment alone", async () => {
    const { tools, lifecycle } = boot();
    heldRun(fakeSession());

    await spawnBackground(tools);
    await flush();

    expect(await send(lifecycle, "@src/index.ts summarize this")).toEqual({ action: "continue" });

    await lifecycle.get("session_shutdown")?.();
  });

  it("ignores input the extension layer submitted", async () => {
    // pi.sendMessage text arrives through the same hook; a notification that
    // happened to start with @something must not be re-routed at an agent.
    const { tools, lifecycle } = boot();
    const session = fakeSession();
    heldRun(session);

    await spawnBackground(tools);
    await flush();

    expect(await send(lifecycle, "@explore relayed text", "extension")).toEqual({ action: "continue" });
    expect(session.steer).not.toHaveBeenCalled();

    await lifecycle.get("session_shutdown")?.();
  });

  it("falls through entirely when mentions are disabled", async () => {
    const { tools, lifecycle } = boot({ agentMentions: false });
    const session = fakeSession();
    heldRun(session);

    await spawnBackground(tools);
    await flush();

    expect(await send(lifecycle, "@explore do this")).toEqual({ action: "continue" });
    expect(session.steer).not.toHaveBeenCalled();

    await lifecycle.get("session_shutdown")?.();
  });

  it("disabled also blocks starting an agent, not just messaging one", async () => {
    // The guard sits ahead of the parse, so every action is covered — but the
    // start branch is the one that would otherwise spawn work nobody asked for.
    const { lifecycle } = boot({ agentMentions: false });
    heldRun(fakeSession());

    expect(await send(lifecycle, "@explore go")).toEqual({ action: "continue" });
    expect(runAgent).not.toHaveBeenCalled();

    await lifecycle.get("session_shutdown")?.();
  });

  it("disabled also blocks resuming a finished agent", async () => {
    const { tools, lifecycle } = boot({ agentMentions: false });
    finishedRun(fakeSession());

    await spawnBackground(tools);
    await flush();
    vi.mocked(resumeAgent).mockClear();

    expect(await send(lifecycle, "@explore anything else?")).toEqual({ action: "continue" });
    expect(resumeAgent).not.toHaveBeenCalled();

    await lifecycle.get("session_shutdown")?.();
  });

  it("the suggestion popup goes quiet too, so @ means only 'attach a file'", async () => {
    const { tools, lifecycle } = boot({ agentMentions: false });
    heldRun(fakeSession());
    const tui = ctx({
      mode: "tui",
      hasUI: true,
      ui: {
        setStatus: vi.fn(), setWidget: vi.fn(), notify: vi.fn(),
        onTerminalInput: vi.fn(() => vi.fn()), addAutocompleteProvider: vi.fn(),
      },
    });

    await lifecycle.get("session_start")({ type: "session_start" }, tui);
    await spawnBackground(tools);
    await flush();

    const factory = vi.mocked(tui.ui.addAutocompleteProvider).mock.calls[0][0] as any;
    const files = { items: [{ value: "@src/x.ts", label: "src/x.ts" }], prefix: "@ex" };
    const provider = factory({ getSuggestions: vi.fn().mockResolvedValue(files), applyCompletion: vi.fn() });

    expect(await provider.getSuggestions(["@ex"], 0, 3, { signal: new AbortController().signal })).toBe(files);

    await lifecycle.get("session_shutdown")?.();
  });
});
