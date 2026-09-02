import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/agent-runner.js", async () => {
  const actual = await vi.importActual<typeof import("../src/agent-runner.js")>("../src/agent-runner.js");
  return { ...actual, runAgent: vi.fn() };
});

import { runAgent } from "../src/agent-runner.js";
import { getAgentConfig } from "../src/agent-types.js";
import subagentsExtension from "../src/index.js";

type RegisteredTool = {
  name: string;
  execute: (...args: unknown[]) => Promise<unknown>;
};

const MODELS = [
  { provider: "anthropic", id: "claude-haiku-4-5", name: "Claude Haiku 4.5" },
  { provider: "openai", id: "gpt-4o", name: "GPT-4o" },
];

function makePi() {
  const tools = new Map<string, RegisteredTool>();
  const pi = {
    registerMessageRenderer: vi.fn(),
    registerTool: vi.fn((tool: RegisteredTool) => tools.set(tool.name, tool)),
    registerCommand: vi.fn(),
    registerEntryRenderer: vi.fn(),
    registerFlag: vi.fn(),
    getFlag: vi.fn(),
    on: vi.fn(),
    events: { emit: vi.fn(), on: vi.fn(() => vi.fn()) },
    appendEntry: vi.fn(),
    sendMessage: vi.fn(),
  };
  return { pi, tools };
}

function makeCtx(cwd: string) {
  return {
    hasUI: false,
    ui: { setStatus: vi.fn(), setWidget: vi.fn(), notify: vi.fn() },
    cwd,
    model: undefined,
    modelRegistry: {
      find: (provider: string, id: string) => MODELS.find(model => model.provider === provider && model.id === id),
      getAvailable: () => MODELS,
    },
    sessionManager: { getSessionId: vi.fn(() => "session-1"), getBranch: vi.fn(() => []) },
    getSystemPrompt: vi.fn(() => "parent"),
  };
}

describe("agentOverrides wiring", () => {
  let cwd: string;
  let agentDir: string;
  let previousCwd: string;
  let previousAgentDir: string | undefined;
  let previousHome: string | undefined;

  beforeEach(() => {
    cwd = mkdtempSync(join(tmpdir(), "pi-agent-overrides-"));
    agentDir = mkdtempSync(join(tmpdir(), "pi-agent-overrides-agent-"));
    previousCwd = process.cwd();
    previousAgentDir = process.env.PI_CODING_AGENT_DIR;
    previousHome = process.env.HOME;
    process.env.PI_CODING_AGENT_DIR = agentDir;
    process.env.HOME = agentDir;
    mkdirSync(join(cwd, ".pi"), { recursive: true });
    writeFileSync(
      join(cwd, ".pi", "subagents.json"),
      JSON.stringify({
        schedulingEnabled: false,
        agentOverrides: { Explore: { model: "openai/gpt-4o" } },
      }),
    );
    process.chdir(cwd);
    vi.mocked(runAgent).mockResolvedValue({ responseText: "done", aborted: false, steered: false });
  });

  afterEach(() => {
    process.chdir(previousCwd);
    if (previousAgentDir == null) delete process.env.PI_CODING_AGENT_DIR;
    else process.env.PI_CODING_AGENT_DIR = previousAgentDir;
    if (previousHome == null) delete process.env.HOME;
    else process.env.HOME = previousHome;
    rmSync(cwd, { recursive: true, force: true });
    rmSync(agentDir, { recursive: true, force: true });
    vi.clearAllMocks();
  });

  it("uses an Explore model override without changing Explore's read-only tools", async () => {
    const { pi, tools } = makePi();
    subagentsExtension(pi as never);
    const agent = tools.get("Agent");
    if (!agent) throw new Error("Agent tool was not registered");

    await agent.execute(
      "tool-call",
      { prompt: "find the implementation", description: "Find implementation", subagent_type: "Explore" },
      undefined,
      undefined,
      makeCtx(cwd),
    );

    expect(vi.mocked(runAgent).mock.lastCall?.[3]?.model).toEqual(MODELS[1]);
    expect(getAgentConfig("Explore")?.builtinToolNames).toEqual(["read", "bash", "grep", "find", "ls"]);
  });
});
