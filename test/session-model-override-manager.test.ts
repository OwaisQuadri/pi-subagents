import { describe, expect, it, vi } from "vitest";

vi.mock("../src/agent-runner.js", () => ({
  runAgent: vi.fn(),
  resumeAgent: vi.fn(),
}));

import { AgentManager } from "../src/agent-manager.js";
import { resumeAgent, runAgent } from "../src/agent-runner.js";
import { SessionModelOverride } from "../src/session-model-override.js";

const forcedModel = { provider: "openai", id: "gpt-5.5", name: "GPT 5.5" };
const otherModel = { provider: "anthropic", id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6" };
const registry = {
  find(provider: string, id: string) {
    return [forcedModel, otherModel].find(model => model.provider === provider && model.id === id);
  },
  getAvailable() {
    return [forcedModel, otherModel];
  },
  getAll() {
    return [forcedModel, otherModel];
  },
};

const pi = {} as any;
const ctx = { cwd: process.cwd() } as any;

describe("AgentManager session model overrides", () => {
  it("applies one policy to detached and blocking new agents, but not resume", async () => {
    const override = new SessionModelOverride();
    override.update({ model: "openai/gpt-5.5", thinkingLevel: "high" }, registry);
    const session = { model: forcedModel };
    vi.mocked(runAgent).mockImplementation(async (_ctx, _type, _prompt, options: any) => {
      options.onSessionCreated?.(session);
      return { responseText: "done", session, aborted: false, steered: false };
    });
    vi.mocked(resumeAgent).mockResolvedValue({ responseText: "resumed", session, aborted: false, steered: false });
    const manager = new AgentManager(undefined, 10, undefined, undefined, undefined, override);

    const detached = manager.spawn(pi, ctx, "Plan", "first", {
      description: "first",
      model: otherModel,
      thinkingLevel: "low",
    });
    await manager.getRecord(detached)?.promise;
    await manager.spawnAndWait(pi, ctx, "Plan", "second", {
      description: "second",
      model: otherModel,
      thinkingLevel: "low",
    });

    expect(vi.mocked(runAgent)).toHaveBeenNthCalledWith(
      1,
      ctx,
      "Plan",
      "first",
      expect.objectContaining({ model: forcedModel, thinkingLevel: "high" }),
    );
    expect(vi.mocked(runAgent)).toHaveBeenNthCalledWith(
      2,
      ctx,
      "Plan",
      "second",
      expect.objectContaining({ model: forcedModel, thinkingLevel: "high" }),
    );

    await manager.resume(detached, "continue");

    expect(vi.mocked(resumeAgent)).toHaveBeenCalledWith(session, "continue", expect.any(Object));
    expect(vi.mocked(resumeAgent)).toHaveBeenCalledTimes(1);
  });
});
