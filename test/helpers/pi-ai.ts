import type { Context, Tool } from "@earendil-works/pi-ai";
import * as piAi from "@earendil-works/pi-ai";

export { getModel, registerFauxProvider, streamSimple } from "@earendil-works/pi-ai/compat";

const transcript = piAi as typeof piAi & {
  getCurrentTools?: (messages: Context["messages"]) => Tool[];
  getCurrentSystemPrompt?: (messages: Context["messages"]) => string;
};

export function responderContext(context: Context): Context {
  return {
    ...context,
    tools: context.tools ?? transcript.getCurrentTools?.(context.messages),
    systemPrompt: context.systemPrompt ?? transcript.getCurrentSystemPrompt?.(context.messages),
  };
}
