/**
 * agent-mention.ts — what `@` can address, and the suggestions pi renders for it.
 *
 * A subagent is addressable whether or not it is currently running: a live
 * record is messaged or resumed, and an agent *type* with no live instance is
 * started. That is the point of the handle — `@explore` means the Explore
 * agent, not "the Explore process that happens to exist right now" — so the
 * roster below unions both, and the dispatcher and the popup read the same list.
 *
 * pi's `CombinedAutocompleteProvider` already owns `@`, where it means "attach a
 * file". Extensions can wrap it (`ctx.ui.addAutocompleteProvider`), so this
 * provider answers the `@` tokens that name an agent and delegates every other
 * one — including all of `applyCompletion`, whose `@`-branch already inserts
 * `item.value` plus a trailing space, which is exactly what a handle needs.
 *
 * Matching mirrors Claude Code: case-insensitive prefix (not fuzzy), and when
 * any agent matches, files are dropped from the list rather than mixed in — an
 * `@name` that names an agent is never also a path. Offering never-started
 * types is a deliberate step beyond it; Claude Code's registry holds only live
 * tasks, so an agent you had not launched yet was unaddressable.
 */

import type { AutocompleteItem, AutocompleteProvider, AutocompleteSuggestions } from "@earendil-works/pi-tui";
import type { AgentManager } from "../agent-manager.js";
import { handleBase, MENTION_TRIGGER } from "../mention.js";
import type { AgentRecord } from "../types.js";

/** One thing `@` can address, and what sending to it will do. */
export type MentionTarget =
  | { kind: "record"; handle: string; record: AgentRecord }
  | { kind: "type"; handle: string; type: string; description: string };

/** The registry facts the roster needs, so it stays independent of agent-types. */
export type TypeInfo = { name: string; description: string };

/**
 * Everything `@` can reach, in the order the popup lists it: steerable agents
 * first, then the other live ones earliest-launched, then agent types with no
 * live instance. A type whose handle a record already holds is omitted — that
 * name addresses the existing agent, which is what makes `@explore` mean
 * "message the one that's running" and only otherwise "start one".
 */
export function mentionRoster(manager: AgentManager, types: readonly TypeInfo[]): MentionTarget[] {
  const live = (r: AgentRecord) => r.status === "running" || r.status === "queued";
  const records = manager.listAgents()
    .filter(r => r.handle !== undefined && r.parentAgentId === undefined)
    .sort((a, b) => (Number(live(b)) - Number(live(a))) || (a.startedAt - b.startedAt));

  const taken = new Set(records.map(r => r.handle!.toLowerCase()));
  const targets: MentionTarget[] = records.map(record => ({ kind: "record", handle: record.handle!, record }));

  for (const type of types) {
    const handle = handleBase(type.name);
    if (taken.has(handle)) continue;
    taken.add(handle);
    targets.push({ kind: "type", handle, type: type.name, description: type.description });
  }
  return targets;
}

export function createMentionProvider(
  current: AutocompleteProvider,
  roster: () => MentionTarget[],
  isEnabled: () => boolean,
): AutocompleteProvider {
  return {
    // Only `@` — the contract is "characters that should naturally trigger
    // THIS provider", and pi unions each wrapper's own set onto the outermost
    // one itself (interactive-mode.js:432), so re-declaring the wrapped
    // provider's characters here would both misreport us and duplicate that.
    triggerCharacters: ["@"],

    async getSuggestions(lines, cursorLine, cursorCol, options): Promise<AutocompleteSuggestions | null> {
      const items = isEnabled() ? mentionItems(roster(), lines[cursorLine] ?? "", cursorCol) : null;
      if (items) return items;
      return current.getSuggestions(lines, cursorLine, cursorCol, options);
    },

    applyCompletion(lines, cursorLine, cursorCol, item, prefix) {
      return current.applyCompletion(lines, cursorLine, cursorCol, item, prefix);
    },

    shouldTriggerFileCompletion(lines, cursorLine, cursorCol) {
      return current.shouldTriggerFileCompletion?.(lines, cursorLine, cursorCol) ?? true;
    },
  };
}

/** Suggestions for the `@…` token under the cursor, or null when it names no agent. */
function mentionItems(roster: MentionTarget[], line: string, cursorCol: number): AutocompleteSuggestions | null {
  const match = MENTION_TRIGGER.exec(line.slice(0, cursorCol));
  if (!match) return null;

  const typed = match[2].toLowerCase();
  const items: AutocompleteItem[] = [];
  for (const target of roster) {
    if (!target.handle.toLowerCase().startsWith(typed)) continue;
    items.push({ value: `@${target.handle}`, label: `@${target.handle}`, description: describeTarget(target) });
  }
  return items.length > 0 ? { items, prefix: `@${match[2]}` } : null;
}

/** Name the action that will actually happen, so the list never mispromises. */
function describeTarget(target: MentionTarget): string {
  if (target.kind === "type") return `start agent · ${summarize(target.description)}`;
  const { status, description } = target.record;
  const action = status === "running" || status === "queued" ? "send message" : "resume";
  return `${action} · ${status} · ${description}`;
}

/** First sentence of an agent description, clipped — these run to paragraphs. */
function summarize(description: string): string {
  const first = (description.match(/^.*?[.!?](?=\s|$)/s)?.[0] ?? description).replace(/\s+/g, " ").trim();
  return first.length > 60 ? `${first.slice(0, 59).trimEnd()}…` : first;
}
