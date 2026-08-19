/** usage.ts — Token usage: shapes, accumulator operators, session-stats readers. */

/**
 * Lifetime usage components, accumulated via `message_end` events. Survives
 * compaction (which replaces session.state.messages and would reset any
 * stats-derived sum). cacheRead is excluded because each turn's cacheRead is
 * the cumulative cached prefix re-read on that one call — summing across
 * turns counts the prefix N times. See issue #38.
 *
 * `cost` has no such problem and so is a plain sum: it is what pi charged for
 * that one message (`usage.cost.total`, priced by pi from the model's rates),
 * not a cumulative figure — the cacheRead *tokens* repeat across turns, but the
 * money paid to re-read them is spent once per call. Optional because a model
 * with no pricing data reports none, and because every accumulator predates it;
 * absent reads as 0 everywhere.
 */
export type LifetimeUsage = { input: number; output: number; cacheWrite: number; cost?: number };

/**
 * Sum of lifetime *token* components, or 0 if undefined. Deliberately excludes
 * `cost` — that is money, not tokens, and lives on the same object only because
 * it accumulates on the same events.
 */
export function getLifetimeTotal(u?: LifetimeUsage): number {
  return u ? u.input + u.output + u.cacheWrite : 0;
}

/** Accumulated cost in USD, or 0 when unpriced/undefined. */
export function getLifetimeCost(u?: LifetimeUsage): number {
  return u?.cost ?? 0;
}

/** Add a usage delta into a target accumulator (mutates target). */
export function addUsage(into: LifetimeUsage, delta: LifetimeUsage): void {
  into.input += delta.input;
  into.output += delta.output;
  into.cacheWrite += delta.cacheWrite;
  if (delta.cost) into.cost = (into.cost ?? 0) + delta.cost;
}

/**
 * A pi `Usage` — the shape `AgentToolResult.usage` must carry. Rebuilt here
 * rather than imported so this module stays dependency-free for tests; the
 * fields are pi's, and every one of them must be present: pi's
 * `addUsageToTotals` dereferences `usage.cost.total` with no guard, so a
 * partial object throws inside pi rather than in our code.
 */
export type ToolResultUsage = {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  totalTokens: number;
  cost: { input: number; output: number; cacheRead: number; cacheWrite: number; total: number };
};

/**
 * Subagent spend that the parent session has not been told about yet.
 *
 * Subagents run in their own pi sessions, so none of what they spend appears in
 * the parent's `getSessionStats()`. Pi does aggregate `toolResult.usage` into
 * those stats, though — so the way back into the parent's footer and `/cost` is
 * to hang the spend on a tool result. Background and scheduled agents finish
 * between tool calls with nothing to hang it on, hence a pool: every assistant
 * message lands here as it happens, and the next tool result we return carries
 * whatever has accumulated.
 *
 * Drain empties it, so each message is reported exactly once no matter how many
 * results are returned or how many agents were running.
 */
export class PendingUsagePool {
  private pending: LifetimeUsage = { input: 0, output: 0, cacheWrite: 0, cost: 0 };
  private dirty = false;

  add(delta: LifetimeUsage): void {
    addUsage(this.pending, delta);
    this.dirty = true;
  }

  /**
   * Take everything accumulated so far as a pi `Usage`, resetting the pool.
   * Returns undefined when nothing is pending, so callers can leave the tool
   * result untouched rather than attaching a zero.
   *
   * `cacheRead` is reported as 0 deliberately: each message's cacheRead is the
   * whole cached prefix re-read on that call, so summing it across a run counts
   * the prefix once per turn (#38). The cost of those re-reads is NOT dropped —
   * it is already inside `cost.total`, which is per-message money actually
   * spent. Only `total` is populated on the cost breakdown; pi reads nothing
   * else from it, and we do not track the per-kind split.
   */
  drain(): ToolResultUsage | undefined {
    if (!this.dirty) return undefined;
    const { input, output, cacheWrite, cost = 0 } = this.pending;
    this.pending = { input: 0, output: 0, cacheWrite: 0, cost: 0 };
    this.dirty = false;
    if (input === 0 && output === 0 && cacheWrite === 0 && cost === 0) return undefined;
    return {
      input,
      output,
      cacheRead: 0,
      cacheWrite,
      totalTokens: input + output + cacheWrite,
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: cost },
    };
  }
}

/** Minimal shape we read from upstream `getSessionStats()`. */
export type SessionStatsLike = {
  tokens: { input: number; output: number; cacheWrite: number };
  contextUsage?: { percent: number | null };
};
export type SessionLike = { getSessionStats(): SessionStatsLike };

/**
 * Session-scoped token count: input + output + cacheWrite as reported by
 * upstream `getSessionStats().tokens` for the *current* session window.
 *
 * RESETS at compaction — upstream replaces `session.state.messages` and the
 * stats are derived from that array. For a lifetime total that survives
 * compaction, use `getLifetimeTotal(lifetimeUsage)` instead, which reads
 * from an independent accumulator fed by `message_end` events.
 *
 * Avoids upstream's `tokens.total` field, which sums per-turn `cacheRead`
 * and so counts the cumulative cached prefix N times across N turns
 * (issue #38).
 */
export function getSessionTokens(session: SessionLike | undefined): number {
  if (!session) return 0;
  try {
    const t = session.getSessionStats().tokens;
    return t.input + t.output + t.cacheWrite;
  } catch { return 0; }
}

/**
 * Context-window utilization (0–100), or null when unavailable
 * (no model contextWindow, or post-compaction before the next response).
 */
export function getSessionContextPercent(session: SessionLike | undefined): number | null {
  if (!session) return null;
  try { return session.getSessionStats().contextUsage?.percent ?? null; }
  catch { return null; }
}
