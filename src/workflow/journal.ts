import { createHash } from "node:crypto";
import { appendFileSync, readFileSync } from "node:fs";
import type { TaskSnapshot } from "../task-worktree.js";


export interface WorkflowJournalEntry {

  index: number;

  key: string;

  ok: boolean;

  text?: string;

  resumed?: true;
  reuse?: { effect: "pure"; immutableInput: string };
}


export interface JournalKeyInput {
  prompt: string;
  task_id?: string;
  task_access?: "write" | "read-stable";
  identity?: TaskSnapshot;
  reuse?: WorkflowJournalEntry["reuse"];
  label?: string;
  model?: string;
  agentType?: string;
  effort?: string;
  isolation?: string;
  gate?: string;
  resume?: string;
  /** Serialized `agent({ schema })`, when the call asked for one. */
  schema?: string;
}

/** Stable hash of a call's payload. Field order is fixed here, not by the caller. */
export function journalKey(input: JournalKeyInput): string {
  const canonical = JSON.stringify([
    input.prompt,
    input.label ?? null,
    input.model ?? null,
    input.agentType ?? null,
    input.effort ?? null,
    input.isolation ?? null,
    input.gate ?? null,
    input.resume ?? null,
    input.schema ?? null,
    input.task_id ?? null,
    input.task_access ?? null,
    input.identity === undefined ? null : [input.identity.repository, input.identity.repository_id, input.identity.task_id,
      input.identity.access, input.identity.generation, input.identity.base_oid, input.identity.checkout, input.identity.configCwd],
    input.reuse === undefined ? null : [input.reuse.effect, input.reuse.immutableInput],
  ]);
  return createHash("sha256").update(canonical).digest("hex").slice(0, 32);
}

/**
 * Read a journal file into position order.
 *
 * Never throws: a missing, truncated or hand-mangled journal means "nothing to
 * replay", which costs tokens. Refusing to run would cost the whole run.
 * A partial last line is normal — the file is appended to while agents settle.
 */
export function readJournal(path: string): WorkflowJournalEntry[] {
  let raw: string;
  try {
    raw = readFileSync(path, "utf-8");
  } catch {
    return [];
  }

  const entries: WorkflowJournalEntry[] = [];
  for (const line of raw.split("\n")) {
    if (line.trim() === "") continue;
    try {
      const parsed = JSON.parse(line) as unknown;
      if (!isEntry(parsed)) continue;
      entries.push(parsed);
    } catch {
      // A half-written final line, or someone editing the file. Skipping it
      // keeps what came before, and a shorter prefix is still a useful one.
    }
  }
  entries.sort((a, b) => a.index - b.index);
  return entries;
}

/** Append one settled call. Failure to write is not failure to run. */
export function appendJournal(path: string, entry: WorkflowJournalEntry): void {
  try {
    appendFileSync(path, `${JSON.stringify(entry)}\n`, "utf-8");
  } catch {
    // A journal that cannot be written costs a future resume, nothing more.
  }
}

function isEntry(value: unknown): value is WorkflowJournalEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    Number.isInteger(entry.index) &&
    (entry.index as number) >= 0 &&
    typeof entry.key === "string" &&
    typeof entry.ok === "boolean" &&
    (entry.text === undefined || typeof entry.text === "string") &&
    (entry.resumed === undefined || entry.resumed === true) &&
    (entry.reuse === undefined || (typeof entry.reuse === "object" && entry.reuse !== null &&
      Object.keys(entry.reuse).length === 2 &&
      (entry.reuse as Record<string, unknown>).effect === "pure" &&
      typeof (entry.reuse as Record<string, unknown>).immutableInput === "string" &&
      ((entry.reuse as Record<string, unknown>).immutableInput as string).length > 0))
  );
}
