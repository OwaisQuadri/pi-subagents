/**
 * mention.ts — the `@handle` grammar for messaging a subagent from the prompt.
 *
 * Claude Code lets you type `@code-review take another look` at the prompt and
 * routes the message to that agent instead of the main model. Its grammar is
 * reproduced here so the two behave identically:
 *
 *   - suggestions fire on `@` at the start of the input or after whitespace,
 *     followed by `[\w-]*` (so `@src/foo.ts` is a file, never an agent);
 *   - a send is recognized only at the START of the input, and only with a
 *     non-empty message after the handle. That is why a bare `@code-review`
 *     goes to the main model rather than anywhere near the agent.
 *
 * A record's own identity is a UUID plus a deliberately non-unique description,
 * neither of which is typeable, so the handle is derived from the agent type.
 * Claude Code resolves a name collision latest-wins; this extension spawns
 * same-type agents in parallel as the normal case, where that would make the
 * older siblings unreachable, so colliding handles are numbered instead.
 */

/**
 * Suggestion trigger: `@` at a token boundary plus the partial handle typed so
 * far. Ported from Claude Code, including the CJK sentence-ending punctuation
 * it accepts as a boundary.
 */
export const MENTION_TRIGGER = /(^|[\s。、？！])@([\w-]*)$/;

/** Send grammar: leading `@handle`, then a non-empty message. */
const MENTION_SEND = /^@([\w-]+)\s+([\s\S]+)$/;

/** Slug of an agent type, restricted to the `[\w-]` the mention grammar allows. */
export function handleBase(type: string): string {
  const slug = type.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "agent";
}

/** `base`, else `base-2`, `base-3`, … — the first form not already `taken`. */
export function assignHandle(base: string, taken: ReadonlySet<string>): string {
  let candidate = base;
  let n = 1;
  while (taken.has(candidate)) {
    n++;
    candidate = `${base}-${n}`;
  }
  return candidate;
}

/**
 * Map a typed handle back to a registered agent type, so `@explore fix it`
 * reaches the Explore agent even when no instance has ever run. `handleBase` is
 * the single source of truth in both directions, so a type is addressable by
 * exactly the handle its instances would be given.
 */
export function resolveHandleToType(handle: string, types: readonly string[]): string | undefined {
  const wanted = handle.toLowerCase();
  return types.find(type => handleBase(type) === wanted);
}

/**
 * A spawn needs the short description every agent surface renders. A mention
 * carries no separate label, so the message itself becomes one: first line,
 * whitespace collapsed, clipped to roughly the 3-5 words the Agent tool asks of
 * the model.
 */
export function describeMention(message: string): string {
  const oneLine = message.split("\n", 1)[0].replace(/\s+/g, " ").trim();
  return oneLine.length > 40 ? `${oneLine.slice(0, 39).trimEnd()}…` : oneLine;
}

/**
 * Split `@handle message` into its parts, or null when the text isn't a send —
 * a bare handle, a leading file path, or a mention that isn't at the start.
 */
export function parseMention(text: string): { handle: string; message: string } | null {
  const match = MENTION_SEND.exec(text);
  if (!match) return null;
  const message = match[2].trim();
  return message ? { handle: match[1], message } : null;
}
