import { randomUUID } from "node:crypto";
import { defineTool, type ExtensionAPI, type ToolDefinition } from "@earendil-works/pi-coding-agent";
import { type Static, Type } from "@sinclair/typebox";

export const ASK_USER_QUESTION_TOOL_NAME = "ask_user_question";
const ASK_USER_QUESTION_RPC = "ask-user-question:rpc";
const ASK_USER_QUESTION_PING_CHANNEL = `${ASK_USER_QUESTION_RPC}:ping`;
const ASK_USER_QUESTION_ASK_CHANNEL = `${ASK_USER_QUESTION_RPC}:ask`;
const ASK_USER_QUESTION_TIMEOUT_MS = 300_000;

const AskUserQuestionParams = Type.Object({
  question: Type.String({
    description: "The single question to ask the user. Ask exactly one question per tool call.",
  }),
  details: Type.Optional(Type.String({
    description: "Optional extra context or instructions shown under the question.",
  })),
  options: Type.Optional(Type.Array(Type.Object({
    label: Type.String({
      description: 'Display label for the option. If you recommend an option, place it first and append "(Recommended)" to the label.',
    }),
    value: Type.Optional(Type.String({
      description: "Optional machine-readable value returned for the option. Defaults to the label.",
    })),
    description: Type.Optional(Type.String({ description: "Optional extra detail shown below the option." })),
  }), {
    description: "Optional multiple-choice options. Omit or pass an empty array for free-form text input. Users will always be able to choose Other and type a custom answer when options are provided.",
  })),
  multiSelect: Type.Optional(Type.Boolean({
    description: "Set to true to allow multiple answers to the same question.",
  })),
});

type AskUserQuestionInput = Static<typeof AskUserQuestionParams>;
type AskUserQuestionStatus = "answered" | "cancelled" | "invalid" | "unavailable" | "error";
type AskUserQuestionMode = "text" | "single-select" | "multi-select";
type AskUserQuestionAnswer =
  | { type: "text"; label: string; value: string }
  | { type: "option"; label: string; value: string; index: number }
  | { type: "other"; label: string; value: string };

interface AskUserQuestionDetails {
  status: AskUserQuestionStatus;
  question: string;
  context?: string;
  mode: AskUserQuestionMode;
  answers: AskUserQuestionAnswer[];
  message?: string;
}

interface AskUserQuestionResult {
  content: Array<{ type: "text"; text: string }>;
  details: AskUserQuestionDetails;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function rpcData(value: unknown): unknown {
  return isRecord(value) && value.success === true ? value.data : undefined;
}

function rpcError(value: unknown): string | undefined {
  return isRecord(value) && value.success === false && typeof value.error === "string"
    ? value.error
    : undefined;
}

function isAnswer(value: unknown): value is AskUserQuestionAnswer {
  if (!isRecord(value) || typeof value.type !== "string" || typeof value.label !== "string" || typeof value.value !== "string") {
    return false;
  }
  return value.type === "text" || value.type === "other"
    || (value.type === "option" && typeof value.index === "number");
}

function isQuestionResult(value: unknown, question: string): value is AskUserQuestionResult {
  if (!isRecord(value) || !Array.isArray(value.content) || !isRecord(value.details)) return false;
  if (!value.content.every((item) => isRecord(item) && item.type === "text" && typeof item.text === "string")) {
    return false;
  }
  const details = value.details;
  const isStatus = details.status === "answered" || details.status === "cancelled"
    || details.status === "invalid" || details.status === "unavailable" || details.status === "error";
  const isMode = details.mode === "text" || details.mode === "single-select" || details.mode === "multi-select";
  return isStatus
    && details.question === question
    && isMode
    && Array.isArray(details.answers)
    && details.answers.every(isAnswer)
    && (details.context === undefined || typeof details.context === "string")
    && (details.message === undefined || typeof details.message === "string");
}

function resultMode(params: AskUserQuestionInput): AskUserQuestionMode {
  if (!params.options || params.options.length === 0) return "text";
  return params.multiSelect ? "multi-select" : "single-select";
}

function unavailableResult(params: AskUserQuestionInput): AskUserQuestionResult {
  const message = "ask-user-question service is unavailable.";
  return {
    content: [{ type: "text", text: message }],
    details: { status: "unavailable", question: params.question, mode: resultMode(params), answers: [], message },
  };
}

function cancelledResult(params: AskUserQuestionInput): AskUserQuestionResult {
  const message = "User cancelled the question";
  return {
    content: [{ type: "text", text: message }],
    details: { status: "cancelled", question: params.question, mode: resultMode(params), answers: [], message },
  };
}

function errorResult(params: AskUserQuestionInput, message: string) {
  return {
    content: [{ type: "text" as const, text: message }],
    details: { status: "error" as const, question: params.question, mode: resultMode(params), answers: [], message },
    isError: true as const,
  };
}

function abortError(signal: AbortSignal): Error {
  return signal.reason instanceof Error ? signal.reason : new DOMException("Aborted", "AbortError");
}

function waitForReply(pi: ExtensionAPI, channel: string, signal: AbortSignal | undefined): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError(signal));
      return;
    }
    const unsubscribe = pi.events.on(channel, (payload: unknown) => {
      cleanup();
      resolve(payload);
    });
    const onAbort = () => {
      cleanup();
      reject(abortError(signal as AbortSignal));
    };
    const cleanup = () => {
      unsubscribe();
      signal?.removeEventListener("abort", onAbort);
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export async function askUserQuestion(
  pi: ExtensionAPI,
  params: AskUserQuestionInput,
  signal: AbortSignal | undefined,
  timeoutMs = ASK_USER_QUESTION_TIMEOUT_MS,
): Promise<AskUserQuestionResult> {
  const pingRequestId = randomUUID();
  let pingReply: unknown;
  const unsubscribe = pi.events.on(`${ASK_USER_QUESTION_PING_CHANNEL}:reply:${pingRequestId}`, (reply: unknown) => {
    pingReply ??= reply;
  });
  try {
    pi.events.emit(ASK_USER_QUESTION_PING_CHANNEL, { requestId: pingRequestId });
  } catch (error) {
    return errorResult(params, error instanceof Error ? error.message : String(error));
  } finally {
    unsubscribe();
  }
  const pingError = rpcError(pingReply);
  if (pingError !== undefined) return errorResult(params, pingError);
  const pingData = rpcData(pingReply);
  if (!isRecord(pingData) || pingData.version !== 1) return unavailableResult(params);
  if (signal?.aborted) return cancelledResult(params);

  const requestId = randomUUID();
  const timeoutController = new AbortController();
  const timeout = setTimeout(
    () => timeoutController.abort(new Error("ask-user-question service timed out.")),
    timeoutMs,
  );
  const onAbort = () => timeoutController.abort(signal?.reason);
  if (signal?.aborted) onAbort();
  else signal?.addEventListener("abort", onAbort, { once: true });
  try {
    const reply = waitForReply(pi, `${ASK_USER_QUESTION_ASK_CHANNEL}:reply:${requestId}`, timeoutController.signal);
    try {
      pi.events.emit(ASK_USER_QUESTION_ASK_CHANNEL, { requestId, params, signal: timeoutController.signal });
    } catch (error) {
      timeoutController.abort(error);
      await reply.catch(() => undefined);
      throw error;
    }
    const settledReply = await reply;
    const error = rpcError(settledReply);
    if (error !== undefined) return errorResult(params, error);
    const data = rpcData(settledReply);
    if (!isQuestionResult(data, params.question)) {
      return errorResult(params, "ask-user-question returned malformed data.");
    }
    return data;
  } catch (error) {
    if (signal?.aborted) return cancelledResult(params);
    return errorResult(params, error instanceof Error ? error.message : String(error));
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onAbort);
  }
}

export function createAskUserQuestionTool(pi: ExtensionAPI): ToolDefinition {
  return defineTool({
    name: ASK_USER_QUESTION_TOOL_NAME,
    label: "Ask User Question",
    description: "Ask the user a single question and pause execution until they answer. Use this when requirements are ambiguous, user preferences are needed, a decision would materially affect implementation, or you need confirmation before proceeding.",
    promptSnippet: "Use this tool to ask exactly one clarifying question, missing-requirement question, preference question, or decision question before continuing.",
    promptGuidelines: [
      "Ask exactly one question per tool call.",
      "If you need answers to multiple questions, make multiple separate ask_user_question tool calls instead of combining them into one prompt.",
      'Users will always be able to select "Other" to provide custom text input when options are provided.',
      "Use multiSelect: true only when you need multiple answers to the same question.",
      'If you recommend a specific option, make it the first option and add "(Recommended)" at the end of its label.',
      "Prefer this tool over guessing when requirements, preferences, or implementation choices are unclear.",
    ],
    parameters: AskUserQuestionParams,
    execute: async (_toolCallId, params, signal) => askUserQuestion(pi, params, signal),
  });
}
