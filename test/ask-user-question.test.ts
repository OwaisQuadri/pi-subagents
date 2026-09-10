import { describe, expect, it, vi } from "vitest";
import { askUserQuestion, createAskUserQuestionTool } from "../src/ask-user-question.js";

interface Listener {
  (payload: unknown): void;
}

interface ExecutableTool {
  execute(
    toolCallId: string,
    params: unknown,
    signal: AbortSignal | undefined,
    onUpdate: undefined,
    context: unknown,
  ): Promise<{ content: unknown; details: unknown; isError?: boolean }>;
}

function eventsFor(reply: unknown, version = 1) {
  const listeners = new Map<string, Listener[]>();
  const emitted: Array<{ channel: string; payload: unknown }> = [];
  return {
    emitted,
    events: {
      on(channel: string, listener: Listener) {
        listeners.set(channel, [...(listeners.get(channel) ?? []), listener]);
        return () => listeners.set(channel, (listeners.get(channel) ?? []).filter(item => item !== listener));
      },
      emit(channel: string, payload: unknown) {
        emitted.push({ channel, payload });
        const requestId = (payload as { requestId: string }).requestId;
        const response = channel.endsWith(":ping")
          ? { success: true, data: { version } }
          : reply;
        for (const listener of listeners.get(`${channel}:reply:${requestId}`) ?? []) listener(response);
      },
    },
  };
}

describe("ask_user_question", () => {
  it("forwards every input field and preserves the full service result", async () => {
    const response = {
      success: true,
      data: {
        content: [{ type: "text", text: "User selected:\n- 1. Fast\n- Other: Custom" }],
        details: {
          status: "answered",
          question: "Which plan?",
          context: "Choose deliberately.",
          mode: "multi-select",
          answers: [
            { type: "option", label: "Fast", value: "fast", index: 1 },
            { type: "other", label: "Custom", value: "custom" },
          ],
        },
      },
    };
    const { events, emitted } = eventsFor(response);
    const params = {
      question: "Which plan?",
      details: "Choose deliberately.",
      options: [
        { label: "Fast", value: "fast", description: "Use the quick route." },
        { label: "Safe", value: "safe", description: "Use the careful route." },
      ],
      multiSelect: true,
    };
    const tool = createAskUserQuestionTool({ events } as never) as unknown as ExecutableTool;

    const result = await tool.execute("question-1", params, undefined, undefined, {});

    expect(result).toEqual(response.data);
    expect(emitted).toHaveLength(2);
    expect(emitted[1]).toMatchObject({
      channel: "ask-user-question:rpc:ask",
      payload: { params },
    });
  });

  it("returns unavailable without asking when version-one discovery fails", async () => {
    const { events, emitted } = eventsFor({ success: true, data: {} }, 2);
    const tool = createAskUserQuestionTool({ events } as never) as unknown as ExecutableTool;

    const result = await tool.execute("question-1", { question: "Which plan?" }, undefined, undefined, {});

    expect(result.details).toEqual({
      status: "unavailable",
      question: "Which plan?",
      mode: "text",
      answers: [],
      message: "ask-user-question service is unavailable.",
    });
    expect(emitted.map(event => event.channel)).toEqual(["ask-user-question:rpc:ping"]);
  });

  it("reports malformed service data instead of changing it into an answer", async () => {
    const { events } = eventsFor({
      success: true,
      data: { content: [{ type: "text", text: "answer" }], details: { status: "answered" } },
    });

    await expect(askUserQuestion({ events } as never, { question: "Which plan?" }, undefined)).resolves.toMatchObject({
      isError: true,
      details: {
        status: "error",
        question: "Which plan?",
        message: "ask-user-question returned malformed data.",
      },
    });
  });

  it("returns cancellation without leaving the ask listener registered", async () => {
    const listeners = new Map<string, Listener[]>();
    const unsubscribe = vi.fn();
    const events = {
      on(channel: string, listener: Listener) {
        listeners.set(channel, [...(listeners.get(channel) ?? []), listener]);
        return channel.includes(":ask:reply:") ? unsubscribe : () => {};
      },
      emit(channel: string, payload: unknown) {
        const requestId = (payload as { requestId: string }).requestId;
        const reply = channel.endsWith(":ping")
          ? { success: true, data: { version: 1 } }
          : {
              success: true,
              data: {
                content: [{ type: "text", text: "User cancelled the question" }],
                details: { status: "cancelled", question: "Which plan?", mode: "text", answers: [] },
              },
            };
        for (const listener of listeners.get(`${channel}:reply:${requestId}`) ?? []) listener(reply);
      },
    };

    await expect(askUserQuestion({ events } as never, { question: "Which plan?" }, undefined)).resolves.toMatchObject({
      details: { status: "cancelled" },
    });
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});
