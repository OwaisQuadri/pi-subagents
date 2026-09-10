import { describe, expect, it, vi } from "vitest";
import { createAskParentQuestionTool } from "../src/ask-parent-question.js";

interface ExecutableTool {
  execute(
    toolCallId: string,
    params: unknown,
    signal: AbortSignal | undefined,
    onUpdate: undefined,
    context: unknown,
  ): Promise<{ details: unknown }>;
}

describe("ask_parent_question", () => {
  it("returns unavailable without sending a user-service event when parent context is absent", async () => {
    const emit = vi.fn();
    const tool = createAskParentQuestionTool({ events: { emit, on: vi.fn(() => () => {}) } } as never, undefined) as unknown as ExecutableTool;

    const result = await tool.execute("question-1", { question: "Which plan?", details: "Do not ask the user." }, undefined, undefined, {});

    expect(result.details).toEqual({
      status: "unavailable",
      question: "Which plan?",
      message: "Parent context is unavailable.",
    });
    expect(emit).not.toHaveBeenCalled();
  });

  it("preserves cancellation before inspecting parent context", async () => {
    const controller = new AbortController();
    controller.abort();
    const emit = vi.fn();
    const tool = createAskParentQuestionTool({ events: { emit, on: vi.fn(() => () => {}) } } as never, undefined) as unknown as ExecutableTool;

    const result = await tool.execute("question-1", { question: "Which plan?" }, controller.signal, undefined, {});

    expect(result.details).toEqual({ status: "cancelled", question: "Which plan?" });
    expect(emit).not.toHaveBeenCalled();
  });
});
