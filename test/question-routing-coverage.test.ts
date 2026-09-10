import { EventEmitter } from "node:events";
import type { ExtensionContext, ToolDefinition } from "@earendil-works/pi-coding-agent";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { captureParentQuestionContext, createAskParentQuestionTool, type ParentQuestionContext } from "../src/ask-parent-question.js";
import { askUserQuestion } from "../src/ask-user-question.js";

const mocks = vi.hoisted(() => ({
  createAgentSession: vi.fn(),
  reload: vi.fn(async () => {}),
  loaderOptions: [] as Array<{ appendSystemPromptOverride: () => string[] }>,
}));

vi.mock("@earendil-works/pi-coding-agent", () => ({
  defineTool: (definition: unknown) => definition,
  createAgentSession: mocks.createAgentSession,
  DefaultResourceLoader: class {
    constructor(options: { appendSystemPromptOverride: () => string[] }) {
      mocks.loaderOptions.push(options);
    }
    reload = mocks.reload;
  },
  getAgentDir: () => "/agent",
  SessionManager: { inMemory: () => ({}) },
}));

interface ExecutableTool {
  execute(id: string, params: unknown, signal: AbortSignal | undefined, update: undefined, context: unknown): Promise<unknown>;
}

const question = "Which color?";
const pingChannel = "ask-user-question:rpc:ping";
const askChannel = "ask-user-question:rpc:ask";
const parentEvents = { on: vi.fn(), emit: vi.fn() };

function parentResult(details: object) {
  return { content: [{ type: "text", text: JSON.stringify(details) }], details };
}

function helperFixture(context: ParentQuestionContext | undefined = {
  cwd: "/repo",
  conversation: "User chose blue.",
  modelRegistry: {} as ParentQuestionContext["modelRegistry"],
}) {
  const unsubscribe = vi.fn();
  const session = {
    prompt: vi.fn<(prompt: string) => Promise<void>>(async () => {}),
    subscribe: vi.fn<(listener: (event: unknown) => void) => () => void>(() => unsubscribe),
    abort: vi.fn(async () => {}),
    dispose: vi.fn(),
  };
  const onUsage = vi.fn();
  mocks.createAgentSession.mockResolvedValue({ session });
  const tool = createAskParentQuestionTool({ events: parentEvents } as never, context, onUsage) as unknown as ExecutableTool;
  return { session, unsubscribe, onUsage, tool };
}

function serviceFixture(respond: (channel: string, request: { requestId: string; params?: unknown; signal?: AbortSignal }) => unknown) {
  const bus = new EventEmitter();
  const calls: Array<{ channel: string; requestId: string; params?: unknown; signal?: AbortSignal }> = [];
  const events = {
    on(channel: string, listener: (value: unknown) => void) {
      bus.on(channel, listener);
      return () => { bus.off(channel, listener); };
    },
    emit(channel: string, payload: unknown) {
      bus.emit(channel, payload);
    },
  };
  for (const channel of [pingChannel, askChannel]) {
    bus.on(channel, (request: { requestId: string; params?: unknown; signal?: AbortSignal }) => {
      calls.push({ channel, ...request });
      const response = respond(channel, request);
      if (response !== undefined) bus.emit(`${channel}:reply:${request.requestId}`, response);
    });
  }
  return {
    events,
    calls,
    replyListeners: () => bus.eventNames().filter(name => String(name).includes(":reply:")),
  };
}

function serviceResult(details: Record<string, unknown> = {}, content: unknown = [{ type: "text", text: "User answered: blue" }]) {
  return {
    content,
    details: { status: "answered", question, mode: "text", answers: [{ type: "text", label: "blue", value: "blue" }], ...details },
  };
}

function localResult(status: string, message: string, mode = "text") {
  return {
    content: [{ type: "text", text: message }],
    details: { status, question, mode, answers: [], message },
    ...(status === "error" ? { isError: true } : {}),
  };
}

beforeEach(() => {
  mocks.createAgentSession.mockReset();
  mocks.reload.mockReset().mockResolvedValue(undefined);
  mocks.loaderOptions.length = 0;
  parentEvents.on.mockClear();
  parentEvents.emit.mockClear();
});
afterEach(() => {
  expect(parentEvents.on).not.toHaveBeenCalled();
  expect(parentEvents.emit).not.toHaveBeenCalled();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("parent helper complete outcomes", () => {
  it.each([undefined, ""])("returns the complete result for missing parent context: %j", async conversation => {
    const context = conversation === undefined ? undefined : {
      cwd: "/repo", conversation, modelRegistry: {} as ParentQuestionContext["modelRegistry"],
    };
    const tool = createAskParentQuestionTool({ events: parentEvents } as never, context) as unknown as ExecutableTool;
    expect(await tool.execute("parent", { question }, undefined, undefined, {})).toEqual(parentResult({
      status: "unavailable", question, message: "Parent context is unavailable.",
    }));
    expect(mocks.createAgentSession).not.toHaveBeenCalled();
    expect(mocks.reload).not.toHaveBeenCalled();
  });

  it("returns the complete pre-abort result before creating a helper", async () => {
    const { tool, session, unsubscribe, onUsage } = helperFixture();
    const controller = new AbortController();
    controller.abort();
    expect(await tool.execute("parent", { question }, controller.signal, undefined, {})).toEqual(parentResult({ status: "cancelled", question }));
    expect(mocks.createAgentSession).not.toHaveBeenCalled();
    expect(session.prompt).not.toHaveBeenCalled();
    expect(session.abort).not.toHaveBeenCalled();
    expect(session.dispose).not.toHaveBeenCalled();
    expect(unsubscribe).not.toHaveBeenCalled();
    expect(onUsage).not.toHaveBeenCalled();
  });

  it("captures a bare context without a session manager", () => {
    const modelRegistry = {};
    expect(captureParentQuestionContext({ cwd: "/repo", modelRegistry } as ExtensionContext)).toEqual({
      cwd: "/repo", conversation: "", model: undefined, thinkingLevel: undefined, modelRegistry,
    });
  });

  it("returns the full unavailable result with no helper decision and no optional runtime settings", async () => {
    const { tool, session, unsubscribe, onUsage } = helperFixture();
    expect(await tool.execute("parent", { question, details: "Not a user request." }, undefined, undefined, {})).toEqual(parentResult({
      status: "unavailable", question, message: "Parent context does not directly answer the question.",
    }));
    const options = mocks.createAgentSession.mock.calls[0][0];
    expect(options).not.toHaveProperty("thinkingLevel");
    expect(options).not.toHaveProperty("modelRuntime");
    expect(mocks.loaderOptions[0].appendSystemPromptOverride()).toEqual([]);
    expect(session.prompt).toHaveBeenCalledExactlyOnceWith(JSON.stringify({ parentConversation: "User chose blue.", childQuestion: question }));
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(session.dispose).toHaveBeenCalledOnce();
    expect(onUsage).not.toHaveBeenCalled();
  });

  it.each([undefined, "", " \n "])("rejects an answered decision without a nonempty answer: %j", async answer => {
    const { tool, session, unsubscribe } = helperFixture();
    session.prompt.mockImplementation(async () => {
      const options = mocks.createAgentSession.mock.calls[0][0] as { customTools: ToolDefinition[] };
      const decision = options.customTools[0] as unknown as ExecutableTool;
      expect(await decision.execute("decision", { status: "answered", ...(answer === undefined ? {} : { answer }) }, undefined, undefined, {})).toEqual({
        content: [{ type: "text", text: "An answered decision requires a non-empty answer." }], details: {}, isError: true,
      });
    });
    expect(await tool.execute("parent", { question }, undefined, undefined, {})).toEqual(parentResult({
      status: "unavailable", question, message: "Parent context does not directly answer the question.",
    }));
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(session.dispose).toHaveBeenCalledOnce();
  });

  it.each(["reload", "create", "subscribe", "prompt"])("reports Error and non-Error failures from %s with cleanup", async stage => {
    for (const error of [new Error("Helper failed"), "Helper failed"]) {
      const { tool, session, unsubscribe } = helperFixture();
      const controller = new AbortController();
      const add = vi.spyOn(controller.signal, "addEventListener");
      const remove = vi.spyOn(controller.signal, "removeEventListener");
      if (stage === "reload") mocks.reload.mockRejectedValueOnce(error);
      if (stage === "create") mocks.createAgentSession.mockRejectedValueOnce(error);
      if (stage === "subscribe") session.subscribe.mockImplementationOnce(() => { throw error; });
      if (stage === "prompt") session.prompt.mockRejectedValueOnce(error);
      expect(await tool.execute("parent", { question }, controller.signal, undefined, {})).toEqual(parentResult({
        status: "error", question, message: "Helper failed",
      }));
      expect(remove).toHaveBeenCalledExactlyOnceWith("abort", add.mock.calls[0][1]);
      expect(session.dispose).toHaveBeenCalledTimes(stage === "subscribe" || stage === "prompt" ? 1 : 0);
      expect(unsubscribe).toHaveBeenCalledTimes(stage === "prompt" ? 1 : 0);
      controller.abort();
      expect(session.abort).not.toHaveBeenCalled();
    }
  });

  it("cancels during loader setup, then aborts and disposes the newly created helper", async () => {
    const { tool, session, unsubscribe } = helperFixture();
    const controller = new AbortController();
    mocks.reload.mockImplementationOnce(async () => { controller.abort("stop during setup"); });
    expect(await tool.execute("parent", { question }, controller.signal, undefined, {})).toEqual(parentResult({ status: "cancelled", question }));
    expect(session.abort).toHaveBeenCalledOnce();
    expect(session.prompt).not.toHaveBeenCalled();
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(session.dispose).toHaveBeenCalledOnce();
    controller.signal.dispatchEvent(new Event("abort"));
    expect(session.abort).toHaveBeenCalledOnce();
  });

  it.each(["reload", "prompt"])("returns cancellation rather than an exception when %s aborts and rejects", async stage => {
    const { tool, session, unsubscribe } = helperFixture();
    const controller = new AbortController();
    const reject = async () => {
      controller.abort("stop");
      throw new Error("Aborted helper");
    };
    if (stage === "reload") mocks.reload.mockImplementationOnce(reject);
    else session.prompt.mockImplementationOnce(reject);
    expect(await tool.execute("parent", { question }, controller.signal, undefined, {})).toEqual(parentResult({ status: "cancelled", question }));
    expect(session.abort).toHaveBeenCalledTimes(stage === "prompt" ? 1 : 0);
    expect(unsubscribe).toHaveBeenCalledTimes(stage === "prompt" ? 1 : 0);
    expect(session.dispose).toHaveBeenCalledTimes(stage === "prompt" ? 1 : 0);
  });

  it.each(["answered", "unanswered", "no-decision", "error", "cancelled"])("accounts for multiple usage events on %s without a user event", async outcome => {
    const { tool, session, unsubscribe, onUsage } = helperFixture();
    const controller = new AbortController();
    session.subscribe.mockImplementation(listener => {
      listener({ type: "message_start" });
      listener({ type: "message_end", message: { role: "user", usage: { input: 999 } } });
      listener({ type: "message_end", message: { role: "assistant" } });
      listener({ type: "message_end", message: { role: "assistant", usage: {} } });
      listener({ type: "message_end", message: { role: "assistant", usage: { input: 3, output: 4, cacheRead: 5, cacheWrite: 6, cost: { total: 0.25 } } } });
      listener({ type: "message_end", message: { role: "assistant", usage: { input: 7, output: 8, cacheRead: 9, cacheWrite: 10, cost: {} } } });
      return unsubscribe;
    });
    session.prompt.mockImplementation(async () => {
      if (outcome === "error") throw new Error("After usage");
      if (outcome === "cancelled") { controller.abort(); return; }
      if (outcome === "no-decision") return;
      const options = mocks.createAgentSession.mock.calls[0][0] as { customTools: ToolDefinition[] };
      const decision = options.customTools[0] as unknown as ExecutableTool;
      expect(await decision.execute("decision", { status: outcome, answer: "  blue\n" }, undefined, undefined, {})).toEqual({
        content: [{ type: "text", text: "Decision recorded." }], details: {},
      });
    });
    const details = outcome === "answered"
      ? { status: "answered", source: "parent_context", question, answer: "  blue\n" }
      : outcome === "error"
        ? { status: "error", question, message: "After usage" }
        : outcome === "cancelled"
          ? { status: "cancelled", question }
          : { status: "unavailable", question, message: "Parent context does not directly answer the question." };
    expect(await tool.execute("parent", { question }, controller.signal, undefined, {})).toEqual({
      ...parentResult(details),
      usage: { input: 10, output: 12, cacheRead: 14, cacheWrite: 16, totalTokens: 52, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0.25 } },
    });
    expect(onUsage.mock.calls).toEqual([
      [{ input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: 0 }],
      [{ input: 3, output: 4, cacheRead: 5, cacheWrite: 6, cost: 0.25 }],
      [{ input: 7, output: 8, cacheRead: 9, cacheWrite: 10, cost: 0 }],
    ]);
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(session.dispose).toHaveBeenCalledOnce();
  });
});

describe("user service protocol validation", () => {
  it.each([
    ["null envelope", null],
    ["primitive envelope", false],
    ["missing success", {}],
    ["nonboolean success", { success: 1, data: { version: 1 } }],
    ["error without text", { success: false, error: 5 }],
    ["missing data", { success: true }],
    ["primitive data", { success: true, data: "ready" }],
    ["null data", { success: true, data: null }],
    ["missing version", { success: true, data: {} }],
    ["string version", { success: true, data: { version: "1" } }],
    ["incompatible version", { success: true, data: { version: 2 } }],
    ["no service", undefined],
  ])("does not ask after discovery returns %s", async (_name, reply) => {
    const root = serviceFixture(() => reply);
    expect(await askUserQuestion(root as never, { question }, undefined)).toEqual(localResult("unavailable", "ask-user-question service is unavailable."));
    expect(root.calls.map(call => call.channel)).toEqual([pingChannel]);
    expect(root.replyListeners()).toEqual([]);
  });

  it.each([pingChannel, askChannel])("preserves an error envelope on %s", async channel => {
    const root = serviceFixture(current => current === channel ? { success: false, error: "Service refused" } : { success: true, data: { version: 1 } });
    expect(await askUserQuestion(root as never, { question }, undefined)).toEqual(localResult("error", "Service refused"));
    expect(root.calls.map(call => call.channel)).toEqual(channel === pingChannel ? [pingChannel] : [pingChannel, askChannel]);
    expect(root.replyListeners()).toEqual([]);
  });

  it.each([
    ["null result", null],
    ["primitive result", "blue"],
    ["absent content", { details: {} }],
    ["non-array content", { content: "blue", details: {} }],
    ["absent details", { content: [] }],
    ["null details", { content: [], details: null }],
    ["primitive details", { content: [], details: true }],
    ["null content item", serviceResult({}, [null])],
    ["nontext content", serviceResult({}, [{ type: "image", text: "blue" }])],
    ["missing text", serviceResult({}, [{ type: "text" }])],
    ["nonstring text", serviceResult({}, [{ type: "text", text: 2 }])],
    ["unknown status", serviceResult({ status: "waiting" })],
    ["missing status", serviceResult({ status: undefined })],
    ["different question", serviceResult({ question: "Another question" })],
    ["unknown mode", serviceResult({ mode: "menu" })],
    ["missing answers", serviceResult({ answers: undefined })],
    ["non-array answers", serviceResult({ answers: "blue" })],
    ["null answer", serviceResult({ answers: [null] })],
    ["missing answer type", serviceResult({ answers: [{ label: "blue", value: "blue" }] })],
    ["nonstring answer type", serviceResult({ answers: [{ type: 1, label: "blue", value: "blue" }] })],
    ["nonstring answer label", serviceResult({ answers: [{ type: "text", label: 1, value: "blue" }] })],
    ["nonstring answer value", serviceResult({ answers: [{ type: "text", label: "blue", value: 1 }] })],
    ["unknown answer type", serviceResult({ answers: [{ type: "button", label: "blue", value: "blue" }] })],
    ["missing option index", serviceResult({ answers: [{ type: "option", label: "blue", value: "blue" }] })],
    ["nonnumber option index", serviceResult({ answers: [{ type: "option", label: "blue", value: "blue", index: "1" }] })],
    ["bad answer after valid one", serviceResult({ answers: [{ type: "text", label: "blue", value: "blue" }, null] })],
    ["null context", serviceResult({ context: null })],
    ["nonstring context", serviceResult({ context: 1 })],
    ["null message", serviceResult({ message: null })],
    ["nonstring message", serviceResult({ message: 1 })],
  ])("rejects %s without retry or leaked listeners", async (_name, data) => {
    vi.useFakeTimers();
    const root = serviceFixture(channel => ({ success: true, data: channel === pingChannel ? { version: 1 } : data }));
    expect(await askUserQuestion(root as never, { question }, undefined)).toEqual(localResult("error", "ask-user-question returned malformed data."));
    expect(root.calls.map(call => call.channel)).toEqual([pingChannel, askChannel]);
    expect(root.replyListeners()).toEqual([]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([null, "reply", {}, { success: "true" }, { success: false, error: null }])("rejects malformed ask envelopes: %j", async response => {
    const root = serviceFixture(channel => channel === pingChannel ? { success: true, data: { version: 1 } } : response);
    expect(await askUserQuestion(root as never, { question }, undefined)).toEqual(localResult("error", "ask-user-question returned malformed data."));
    expect(root.replyListeners()).toEqual([]);
    expect(root.calls.map(call => call.channel)).toEqual([pingChannel, askChannel]);
  });

  it.each(["answered", "cancelled", "invalid", "unavailable", "error"])("preserves the complete valid %s service result", async status => {
    const data = serviceResult({ status, context: "", message: "Exact service message", mode: "multi-select", answers: [
      { type: "option", label: "Blue", value: "blue", index: 1 },
      { type: "other", label: "Other", value: "  custom\n" },
    ] });
    const root = serviceFixture(channel => ({ success: true, data: channel === pingChannel ? { version: 1 } : data }));
    expect(await askUserQuestion(root as never, { question }, undefined)).toBe(data);
    expect(root.replyListeners()).toEqual([]);
    expect(root.calls.map(call => call.channel)).toEqual([pingChannel, askChannel]);
  });

  it.each([
    { params: { question }, mode: "text" },
    { params: { question, options: [], multiSelect: true }, mode: "text" },
    { params: { question, options: [{ label: "Blue" }] }, mode: "single-select" },
    { params: { question, options: [{ label: "Blue" }], multiSelect: false }, mode: "single-select" },
    { params: { question, options: [{ label: "Blue" }], multiSelect: true }, mode: "multi-select" },
  ])("uses the input mode for local results: %j", async ({ params, mode }) => {
    for (const status of ["unavailable", "cancelled", "error"]) {
      const controller = new AbortController();
      if (status === "cancelled") controller.abort("already stopped");
      const root = serviceFixture(() => status === "unavailable" ? undefined : status === "error" ? { success: false, error: "Denied" } : { success: true, data: { version: 1 } });
      const message = status === "unavailable" ? "ask-user-question service is unavailable." : status === "cancelled" ? "User cancelled the question" : "Denied";
      expect(await askUserQuestion(root as never, params, controller.signal)).toEqual(localResult(status, message, mode));
      expect(root.calls.map(call => call.channel)).toEqual([pingChannel]);
      expect(root.replyListeners()).toEqual([]);
    }
  });

  it.each([
    { question },
    { question, details: "", options: [], multiSelect: false },
    { question, options: [{ label: "Blue" }] },
  ])("forwards omitted, empty, and label-only inputs unchanged: %j", async params => {
    const data = serviceResult();
    const root = serviceFixture(channel => ({ success: true, data: channel === pingChannel ? { version: 1 } : data }));
    expect(await askUserQuestion(root as never, params, undefined)).toBe(data);
    expect(root.calls[1].params).toBe(params);
    expect(root.calls[1].signal).toBeInstanceOf(AbortSignal);
    expect(root.replyListeners()).toEqual([]);
  });
});

describe("user service transport cleanup", () => {
  it("does not ask if the caller aborts during discovery", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const root = serviceFixture(() => {
      controller.abort("during discovery");
      return { success: true, data: { version: 1 } };
    });
    expect(await askUserQuestion(root as never, { question }, controller.signal)).toEqual(localResult("cancelled", "User cancelled the question"));
    expect(root.calls.map(call => call.channel)).toEqual([pingChannel]);
    expect(root.replyListeners()).toEqual([]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("uses the first discovery reply and does not let a second service replace it", async () => {
    const root = serviceFixture((channel, request) => {
      root.events.emit(`${channel}:reply:${request.requestId}`, { success: true, data: { version: 2 } });
      return { success: true, data: { version: 1 } };
    });
    expect(await askUserQuestion(root as never, { question }, undefined)).toEqual(localResult("unavailable", "ask-user-question service is unavailable."));
    expect(root.calls.map(call => call.channel)).toEqual([pingChannel]);
    expect(root.replyListeners()).toEqual([]);
  });

  it.each([pingChannel, askChannel])("cleans up Error and non-Error emission failures on %s", async channel => {
    vi.useFakeTimers();
    for (const error of [new Error("Emission failed"), "Emission failed"]) {
      const controller = new AbortController();
      const add = vi.spyOn(controller.signal, "addEventListener");
      const remove = vi.spyOn(controller.signal, "removeEventListener");
      const root = serviceFixture(current => {
        if (current === channel) throw error;
        return { success: true, data: { version: 1 } };
      });
      expect(await askUserQuestion(root as never, { question }, controller.signal)).toEqual(localResult("error", "Emission failed"));
      expect(root.replyListeners()).toEqual([]);
      expect(vi.getTimerCount()).toBe(0);
      expect(root.calls.map(call => call.channel)).toEqual(channel === pingChannel ? [pingChannel] : [pingChannel, askChannel]);
      if (channel === askChannel) {
        expect(root.calls[1].signal?.aborted).toBe(true);
        expect(root.calls[1].signal?.reason).toBe(error);
        expect(remove).toHaveBeenCalledExactlyOnceWith("abort", add.mock.calls[0][1]);
      } else {
        expect(add).not.toHaveBeenCalled();
        expect(remove).not.toHaveBeenCalled();
      }
    }
  });

  it.each([new Error("Caller stopped"), "Caller stopped"])("cancels an in-flight request with reason %j", async reason => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const add = vi.spyOn(controller.signal, "addEventListener");
    const remove = vi.spyOn(controller.signal, "removeEventListener");
    const root = serviceFixture(channel => channel === pingChannel ? { success: true, data: { version: 1 } } : undefined);
    const pending = askUserQuestion(root as never, { question }, controller.signal);
    expect(root.replyListeners()).toHaveLength(1);
    controller.abort(reason);
    expect(await pending).toEqual(localResult("cancelled", "User cancelled the question"));
    expect(root.calls[1].signal?.reason).toBe(reason);
    expect(root.replyListeners()).toEqual([]);
    expect(remove).toHaveBeenCalledExactlyOnceWith("abort", add.mock.calls[0][1]);
    expect(vi.getTimerCount()).toBe(0);
    await vi.runAllTimersAsync();
    expect(root.calls.map(call => call.channel)).toEqual([pingChannel, askChannel]);
  });

  it("times out at the exact custom deadline and removes caller and reply listeners", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const add = vi.spyOn(controller.signal, "addEventListener");
    const remove = vi.spyOn(controller.signal, "removeEventListener");
    const root = serviceFixture(channel => channel === pingChannel ? { success: true, data: { version: 1 } } : undefined);
    const settled = vi.fn();
    const pending = askUserQuestion(root as never, { question }, controller.signal, 25).then(result => { settled(); return result; });
    await vi.advanceTimersByTimeAsync(24);
    expect(settled).not.toHaveBeenCalled();
    expect(root.replyListeners()).toHaveLength(1);
    expect(root.calls[1].signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await pending).toEqual(localResult("error", "ask-user-question service timed out."));
    expect(settled).toHaveBeenCalledOnce();
    expect(root.calls[1].signal?.aborted).toBe(true);
    expect(root.replyListeners()).toEqual([]);
    expect(remove).toHaveBeenCalledExactlyOnceWith("abort", add.mock.calls[0][1]);
    expect(vi.getTimerCount()).toBe(0);
    controller.abort("late abort");
    expect(root.calls[1].signal?.reason).toEqual(new Error("ask-user-question service timed out."));
    expect(root.calls.map(call => call.channel)).toEqual([pingChannel, askChannel]);
  });

  it("removes caller listeners and timeout after a successful request", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const add = vi.spyOn(controller.signal, "addEventListener");
    const remove = vi.spyOn(controller.signal, "removeEventListener");
    const data = serviceResult();
    const root = serviceFixture(channel => ({ success: true, data: channel === pingChannel ? { version: 1 } : data }));
    expect(await askUserQuestion(root as never, { question }, controller.signal)).toBe(data);
    expect(remove).toHaveBeenCalledExactlyOnceWith("abort", add.mock.calls[0][1]);
    expect(root.replyListeners()).toEqual([]);
    expect(vi.getTimerCount()).toBe(0);
    controller.abort();
    expect(root.calls[1].signal?.aborted).toBe(false);
    await vi.runAllTimersAsync();
    expect(root.calls.map(call => call.channel)).toEqual([pingChannel, askChannel]);
  });
});
