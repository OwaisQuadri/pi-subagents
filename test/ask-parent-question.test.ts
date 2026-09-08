import { describe, expect, it, vi } from "vitest";
import { askUserFallback } from "../src/ask-parent-question.js";

interface Listener {
  (payload: unknown): void;
}

function pi(version: number | undefined, answer?: string, isCancelled = false) {
  const listeners = new Map<string, Listener[]>();
  const events = {
    on(channel: string, listener: Listener) {
      const channelListeners = listeners.get(channel) ?? [];
      channelListeners.push(listener);
      listeners.set(channel, channelListeners);
      return () => listeners.set(channel, (listeners.get(channel) ?? []).filter(item => item !== listener));
    },
    emit(channel: string, payload: unknown) {
      if (channel === "ask-user-question:rpc:ping" && version !== undefined) {
        const requestId = (payload as { requestId: string }).requestId;
        for (const listener of listeners.get(`ask-user-question:rpc:ping:reply:${requestId}`) ?? []) {
          listener({ success: true, data: { version } });
        }
      }
      if (channel === "ask-user-question:rpc:ask" && (answer !== undefined || isCancelled)) {
        const requestId = (payload as { requestId: string }).requestId;
        for (const listener of listeners.get(`ask-user-question:rpc:ask:reply:${requestId}`) ?? []) {
          listener(isCancelled
            ? { success: true, data: { details: { status: "cancelled", answers: [] } } }
            : {
              success: true,
              data: {
                content: [{ type: "text", text: `User answered: ${answer}` }],
                details: { status: "answered", answers: [{ type: "text", label: answer, value: answer }] },
              },
            });
        }
      }
    },
  };
  return { events };
}

describe("ask-user-question fallback", () => {
  it("returns the exact first text reply after a version-one synchronous probe", async () => {
    const result = await askUserFallback(pi(1, "exact answer") as never, "Which?", "more", undefined);

    expect(result).toEqual({ status: "answered", source: "user", question: "Which?", answer: "exact answer" });
  });

  it("returns unavailable without sending a question when the service is absent or incompatible", async () => {
    const result = await askUserFallback(pi(2) as never, "Which?", undefined, undefined);

    expect(result).toEqual({ status: "unavailable", question: "Which?", message: "ask-user-question service is unavailable." });
  });

  it("returns cancellation from the shared question service", async () => {
    const result = await askUserFallback(pi(1, undefined, true) as never, "Which?", undefined, undefined);

    expect(result).toEqual({ status: "cancelled", question: "Which?" });
  });

  it("returns an RPC error rather than treating a failed service reply as an empty answer", async () => {
    const listeners = new Map<string, Listener[]>();
    const events = {
      on(channel: string, listener: Listener) {
        listeners.set(channel, [...(listeners.get(channel) ?? []), listener]);
        return () => listeners.set(channel, (listeners.get(channel) ?? []).filter(item => item !== listener));
      },
      emit(channel: string, payload: unknown) {
        const requestId = (payload as { requestId: string }).requestId;
        const replyChannel = `${channel}:reply:${requestId}`;
        for (const listener of listeners.get(replyChannel) ?? []) {
          listener(channel.endsWith(":ping") ? { success: true, data: { version: 1 } } : { success: false, error: "dialog failed" });
        }
      },
    };

    await expect(askUserFallback({ events } as never, "Which?", undefined, undefined)).resolves.toEqual({
      status: "error",
      question: "Which?",
      message: "dialog failed",
    });
  });

  it("preserves an invalid-service explanation", async () => {
    const listeners = new Map<string, Listener[]>();
    const events = {
      on(channel: string, listener: Listener) {
        listeners.set(channel, [...(listeners.get(channel) ?? []), listener]);
        return () => listeners.set(channel, (listeners.get(channel) ?? []).filter(item => item !== listener));
      },
      emit(channel: string, payload: unknown) {
        const requestId = (payload as { requestId: string }).requestId;
        const reply = channel.endsWith(":ping")
          ? { success: true, data: { version: 1 } }
          : { success: true, data: { details: { status: "invalid", message: "Question is blank." } } };
        for (const listener of listeners.get(`${channel}:reply:${requestId}`) ?? []) listener(reply);
      },
    };

    await expect(askUserFallback({ events } as never, "Which?", undefined, undefined)).resolves.toEqual({
      status: "error",
      question: "Which?",
      message: "Question is blank.",
    });
  });

  it("honors a signal aborted before the ask listener is attached", async () => {
    const controller = new AbortController();
    controller.abort();

    const result = await askUserFallback(pi(1) as never, "Which?", undefined, controller.signal);

    expect(result).toEqual({ status: "cancelled", question: "Which?" });
  });

  it("does not emit an ask after a synchronous ping reply aborts the caller", async () => {
    const controller = new AbortController();
    const listeners = new Map<string, Listener[]>();
    const emitted: string[] = [];
    const events = {
      on(channel: string, listener: Listener) {
        listeners.set(channel, [...(listeners.get(channel) ?? []), listener]);
        return () => listeners.set(channel, (listeners.get(channel) ?? []).filter(item => item !== listener));
      },
      emit(channel: string, payload: unknown) {
        emitted.push(channel);
        if (channel !== "ask-user-question:rpc:ping") return;
        const requestId = (payload as { requestId: string }).requestId;
        for (const listener of listeners.get(`${channel}:reply:${requestId}`) ?? []) {
          listener({ success: true, data: { version: 1 } });
        }
        controller.abort();
      },
    };

    await expect(askUserFallback({ events } as never, "Which?", undefined, controller.signal)).resolves.toEqual({
      status: "cancelled",
      question: "Which?",
    });
    expect(emitted).toEqual(["ask-user-question:rpc:ping"]);
  });

  it("cancels the pending RPC and forwards its signal", async () => {
    const controller = new AbortController();
    const pending = askUserFallback(pi(1) as never, "Which?", undefined, controller.signal);
    controller.abort();

    await expect(pending).resolves.toEqual({ status: "cancelled", question: "Which?" });
  });

  it("times out a service that accepts a request but never replies", async () => {
    const result = await askUserFallback(pi(1) as never, "Which?", undefined, undefined, 1);

    expect(result).toEqual({
      status: "error",
      question: "Which?",
      message: "ask-user-question service timed out.",
    });
  });

  it("removes the ask listener when emitting the ask channel throws", async () => {
    const listeners = new Map<string, Listener[]>();
    const askUnsubscribe = vi.fn();
    const events = {
      on(channel: string, listener: Listener) {
        listeners.set(channel, [...(listeners.get(channel) ?? []), listener]);
        return channel.includes(":ask:reply:") ? askUnsubscribe : () => {};
      },
      emit(channel: string, payload: unknown) {
        if (channel.endsWith(":ping")) {
          const requestId = (payload as { requestId: string }).requestId;
          for (const listener of listeners.get(`${channel}:reply:${requestId}`) ?? []) {
            listener({ success: true, data: { version: 1 } });
          }
          return;
        }
        throw new Error("ask listener failed");
      },
    };

    await expect(askUserFallback({ events } as never, "Which?", undefined, undefined)).resolves.toEqual({
      status: "error",
      question: "Which?",
      message: "ask listener failed",
    });
    expect(askUnsubscribe).toHaveBeenCalledOnce();
  });

  it("returns a ping emit failure and always removes its listener", async () => {
    const listeners = new Map<string, Listener[]>();
    const unsubscribe = vi.fn();
    const events = {
      on(channel: string, listener: Listener) {
        listeners.set(channel, [listener]);
        return unsubscribe;
      },
      emit() {
        throw new Error("listener failed");
      },
    };

    await expect(askUserFallback({ events } as never, "Which?", undefined, undefined)).resolves.toEqual({
      status: "error",
      question: "Which?",
      message: "listener failed",
    });
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});
