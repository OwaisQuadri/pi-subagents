import { describe, expect, it } from "vitest";
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

describe("SessionModelOverride", () => {
  it("forces the resolved model and thinking level after earlier spawn choices", () => {
    const override = new SessionModelOverride();

    expect(override.update({ model: "openai/gpt-5.5", thinkingLevel: "high" }, registry)).toEqual({ success: true });
    expect(override.apply("Explore", { model: otherModel, thinkingLevel: "low" })).toEqual({
      model: forcedModel,
      thinkingLevel: "high",
    });
  });

  it("accepts Pi's off thinking level", () => {
    const override = new SessionModelOverride();

    expect(override.update({ model: "openai/gpt-5.5", thinkingLevel: "off" }, registry)).toEqual({ success: true });
    expect(override.apply("Explore", { model: otherModel, thinkingLevel: "high" })).toEqual({
      model: forcedModel,
      thinkingLevel: "off",
    });
  });

  it("keeps excluded agent types on their normal route", () => {
    const override = new SessionModelOverride();

    override.update(
      { model: "openai/gpt-5.5", thinkingLevel: "high", excludedAgentTypes: ["Explore"] },
      registry,
    );

    expect(override.apply("explore", { model: otherModel, thinkingLevel: "low" })).toEqual({
      model: otherModel,
      thinkingLevel: "low",
    });
    expect(override.apply("Plan", { model: otherModel, thinkingLevel: "low" })).toEqual({
      model: forcedModel,
      thinkingLevel: "high",
    });
  });

  it("keeps its active state when a malformed request or unresolved model arrives", () => {
    const override = new SessionModelOverride();

    override.update({ model: "openai/gpt-5.5", thinkingLevel: "high" }, registry);

    expect(override.update({ clear: true, model: "openai/gpt-5.5" }, registry)).toMatchObject({ success: false });
    expect(override.update({ model: "missing/model", thinkingLevel: "low" }, registry)).toMatchObject({ success: false });
    expect(override.apply("Plan", {})).toEqual({ model: forcedModel, thinkingLevel: "high" });
  });

  it("clears only when the clear request is valid", () => {
    const override = new SessionModelOverride();

    override.update({ model: "openai/gpt-5.5", thinkingLevel: "high" }, registry);
    expect(override.update({ clear: true }, registry)).toEqual({ success: true });
    expect(override.apply("Plan", { model: otherModel, thinkingLevel: "low" })).toEqual({
      model: otherModel,
      thinkingLevel: "low",
    });
  });
});
