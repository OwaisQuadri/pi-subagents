import type { ExtensionContext, ToolDefinition } from "@earendil-works/pi-coding-agent";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runAgent } from "../src/agent-runner.js";
import { createAskParentQuestionTool, type ParentQuestionContext } from "../src/ask-parent-question.js";

const mocks = vi.hoisted(() => ({
  createAgentSession: vi.fn(),
  disallowedTools: [] as string[],
}));

vi.mock("@earendil-works/pi-coding-agent", () => ({
  createAgentSession: mocks.createAgentSession,
  createEventBus: vi.fn(() => ({ emit: vi.fn(), on: vi.fn(() => () => {}) })),
  defineTool: (definition: unknown) => definition,
  DefaultResourceLoader: class {
    async reload() {}
    getExtensions() { return { extensions: [], errors: [], runtime: {} }; }
  },
  getAgentDir: () => "/agent",
  SessionManager: { inMemory: () => ({}) },
  SettingsManager: { create: () => ({}) },
  VERSION: "0.85.1",
}));

vi.mock("../src/agent-types.js", () => ({
  BUILTIN_TOOL_NAMES: ["read"],
  getConfig: () => ({ extensions: false, skills: false }),
  getAgentConfig: () => ({
    name: "question-contract",
    extensions: false,
    skills: false,
    persistSession: false,
    disallowedTools: mocks.disallowedTools,
  }),
  getToolNamesForType: () => ["read"],
}));
vi.mock("../src/env.js", () => ({ detectEnv: async () => ({ isGitRepo: false }) }));
vi.mock("../src/prompts.js", () => ({ buildAgentPrompt: () => "Resolve the source path." }));
vi.mock("../src/nested-tools.js", () => ({ getMaxSubagentDepth: () => 2 }));

interface Result {
  content: unknown[];
  details: {
    status: string;
    question?: string;
    context?: string;
    mode?: "text" | "single-select" | "multi-select";
    source?: string;
    answer?: string;
    answers?: unknown[];
    message?: string;
  };
}

interface ExecutableTool {
  name: string;
  parameters: { properties: Record<string, unknown>; required?: string[] };
  execute(
    toolCallId: string,
    params: unknown,
    signal: AbortSignal | undefined,
    onUpdate: undefined,
    context: unknown,
  ): Promise<Result>;
}

type Listener = (payload: unknown) => void;

const question = "Which source file constructs the child tools?";
const pingChannel = "ask-user-question:rpc:ping";
const askChannel = "ask-user-question:rpc:ask";

function service(reply: Result | null = {
  content: [{ type: "text", text: "User answered: HUMAN ANSWER" }],
  details: {
    status: "answered",
    question,
    context: undefined,
    mode: "text",
    answers: [{ type: "text", label: "HUMAN ANSWER", value: "HUMAN ANSWER" }],
    message: undefined,
  },
}, responseFor?: (channel: string) => unknown) {
  const listeners = new Map<string, Set<Listener>>();
  const calls: Array<{ channel: string; params?: unknown; signal?: AbortSignal }> = [];
  const events = {
    on: vi.fn((channel: string, listener: Listener) => {
      const entries = listeners.get(channel) ?? new Set<Listener>();
      entries.add(listener);
      listeners.set(channel, entries);
      return () => {
        entries.delete(listener);
        if (entries.size === 0) listeners.delete(channel);
      };
    }),
    emit(channel: string, payload: unknown) {
      const request = payload as { requestId: string; params?: unknown; signal?: AbortSignal };
      calls.push({ channel, params: request.params, signal: request.signal });
      const data = channel === pingChannel ? { version: 1 } : reply;
      const response = responseFor ? responseFor(channel) : data === null ? null : { success: true, data };
      if (response === null) return;
      for (const listener of listeners.get(`${channel}:reply:${request.requestId}`) ?? []) {
        listener(response);
      }
    },
  };
  return { events, calls, listeners };
}

function parent(conversation = "The source file is src/agent-runner.ts."): ParentQuestionContext {
  return { cwd: "/repo", conversation, modelRegistry: {} as ParentQuestionContext["modelRegistry"] };
}

function helper(decision?: { status: string; answer?: string }) {
  const unsubscribe = vi.fn();
  const session = {
    prompt: vi.fn(async () => {}),
    subscribe: vi.fn(() => unsubscribe),
    abort: vi.fn(async () => {}),
    dispose: vi.fn(),
  };
  mocks.createAgentSession.mockImplementation(async (options: { customTools: ToolDefinition[] }) => {
    session.prompt.mockImplementation(async () => {
      if (decision !== undefined) {
        await (options.customTools[0] as unknown as ExecutableTool)
          .execute("decision", decision, undefined, undefined, {});
      }
    });
    return { session };
  });
  return { session, unsubscribe };
}

async function childTools(root: ReturnType<typeof service>, isIsolated = false) {
  const getBranch = vi.fn(() => {
    throw new Error("Parent history must not be read without inherit_context.");
  });
  const session = {
    messages: [],
    prompt: vi.fn(async () => {}),
    subscribe: () => () => {},
    setSessionName: () => {},
    bindExtensions: async () => {},
  };
  mocks.createAgentSession.mockResolvedValueOnce({ session });
  await runAgent({
    cwd: "/repo",
    modelRegistry: {},
    getSystemPrompt: () => "Parent system prompt",
    sessionManager: { getBranch },
  } as unknown as ExtensionContext, "question-contract", "Resolve the source path.", {
    pi: { events: root.events } as never,
    isolated: isIsolated,
    inheritContext: false,
  });
  expect(getBranch).not.toHaveBeenCalled();
  const options = mocks.createAgentSession.mock.calls[0][0] as {
    customTools: ExecutableTool[];
    tools: string[];
  };
  return options;
}

beforeEach(() => {
  mocks.createAgentSession.mockReset();
  mocks.disallowedTools = [];
});
afterEach(() => { vi.useRealTimers(); });

describe("parent recipient contract", () => {
  it.each([undefined, parent("")])("does not contact the human service for missing context: %j", async context => {
    const root = service();
    const tool = createAskParentQuestionTool({ events: root.events } as never, context) as unknown as ExecutableTool;
    const result = await tool.execute("parent-question", { question }, undefined, undefined, {});

    expect(root.calls).toEqual([]);
    expect(root.events.on).not.toHaveBeenCalled();
    expect(mocks.createAgentSession).not.toHaveBeenCalled();
    expect(result.details).toMatchObject({ status: "unavailable", question });
    expect(result.details.answer).toBeUndefined();
    expect(result.details.message?.trim().length).toBeGreaterThan(0);
  });

  it.each([{ status: "needs_user" }, { status: "unanswered" }, undefined])("does not escalate an insufficient parent decision: %j", async decision => {
    const root = service();
    const { session, unsubscribe } = helper(decision);
    const tool = createAskParentQuestionTool({ events: root.events } as never, parent()) as unknown as ExecutableTool;
    const result = await tool.execute("parent-question", { question }, undefined, undefined, {});

    expect(root.calls).toEqual([]);
    expect(root.events.on).not.toHaveBeenCalled();
    expect(result.details).toMatchObject({ status: "unavailable", question });
    expect(result.details.answer).toBeUndefined();
    expect(result.details.message?.trim().length).toBeGreaterThan(0);
    expect(session.prompt).toHaveBeenCalledOnce();
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(session.dispose).toHaveBeenCalledOnce();
  });

  it("returns the exact parent answer, not a trimmed or human replacement", async () => {
    const answer = "  src/agent-runner.ts\nKeep this line.  ";
    helper({ status: "answered", answer });
    const root = service();
    const tool = createAskParentQuestionTool({ events: root.events } as never, parent()) as unknown as ExecutableTool;
    const result = await tool.execute("parent-question", { question }, undefined, undefined, {});

    expect(result.details).toMatchObject({ status: "answered", source: "parent_context", question, answer });
    expect(root.calls).toEqual([]);
  });

  it("cancels a waiting helper, removes subscriptions, and never asks a second recipient", async () => {
    vi.useFakeTimers();
    const root = service();
    const { session, unsubscribe } = helper();
    let finish: (() => void) | undefined;
    session.prompt.mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
    session.abort.mockImplementation(async () => { finish?.(); });
    mocks.createAgentSession.mockResolvedValue({ session });
    const controller = new AbortController();
    const tool = createAskParentQuestionTool({ events: root.events } as never, parent()) as unknown as ExecutableTool;
    const pending = tool.execute("parent-question", { question }, controller.signal, undefined, {});
    await vi.waitFor(() => expect(session.prompt).toHaveBeenCalledOnce());
    controller.abort();

    await expect(pending).resolves.toMatchObject({ details: { status: "cancelled", question } });
    expect(session.abort).toHaveBeenCalledOnce();
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(session.dispose).toHaveBeenCalledOnce();
    await vi.runAllTimersAsync();
    expect(root.calls).toEqual([]);
  });
});

describe("distinct child question recipients", () => {
  it.each([
    { isIsolated: false, denied: [], expected: ["ask_parent_question", "ask_user_question"] },
    { isIsolated: true, denied: [], expected: [] },
    { isIsolated: false, denied: ["ask_parent_question"], expected: ["ask_user_question"] },
    { isIsolated: false, denied: ["ask_user_question"], expected: ["ask_parent_question"] },
  ])("registers only permitted recipients: %j", async ({ isIsolated, denied, expected }) => {
    mocks.disallowedTools = denied;
    const root = service();
    const options = await childTools(root, isIsolated);
    const names = ["ask_parent_question", "ask_user_question"];

    expect(options.customTools.map(tool => tool.name).filter(name => names.includes(name)).sort()).toEqual(expected);
    expect(options.tools.filter(name => names.includes(name)).sort()).toEqual(expected);
    expect(root.calls).toEqual([]);
  });

  it("keeps parent history unavailable when inheritance is false", async () => {
    const root = service();
    const options = await childTools(root);
    const tool = options.customTools.find(tool => tool.name === "ask_parent_question");
    expect(tool).toBeDefined();
    const result = await tool?.execute("parent-question", { question }, undefined, undefined, {});

    expect(root.calls).toEqual([]);
    expect(result?.details).toMatchObject({ status: "unavailable", question });
    expect(mocks.createAgentSession).toHaveBeenCalledOnce();
  });

  it("registers both recipients with inheritance and captures only each supplied immediate parent", async () => {
    const root = service();
    const registered: ExecutableTool[][] = [];
    const parents = ["ROOT CONTEXT MUST NOT LEAK", "IMMEDIATE PARENT CONTEXT ONLY"];
    for (const conversation of parents) {
      const getBranch = vi.fn(() => [{
        type: "message",
        message: { role: "user", content: conversation },
      }]);
      const childSession = {
        messages: [],
        prompt: vi.fn(async (_prompt: string) => {}),
        subscribe: () => () => {},
        setSessionName: () => {},
        bindExtensions: async () => {},
      };
      mocks.createAgentSession.mockResolvedValueOnce({ session: childSession });
      await runAgent({
        cwd: "/repo",
        modelRegistry: {},
        getSystemPrompt: () => "Parent system prompt",
        sessionManager: { getBranch },
      } as unknown as ExtensionContext, "question-contract", "Resolve the source path.", {
        pi: { events: root.events } as never,
        inheritContext: true,
      });
      const options = mocks.createAgentSession.mock.lastCall?.[0] as {
        customTools: ExecutableTool[];
        tools: string[];
      };
      const names = ["ask_parent_question", "ask_user_question"];
      expect(options.customTools.map(tool => tool.name).sort()).toEqual(names);
      expect(options.tools.filter(name => names.includes(name)).sort()).toEqual(names);
      expect(getBranch).toHaveBeenCalled();
      expect(childSession.prompt.mock.calls[0][0]).toContain(conversation);
      expect(childSession.prompt.mock.calls[0][0]).not.toContain(parents.find(text => text !== conversation));
      registered.push(options.customTools);
    }

    for (const [index, tools] of registered.entries()) {
      const { session } = helper({ status: "answered", answer: parents[index] });
      const parentTool = tools.find(tool => tool.name === "ask_parent_question");
      expect(parentTool).toBeDefined();
      const result = await parentTool!.execute("inherited-parent", { question }, undefined, undefined, {});
      expect(result.details).toMatchObject({
        status: "answered", source: "parent_context", answer: parents[index], question,
      });
      expect(session.prompt).toHaveBeenCalledExactlyOnceWith(JSON.stringify({
        parentConversation: `# Parent Conversation Context\nThe following is the conversation history from the parent session that spawned you.\nUse this context to understand what has been discussed and decided so far.\n\n[User]: ${parents[index]}\n\n---\n# Your Task (below)\n`,
        childQuestion: question,
      }));
      expect(root.calls).toEqual([]);
      expect(root.events.on).not.toHaveBeenCalled();
    }
  });

  it.each([
    {
      mode: "text" as const,
      answers: [{ type: "text", label: "preserve\nthis text", value: "preserve\nthis text" }],
      text: "User answered: preserve\nthis text",
    },
    {
      mode: "single-select" as const,
      answers: [{ type: "option", label: "Read source", value: "source", index: 1 }],
      text: "User selected: 1. Read source",
    },
    {
      mode: "multi-select" as const,
      answers: [
        { type: "option", label: "Read source", value: "source", index: 1 },
        { type: "option", label: "Read tests", value: "Read tests", index: 2 },
        { type: "other", label: "also check docs", value: "also check docs" },
      ],
      text: "User selected:\n- 1. Read source\n- 2. Read tests\n- Other: also check docs",
    },
  ])("forwards explicit user inputs and preserves the full $mode result", async ({ mode, answers, text }) => {
    const params = {
      question: "Which evidence should I inspect?",
      details: "  Keep these details.\n",
      ...(mode === "text" ? {} : {
        options: [
          { label: "Read source", value: "source", description: "Inspect the implementation." },
          { label: "Read tests" },
        ],
        multiSelect: mode === "multi-select",
      }),
    };
    const reply = {
      content: [{ type: "text", text }],
      details: {
        status: "answered",
        question: params.question,
        context: "Keep these details.",
        mode,
        answers,
        message: undefined,
      },
    };
    const root = service(reply);
    const options = await childTools(root);
    const tool = options.customTools.find(tool => tool.name === "ask_user_question");
    expect(tool, "A separately callable ask_user_question tool is required").toBeDefined();
    expect(tool?.parameters.properties).toMatchObject({
      question: { type: "string" },
      details: { type: "string" },
      options: { type: "array", items: { properties: {
        label: { type: "string" }, value: { type: "string" }, description: { type: "string" },
      }, required: ["label"] } },
      multiSelect: { type: "boolean" },
    });
    expect(tool?.parameters.required).toEqual(["question"]);
    const result = await tool?.execute("user-question", params, undefined, undefined, {});

    expect(root.calls.map(call => call.channel)).toEqual([pingChannel, askChannel]);
    expect(root.calls[1].params).toEqual(params);
    expect(result?.details).toEqual(reply.details);
    expect(result?.content).toEqual(reply.content);
    expect(root.listeners.size).toBe(0);
    expect(mocks.createAgentSession).toHaveBeenCalledOnce();
  });

  it("does not emit an ask request for an already-aborted user question", async () => {
    vi.useFakeTimers();
    const root = service();
    const options = await childTools(root);
    const tool = options.customTools.find(tool => tool.name === "ask_user_question");
    expect(tool).toBeDefined();
    const controller = new AbortController();
    controller.abort();

    const result = await tool!.execute("user-question", { question }, controller.signal, undefined, {});

    expect(result.details.status).toBe("cancelled");
    expect(root.calls.filter(call => call.channel === askChannel)).toEqual([]);
    expect(root.listeners.size).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    await vi.runAllTimersAsync();
    expect(root.calls.filter(call => call.channel === askChannel)).toEqual([]);
    expect(mocks.createAgentSession).toHaveBeenCalledOnce();
  });

  it.each([
    { name: "absent", ping: null },
    { name: "incompatible version", ping: { success: true, data: { version: 2 } } },
    { name: "missing version", ping: { success: true, data: {} } },
  ])("returns unavailable without asking when the root service is $name", async ({ ping }) => {
    vi.useFakeTimers();
    const root = service(undefined, channel => channel === pingChannel ? ping : null);
    const options = await childTools(root);
    const tool = options.customTools.find(tool => tool.name === "ask_user_question");
    expect(tool).toBeDefined();
    const pending = tool!.execute("user-question", { question }, undefined, undefined, {});
    const outcome = pending.then(result => result.details.status, () => "error");
    await vi.runAllTimersAsync();

    expect(await outcome).toBe("unavailable");
    expect(root.calls.map(call => call.channel)).toEqual([pingChannel]);
    expect(root.listeners.size).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    expect(mocks.createAgentSession).toHaveBeenCalledOnce();
  });

  it("times out an unanswered user request at 300000ms and aborts its forwarded signal", async () => {
    vi.useFakeTimers();
    const root = service(null);
    const options = await childTools(root);
    const tool = options.customTools.find(tool => tool.name === "ask_user_question");
    expect(tool).toBeDefined();
    const pending = tool!.execute("user-question", { question }, undefined, undefined, {});
    let isSettled = false;
    const outcome = pending.then(result => result.details.status, () => "error").then(status => {
      isSettled = true;
      return status;
    });
    await vi.advanceTimersByTimeAsync(0);
    expect(root.calls.map(call => call.channel)).toEqual([pingChannel, askChannel]);
    expect(root.listeners.size).toBe(1);
    expect(root.calls[1].signal?.aborted).toBe(false);

    await vi.advanceTimersByTimeAsync(299999);
    expect(isSettled).toBe(false);
    expect(root.listeners.size).toBe(1);
    expect(root.calls[1].signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);

    expect(isSettled).toBe(true);
    expect(await outcome).toBe("error");
    expect(root.listeners.size).toBe(0);
    expect(root.calls[1].signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    await vi.runAllTimersAsync();
    expect(root.calls.map(call => call.channel)).toEqual([pingChannel, askChannel]);
    expect(mocks.createAgentSession).toHaveBeenCalledOnce();
  });

  it.each([
    { name: "service error envelope", response: { success: false, error: "No active interactive session" } },
    { name: "null result", response: { success: true, data: null } },
    { name: "missing result fields", response: { success: true, data: {} } },
    {
      name: "malformed answers",
      response: { success: true, data: {
        content: [{ type: "text", text: "User answered: HUMAN ANSWER" }],
        details: { status: "answered", question, mode: "text", answers: "HUMAN ANSWER" },
      } },
    },
  ])("reports an error for $name without opening another question", async ({ response }) => {
    vi.useFakeTimers();
    const root = service(undefined, channel => channel === pingChannel
      ? { success: true, data: { version: 1 } }
      : response);
    const options = await childTools(root);
    const tool = options.customTools.find(tool => tool.name === "ask_user_question");
    expect(tool).toBeDefined();
    const outcome = tool!.execute("user-question", { question }, undefined, undefined, {})
      .then(result => result.details.status, () => "error");
    await vi.runAllTimersAsync();

    expect(await outcome).toBe("error");
    expect(root.listeners.size).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    expect(root.calls.map(call => call.channel)).toEqual([pingChannel, askChannel]);
    expect(mocks.createAgentSession).toHaveBeenCalledOnce();
  });

  it("reports an ask emission exception and removes the reply subscription without retrying", async () => {
    vi.useFakeTimers();
    const root = service(undefined, channel => {
      if (channel === pingChannel) return { success: true, data: { version: 1 } };
      throw new Error("Ask emission failed");
    });
    const options = await childTools(root);
    const tool = options.customTools.find(tool => tool.name === "ask_user_question");
    expect(tool).toBeDefined();
    const outcome = tool!.execute("user-question", { question }, undefined, undefined, {})
      .then(result => result.details.status, () => "error");
    await vi.advanceTimersByTimeAsync(0);

    expect(root.listeners.size).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    expect(await outcome).toBe("error");
    await vi.runAllTimersAsync();
    expect(root.calls.map(call => call.channel)).toEqual([pingChannel, askChannel]);
    expect(mocks.createAgentSession).toHaveBeenCalledOnce();
  });

  it.each(["cancelled", "invalid", "unavailable"])("preserves a root %s result without opening another question", async status => {
    vi.useFakeTimers();
    const message = "The root service did not return an answer.";
    const reply = {
      content: [{ type: "text", text: message }],
      details: { status, question, context: undefined, mode: "text" as const, answers: [], message },
    };
    const root = service(reply);
    const options = await childTools(root);
    const tool = options.customTools.find(tool => tool.name === "ask_user_question");
    expect(tool).toBeDefined();

    const result = await tool!.execute("user-question", { question }, undefined, undefined, {});

    expect(result.details).toEqual(reply.details);
    expect(result.content).toEqual(reply.content);
    expect(root.listeners.size).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    await vi.runAllTimersAsync();
    expect(root.calls.map(call => call.channel)).toEqual([pingChannel, askChannel]);
    expect(mocks.createAgentSession).toHaveBeenCalledOnce();
  });

  it("stops waiting for the user on cancellation without a second dialog", async () => {
    vi.useFakeTimers();
    const root = service(null);
    const options = await childTools(root);
    const tool = options.customTools.find(tool => tool.name === "ask_user_question");
    expect(tool).toBeDefined();
    const controller = new AbortController();
    const pending = tool?.execute("user-question", { question }, controller.signal, undefined, {});
    await vi.waitFor(() => expect(root.calls.map(call => call.channel)).toEqual([pingChannel, askChannel]));
    expect(root.listeners.size).toBe(1);
    controller.abort();

    await expect(pending).resolves.toMatchObject({ details: { status: "cancelled" } });
    expect(root.listeners.size).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    await vi.runAllTimersAsync();
    expect(root.calls.map(call => call.channel)).toEqual([pingChannel, askChannel]);
    expect(root.calls[1].signal?.aborted).toBe(true);
  });
});
