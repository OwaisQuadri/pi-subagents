import type { CreateAgentSessionOptions, ExtensionContext, ToolDefinition } from "@earendil-works/pi-coding-agent";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { SettingsAppliers } from "../src/settings.js";
import type { AgentConfig, ThinkingLevel } from "../src/types.js";

const { captures, definitions, execution } = vi.hoisted(() => ({
  captures: [] as CreateAgentSessionOptions[],
  execution: { pause: undefined as Promise<void> | undefined },
  definitions: new Map<string, AgentConfig>(),
}));

vi.mock("@earendil-works/pi-coding-agent", () => ({
  VERSION: "0.85.1",
  createCodingTools: () => [{ name: "read" }, { name: "write" }],
  createReadOnlyTools: () => [{ name: "read" }],
  defineTool: (tool: unknown) => tool,
  getAgentDir: () => process.cwd(),
  createEventBus: () => ({ on: () => () => {}, emit: () => {} }),
  SettingsManager: { create: () => ({ getSessionDir: () => undefined }) },
  SessionManager: { create: () => ({}), inMemory: () => ({}), open: vi.fn(() => ({})) },
  DefaultResourceLoader: class {
    async reload() {}
    getExtensions() { return { extensions: [] }; }
  },
  createAgentSession: async (options: CreateAgentSessionOptions) => {
    captures.push(options);
    return { session: {
      model: options.model,
      thinkingLevel: options.thinkingLevel,
      messages: [],
      agent: {},
      setSessionName: () => {},
      bindExtensions: async () => {},
      getAllTools: () => [],
      getActiveToolNames: () => [],
      setActiveToolsByName: () => {},
      subscribe: () => () => {},
      prompt: async () => { await execution.pause; },
      dispose: () => {},
    } };
  },
}));
vi.mock("../src/env.js", () => ({ detectEnv: async () => ({ isGitRepo: false, branch: "", platform: "test" }) }));
vi.mock("../src/prompts.js", () => ({ buildAgentPrompt: () => "test" }));
vi.mock("../src/custom-agents.js", () => ({ loadCustomAgents: () => definitions }));
vi.mock("../src/settings.js", () => ({
  loadSettings: () => ({}),
  applyAndEmitLoaded: (appliers: SettingsAppliers) => {
    appliers.setSchedulingEnabled?.(false);
    appliers.setOutputTranscript?.(false);
  },
  saveAndEmitChanged: () => { throw new Error("Settings writes forbidden"); },
}));
vi.mock("../src/worktree.js", () => ({
  isWorktreeIsolationEnabled: () => false,
  setWorktreeIsolationEnabled: () => {},
  pruneWorktrees: async () => {},
}));

import { AgentManager } from "../src/agent-manager.js";
import { registerAgents, setAgentOverrides } from "../src/agent-types.js";
import { DEFAULT_AGENTS } from "../src/default-agents.js";
import extension from "../src/index.js";
import { createNestedSubagentTools } from "../src/nested-tools.js";
import { createWorkflowHost } from "../src/workflow/host.js";
import { runWorkflow } from "../src/workflow/runtime.js";
import { ctx as makeContext, makePi } from "./helpers/boot-extension.js";

const models = ["parent-a", "parent-b", "definition", "explicit", "registry"].map(id => ({
  id, provider: "fixture", name: id, api: "openai-completions" as const,
  baseUrl: "https://invalid.example", reasoning: true, input: ["text" as const],
  contextWindow: 10000, maxTokens: 1000,
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
}));
const registry = {
  find: (provider: string, id: string) => models.find(model => model.provider === provider && model.id === id),
  getAll: () => models,
  getAvailable: () => models,
};
let boot: ReturnType<typeof makePi>;
let parent: ExtensionContext;
let manager: AgentManager;

beforeEach(() => {
  captures.length = 0;
  execution.pause = undefined;
  definitions.clear();
  setAgentOverrides({});
  registerAgents(definitions);
  parent = makeContext({ model: models[0], thinkingLevel: "high", modelRegistry: registry });
  boot = makePi();
  boot.pi.getThinkingLevel = vi.fn(() => "low");
  boot.pi.exec = vi.fn(() => { throw new Error("Process execution forbidden"); });
  vi.stubGlobal("fetch", () => { throw new Error("Network forbidden"); });
  extension(boot.pi);
  manager = new AgentManager();
});

afterEach(async () => {
  await manager.dispose();
  await boot.lifecycle.get("session_shutdown")({}, parent);
  vi.unstubAllGlobals();
});

function pinDefinition() {
  definitions.set("general-purpose", {
    ...DEFAULT_AGENTS.get("general-purpose")!,
    model: "fixture/definition", thinking: "medium", outputTranscript: false,
  });
  setAgentOverrides({ "general-purpose": { model: "fixture/registry" } });
  registerAgents(definitions);
}

async function agentCall(isBackground: boolean, choices: { model?: string; thinking?: ThinkingLevel } = {}) {
  const count = captures.length;
  await boot.tools.get("Agent").execute("call", {
    subagent_type: "general-purpose", description: "test", prompt: "test",
    run_in_background: isBackground, isolated: true, ...choices,
  }, undefined, undefined, parent);
  await vi.waitFor(() => expect(captures).toHaveLength(count + 1));
  return captures[count];
}

it.each([false, true])("registered Agent inherits live parent settings (background=%s), ignoring pins", async isBackground => {
  pinDefinition();
  for (const [model, thinkingLevel] of [[models[0], "high"], [models[1], "off"]] as const) {
    Object.assign(parent, { model, thinkingLevel });
    const options = await agentCall(isBackground);
    expect(options.model).toBe(model);
    expect(options.thinkingLevel).toBe(thinkingLevel);
  }
});

it.each([false, true])("manager runner inherits live parent settings without a tool resolver (background=%s)", async isBackground => {
  pinDefinition();
  for (const [model, thinkingLevel] of [[models[0], "high"], [models[1], "off"]] as const) {
    Object.assign(parent, { model, thinkingLevel });
    const count = captures.length;
    if (isBackground) {
      manager.spawn(boot.pi, parent, "general-purpose", "test", { description: "test", isolated: true, isBackground });
      await manager.waitForAll();
    } else {
      await manager.spawnAndWait(boot.pi, parent, "general-purpose", "test", { description: "test", isolated: true });
    }
    expect(captures[count].model).toBe(model);
    expect(captures[count].thinkingLevel).toBe(thinkingLevel);
  }
});

it.each(["off", "minimal", "low", "medium", "high", "xhigh", "max"] as const)("explicit Agent choices beat conflicting pins: %s", async thinking => {
  pinDefinition();
  for (const isBackground of [false, true]) {
    const options = await agentCall(isBackground, { model: "fixture/explicit", thinking });
    expect(options.model).toBe(models[3]);
    expect(options.thinkingLevel).toBe(thinking);
  }
});

it.each([
  { choices: { model: "fixture/explicit" }, model: models[3], thinking: "high" },
  { choices: { thinking: "off" as const }, model: models[0], thinking: "off" },
])("Agent inherits the field not supplied by an explicit choice: %j", async ({ choices, model, thinking }) => {
  pinDefinition();
  const options = await agentCall(false, choices);
  expect(options.model).toBe(model);
  expect(options.thinkingLevel).toBe(thinking);
});

it("uses the older Pi live thinking getter only when the context has no thinking level", async () => {
  Object.assign(parent, { thinkingLevel: undefined });
  const options = await agentCall(false);
  expect(options.thinkingLevel).toBe("low");
  expect(boot.pi.getThinkingLevel).toHaveBeenCalledOnce();
});

it("registered background workflow constructs a child with current parent settings", async () => {
  pinDefinition();
  Object.assign(parent, { model: models[1], thinkingLevel: "off" });
  await boot.tools.get("SubagentWorkflow").execute("workflow", {
    script: "export const meta = { name: 'test', description: 'test' }; return await agent('test');",
  }, undefined, undefined, parent);
  await vi.waitFor(() => expect(captures).toHaveLength(1));
  expect(captures[0].model).toBe(models[1]);
  expect(captures[0].thinkingLevel).toBe("off");
  await vi.waitFor(() => expect(boot.pi.sendMessage).toHaveBeenCalledWith(
    expect.objectContaining({ customType: "subagent-notification", details: expect.objectContaining({ status: "completed" }) }),
    expect.anything(),
  ));
});

it("one workflow host reads parent changes between child dispatches", async () => {
  pinDefinition();
  const host = createWorkflowHost({ pi: boot.pi, ctx: parent, manager, workflowId: "test" });
  const spawn = host.spawnAgent.bind(host);
  host.spawnAgent = async request => {
    const result = await spawn(request);
    Object.assign(parent, { model: models[1], thinkingLevel: "off" });
    return result;
  };
  const result = await runWorkflow({
    script: "export const meta = { name: 'test', description: 'test' }; await agent('first'); return await agent('second');",
    host,
  });
  expect(result.status).toBe("completed");
  expect(result.value).not.toBeNull();
  expect(captures.map(options => options.model)).toEqual([models[0], models[1]]);
  expect(captures.map(options => options.thinkingLevel)).toEqual(["high", "off"]);
});

it.each(["off", "minimal", "low", "medium", "high", "xhigh", "max"] as const)("workflow explicit choices beat pins: %s", async effort => {
  pinDefinition();
  const result = await runWorkflow({
    script: `export const meta = { name: 'test', description: 'test' }; return await agent('test', { model: 'fixture/explicit', effort: '${effort}' });`,
    host: createWorkflowHost({ pi: boot.pi, ctx: parent, manager, workflowId: "test" }),
  });
  expect(result.status).toBe("completed");
  expect(result.value).not.toBeNull();
  expect(captures).toHaveLength(1);
  expect(captures[0].model).toBe(models[3]);
  expect(captures[0].thinkingLevel).toBe(effort);
});

it.each([false, true])("nested tool inherits its immediate caller, not root or pins (background=%s)", async isBackground => {
  pinDefinition();
  const nested = createNestedSubagentTools({
    manager, pi: boot.pi, parentAgentId: "owner", depth: 1, maxSubagentDepth: 2,
    allowedSubagents: ["general-purpose"], configCwd: parent.cwd,
  }).find(tool => tool.name === "Agent")!;
  const caller = makeContext({ model: models[1], thinkingLevel: "off", modelRegistry: registry });
  for (const choices of [{}, { model: "fixture/explicit", thinking: "low" }, {}]) {
    const count = captures.length;
    await nested.execute("nested", {
      subagent_type: "general-purpose", description: "nested", prompt: "test",
      run_in_background: isBackground, isolated: true, ...choices,
    }, undefined, undefined, caller);
    await manager.waitForAll();
    expect(captures).toHaveLength(count + 1);
    expect(captures[count].model).toBe(choices.model ? models[3] : caller.model);
    expect(captures[count].thinkingLevel).toBe(choices.thinking ?? caller.thinkingLevel);
    Object.assign(caller, { model: models[0], thinkingLevel: "high" });
  }
});

it.each(["off", "minimal", "low", "medium", "high", "xhigh", "max"] as const)("nested explicit choices beat pins: %s", async thinking => {
  pinDefinition();
  const nested = createNestedSubagentTools({
    manager, pi: boot.pi, parentAgentId: "owner", depth: 1, maxSubagentDepth: 2,
    allowedSubagents: ["general-purpose"], configCwd: parent.cwd,
  }).find(tool => tool.name === "Agent")!;
  for (const isBackground of [false, true]) {
    const count = captures.length;
    await nested.execute("nested", {
      subagent_type: "general-purpose", description: "nested", prompt: "test",
      run_in_background: isBackground, isolated: true, model: "fixture/explicit", thinking,
    }, undefined, undefined, parent);
    await manager.waitForAll();
    expect(captures[count].model).toBe(models[3]);
    expect(captures[count].thinkingLevel).toBe(thinking);
  }
});

it("runner injects nested tools without changing role permissions", async () => {
  definitions.set("general-purpose", {
    ...DEFAULT_AGENTS.get("general-purpose")!, extensions: false, skills: false,
    builtinToolNames: ["read", "write"], disallowedTools: ["write"], allowedSubagents: ["Explore"],
  });
  registerAgents(definitions);
  const { record } = await manager.spawnAndWait(boot.pi, parent, "general-purpose", "test", { description: "test" });
  expect(record.status).toBe("completed");
  expect(captures[0].tools).toContain("read");
  expect(captures[0].tools).not.toContain("write");
  const nested = captures[0].customTools?.find((tool: ToolDefinition) => tool.name === "Agent");
  expect(nested).toBeDefined();
  const caller = makeContext({ model: models[1], thinkingLevel: "low", modelRegistry: registry });
  await nested!.execute("nested", { subagent_type: "Explore", prompt: "test", description: "test", isolated: true }, undefined, undefined, caller);
  expect(captures).toHaveLength(2);
  expect(captures[1].model).toBe(models[1]);
  expect(captures[1].thinkingLevel).toBe("low");
  expect(captures[1].tools).not.toContain("write");
});

it("parent changes affect later children but not an already running child", async () => {
  let release!: () => void;
  execution.pause = new Promise<void>(resolve => { release = resolve; });
  const id = manager.spawn(boot.pi, parent, "general-purpose", "test", { description: "test", isolated: true });
  try {
    await vi.waitFor(() => expect(manager.getRecord(id)?.session).toBeDefined());
    expect(manager.getRecord(id)?.status).toBe("running");
    Object.assign(parent, { model: models[1], thinkingLevel: "off" });
    execution.pause = undefined;
    const { record } = await manager.spawnAndWait(boot.pi, parent, "general-purpose", "later", { description: "test", isolated: true });
    expect(record.session?.model).toBe(models[1]);
    expect(record.session?.thinkingLevel).toBe("off");
    expect(manager.getRecord(id)?.session?.model).toBe(models[0]);
    expect(manager.getRecord(id)?.session?.thinkingLevel).toBe("high");
  } finally {
    release();
    await manager.waitForAll();
  }
});

it("resume keeps the existing child after the parent selection changes", async () => {
  const { id, record } = await manager.spawnAndWait(boot.pi, parent, "general-purpose", "test", { description: "test", isolated: true });
  const session = record.session;
  Object.assign(parent, { model: models[1], thinkingLevel: "off" });
  const resumed = await manager.resume(id, "continue");
  expect(resumed?.status).toBe("completed");
  expect(resumed?.session).toBe(session);
  expect(resumed?.session?.model).toBe(models[0]);
  expect(resumed?.session?.thinkingLevel).toBe("high");
  expect(captures).toHaveLength(1);
});

it.each([false, true])("file resume keeps its existing option resolution (definition pins=%s)", async isPinned => {
  if (isPinned) pinDefinition();
  Object.assign(parent, { model: models[1], thinkingLevel: "off" });
  await manager.spawnAndWait(boot.pi, parent, "general-purpose", "continue", {
    description: "resume", isolated: true, resumeSessionFile: "/sessions/saved.jsonl",
  });
  expect(captures[0].model).toBe(isPinned ? models[4] : models[1]);
  expect(captures[0].thinkingLevel).toBe(isPinned ? "medium" : undefined);
  expect(boot.pi.getThinkingLevel).not.toHaveBeenCalled();
});

it("file resume keeps explicit session options", async () => {
  pinDefinition();
  await manager.spawnAndWait(boot.pi, parent, "general-purpose", "continue", {
    description: "resume", isolated: true, resumeSessionFile: "/sessions/saved.jsonl",
    model: models[3], thinkingLevel: "off",
  });
  expect(captures[0].model).toBe(models[3]);
  expect(captures[0].thinkingLevel).toBe("off");
});

it("retired session override requests cannot replace current parent or explicit choices", async () => {
  const handlers = new Map<string, (payload: unknown) => void>();
  boot.pi.events.on.mockImplementation((name: string, handler: (payload: unknown) => void) => {
    handlers.set(name, handler);
    return () => handlers.delete(name);
  });
  await boot.lifecycle.get("session_start")({}, parent);
  const channel = "subagents:rpc:model_override";
  handlers.get(channel)!({ requestId: "old-policy", model: "fixture/definition", thinkingLevel: "medium" });
  await vi.waitFor(() => expect(boot.pi.events.emit).toHaveBeenCalledWith(`${channel}:reply:old-policy`, {
    success: false,
    error: expect.stringContaining("retired"),
  }));
  Object.assign(parent, { model: models[1], thinkingLevel: "off" });
  const inherited = await agentCall(false);
  expect(inherited.model).toBe(models[1]);
  expect(inherited.thinkingLevel).toBe("off");
  const explicit = await agentCall(true, { model: "fixture/explicit", thinking: "low" });
  expect(explicit.model).toBe(models[3]);
  expect(explicit.thinkingLevel).toBe("low");
});

it("a queued child keeps the pair selected at dispatch, not the pair at queue drain", async () => {
  await boot.lifecycle.get("session_start")({}, parent);
  let release!: () => void;
  execution.pause = new Promise<void>(resolve => { release = resolve; });
  // Fill the default background pool of 10 with paused children.
  for (let index = 0; index < 10; index++) {
    await boot.tools.get("Agent").execute(`fill-${index}`, {
      subagent_type: "general-purpose", description: "fill", prompt: "fill",
      run_in_background: true, isolated: true,
    }, undefined, undefined, parent);
  }
  await vi.waitFor(() => expect(captures).toHaveLength(10));
  await boot.tools.get("Agent").execute("queued", {
    subagent_type: "general-purpose", description: "queued", prompt: "queued",
    run_in_background: true, isolated: true,
  }, undefined, undefined, parent);
  expect(captures).toHaveLength(10);
  Object.assign(parent, { model: models[1], thinkingLevel: "off" });
  release();
  await vi.waitFor(() => expect(captures).toHaveLength(11));
  expect(captures[10].model).toBe(models[0]);
  expect(captures[10].thinkingLevel).toBe("high");
});

it("an empty thinking string inherits the parent level, the same way an empty model does", async () => {
  const emptyThinking = await agentCall(false, { thinking: "" as never });
  expect(emptyThinking.model).toBe(models[0]);
  expect(emptyThinking.thinkingLevel).toBe("high");
  const emptyModel = await agentCall(false, { model: "" });
  expect(emptyModel.model).toBe(models[0]);
  expect(emptyModel.thinkingLevel).toBe("high");
});

it("a queued direct spawn with no model keeps the model selected at dispatch", async () => {
  // The Agent tool passes the parent's model itself. RPC, mention and registry
  // spawns pass none, so only the snapshot in `spawn` fixes their model.
  const pool = new AgentManager(undefined, 1);
  let release!: () => void;
  execution.pause = new Promise<void>(resolve => { release = resolve; });
  try {
    pool.spawn(boot.pi, parent, "general-purpose", "fill", { description: "fill", isolated: true, isBackground: true });
    await vi.waitFor(() => expect(captures).toHaveLength(1));
    pool.spawn(boot.pi, parent, "general-purpose", "queued", { description: "queued", isolated: true, isBackground: true });
    expect(captures).toHaveLength(1);
    Object.assign(parent, { model: models[1], thinkingLevel: "off" });
    release();
    await vi.waitFor(() => expect(captures).toHaveLength(2));
    expect(captures[1].model).toBe(models[0]);
    expect(captures[1].thinkingLevel).toBe("high");
  } finally {
    release();
    await pool.dispose();
  }
});

it("a queued child with an empty thinking string keeps the level selected at dispatch", async () => {
  const pool = new AgentManager(undefined, 1);
  let release!: () => void;
  execution.pause = new Promise<void>(resolve => { release = resolve; });
  try {
    pool.spawn(boot.pi, parent, "general-purpose", "fill", { description: "fill", isolated: true, isBackground: true });
    await vi.waitFor(() => expect(captures).toHaveLength(1));
    pool.spawn(boot.pi, parent, "general-purpose", "queued", {
      description: "queued", isolated: true, isBackground: true, thinkingLevel: "" as never,
    });
    Object.assign(parent, { model: models[1], thinkingLevel: "off" });
    release();
    await vi.waitFor(() => expect(captures).toHaveLength(2));
    expect(captures[1].thinkingLevel).toBe("high");
  } finally {
    release();
    await pool.dispose();
  }
});

it("a file resume with an empty thinking string falls through to its own resolution", async () => {
  pinDefinition();
  await manager.spawnAndWait(boot.pi, parent, "general-purpose", "continue", {
    description: "resume", isolated: true, resumeSessionFile: "/sessions/saved.jsonl", thinkingLevel: "" as never,
  });
  expect(captures[0].thinkingLevel).toBe("medium");
});
