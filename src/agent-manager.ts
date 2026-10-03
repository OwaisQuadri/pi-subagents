/**
 * agent-manager.ts — Tracks agents, background execution, resume support.
 *
 * There are two independent concurrency pools, never one:
 *
 * - Background (`maxConcurrent`, default 10) bounds detached agents.
 * - Foreground (`maxConcurrentForeground`, default 0 = unlimited) bounds
 *   agents a caller is blocking on inline — `spawnAndWait`.
 *
 * Independent by design: a foreground agent blocks the parent anyway, so
 * charging it to the background pool would let a saturated pool starve the main
 * session of work it could have done itself. Excess agents in either pool are
 * queued and auto-started as slots free up. Nested children take no slot in
 * either — see `occupiesPoolSlot` / `occupiesForegroundSlot`.
 */

import { randomUUID } from "node:crypto";
import { statSync } from "node:fs";
import { isAbsolute } from "node:path";
import type { Model } from "@earendil-works/pi-ai";
import type { AgentSession, ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { resumeAgent, runAgent, type ToolActivity } from "./agent-runner.js";
import { assignHandle, handleBase } from "./mention.js";
import { describeModel } from "./model-resolver.js";
import { type TaskAccess, TaskAuthority, type TaskAuthorityFixture, TaskClaim, type TaskClaimHolder, type TaskSnapshot, validateTaskAccess, validateTaskId, validateTaskSnapshot } from "./task-worktree.js";
import type { AgentInvocation, AgentRecord, AgentTombstone, MentionResolution, RunActivity, SubagentType, ThinkingLevel } from "./types.js";
import { addUsage, type LifetimeUsage } from "./usage.js";
import type { CompiledSchema } from "./workflow/json-schema.js";

export type OnAgentComplete = (record: AgentRecord, activity?: RunActivity, isPresentation?: boolean) => void;
export type OnAgentStart = (record: AgentRecord, activity?: RunActivity, isPresentation?: boolean) => void;
export type OnAgentCompact = (record: AgentRecord, info: CompactionInfo) => void;
/**
 * Fired once per assistant `message_end`, for EVERY agent this manager owns —
 * top-level and nested alike, spawns and resumes. The one place where each
 * message is seen exactly once: `AgentRecord.lifetimeUsage` is deliberately
 * double-booked into ancestors (see `nested-tools.ts`) so a hidden child's spend
 * shows up on the record a human can see, which makes those records useless as
 * a basis for anything that must not count a message twice — parent-session
 * accounting above all.
 */
export type OnAgentUsage = (record: AgentRecord, usage: LifetimeUsage) => void;
export type CompactionInfo = { reason: "manual" | "threshold" | "overflow"; tokensBefore: number };

/**
 * Default max concurrent background agents.
 *
 * Raised from 4 when top-level spawns started defaulting to background
 * (`backgroundByDefault`): foreground agents bypass this pool entirely, so
 * while foreground was the default a fan-out of six ran six. With background
 * as the default every top-level agent takes a slot, and a limit of 4 would
 * have silently queued the tail of exactly the parallel fan-outs the `Agent`
 * tool description tells the model to send.
 */
const DEFAULT_MAX_CONCURRENT = 10;

/**
 * Default max concurrent foreground (blocking) agents — `0` = unlimited, the
 * extension's existing convention for "no ceiling" (`defaultMaxTurns`).
 *
 * Off by default because nothing here ever bounded foreground work, and pi
 * dispatches a message's tool calls through `Promise.all`, so an unqualified
 * fan-out of blocking `Agent` calls has always run all at once. Users who want
 * it bounded — chiefly local models, where parallel agents thrash the prompt
 * cache (#253) — opt in; everyone else keeps today's behaviour exactly.
 */
const DEFAULT_MAX_CONCURRENT_FOREGROUND = 0;

/**
 * How many evicted agents stay addressable by name. Only a bound on memory —
 * a session that spawns hundreds of agents shouldn't retain every one — and
 * far above the handful anyone keeps in their head.
 */
const MAX_TOMBSTONES = 100;

/**
 * Validate a caller-supplied SpawnOptions.cwd. `undefined`/`null` mean "unset"
 * (parent cwd). Anything else must be an absolute path to an existing
 * directory — curated errors instead of TypeErrors from path/fs internals
 * (RPC callers send arbitrary JSON: null, numbers, file paths).
 */
function assertValidSpawnCwd(cwd: unknown): asserts cwd is string | undefined | null {
  if (cwd == null) return;
  if (typeof cwd !== "string" || !isAbsolute(cwd)) {
    throw new Error(`SpawnOptions.cwd must be an absolute path: "${String(cwd)}"`);
  }
  let isDirectory = false;
  try {
    isDirectory = statSync(cwd).isDirectory();
  } catch {
    throw new Error(`SpawnOptions.cwd does not exist: "${cwd}"`);
  }
  if (!isDirectory) {
    throw new Error(`SpawnOptions.cwd is not a directory: "${cwd}"`);
  }
}

/**
 * Whether a record occupies one of the `maxConcurrent` background slots.
 * Nested children don't: their parent already holds a slot, so counting (and
 * therefore queueing) them would deadlock a parent that waits on its own child.
 *
 * Note this bounds nothing horizontally — the depth cap limits how DEEP nesting
 * goes, not how WIDE. A parent's only limit on concurrent children is that each
 * spawn costs it a turn, which is unbounded when max turns is unlimited.
 */
function occupiesPoolSlot(
  record: Pick<AgentRecord, "isBackground" | "parentAgentId" | "workflowId">,
): boolean {
  return !!record.isBackground && isTopLevelAgent(record);
}

/**
 * Whether a record is one of the session's own agents, rather than something
 * another agent or a workflow owns.
 *
 * The single definition behind every user-facing surface — the fleet list, the
 * widget, the `/agents` menus, `@handle` resolution, and the completion events
 * and session entries. An owned child reports through its owner, so surfacing
 * it separately would double-count the same work in the places a person reads.
 */
export function isTopLevelAgent(
  record: Pick<AgentRecord, "parentAgentId" | "workflowId">,
): boolean {
  return record.parentAgentId === undefined && record.workflowId === undefined;
}

/**
 * Whether a record occupies one of the `maxConcurrentForeground` slots.
 *
 * Keyed on `blocking` — a caller awaiting this record inline — rather than on
 * `isBackground === false`, because `spawn()` is also the funnel for DETACHED
 * starts (cross-extension RPC, `@handle` mentions, the registry) that may pass
 * `isBackground: false` and are documented to run immediately regardless. Those
 * block nobody, so bounding them buys nothing and would park a record with no
 * one waiting to release it.
 *
 * Nested children are excluded for the same reason as `occupiesPoolSlot`, and
 * more sharply: their parent is blocked *awaiting them*, so queueing a child
 * behind its own parent is a guaranteed deadlock rather than a possible one.
 * Enforced here rather than at the call site so no caller can reintroduce it.
 *
 * A workflow's children go out through `spawnAndWait` and so are `blocking`
 * too, and are excluded on the same `isTopLevelAgent` test as the background
 * pool: the run already caps how many of its agents run at once, and charging
 * them here as well would let one fan-out queue behind a limit meant for the
 * session's own work.
 *
 * Like the background pool this bounds width at the top level only — a parent's
 * own fan-out is limited by nothing but its turn budget.
 */
function occupiesForegroundSlot(
  record: Pick<AgentRecord, "blocking" | "parentAgentId" | "workflowId">,
): boolean {
  return !!record.blocking && isTopLevelAgent(record);
}

type Pool = "background" | "foreground";

interface TaskRequest {
  repository: string;
  task_id: string;
  generation: number;
  access: TaskAccess;
  configCwd: string;
  snapshot?: TaskSnapshot;
}

export type OnBeforeTaskSettlement = (claim: TaskClaim, record: AgentRecord) => Promise<void>;

export interface TaskBindOptions {
  base_oid?: string;
  access?: TaskAccess;
  configCwd?: string;
}

interface SpawnArgs {
  task: TaskRequest;
  pi: ExtensionAPI;
  ctx: ExtensionContext;
  type: SubagentType;
  prompt: string;
  options: SpawnOptions;
}

export interface SpawnOptions {
  task_id?: string;
  task_access?: TaskAccess;
  taskSnapshot?: TaskSnapshot;
  onBeforeTaskSettlement?: OnBeforeTaskSettlement;
  description: string;
  /**
   * Optional memorable name for this instance, becoming a second handle
   * (`@auth-audit`) alongside the type-derived one. Slugged, not validated —
   * anything unusable degrades via `handleBase` rather than failing the spawn.
   */
  name?: string;
  /**
   * Reopen this pi session file instead of starting a fresh conversation, so a
   * mention of an evicted agent continues where it left off. The agent's
   * definition is still resolved from its type, so the continuation runs under
   * the type's CURRENT config.
   */
  resumeSessionFile?: string;
  /**
   * Take an evicted agent's names back verbatim instead of allocating fresh
   * ones, so a resumed conversation keeps the handle the user just typed —
   * `handleBase(type)` cannot reproduce a numbered `explore-2`. Safe without an
   * `assignHandle` pass because tombstoned names are excluded from allocation
   * (`takenHandles`), so nothing live can be holding them.
   *
   * Internal capability, like `resumeSessionFile`: a forged handle would
   * duplicate a live agent's name and make `resolveMention` ambiguous, so
   * `spawnTopLevel` strips it from anything a caller sends.
   */
  reclaim?: { handle: string; alias?: string };
  model?: Model<any>;
  maxTurns?: number;
  isolated?: boolean;
  inheritContext?: boolean;
  thinkingLevel?: ThinkingLevel;
  isBackground?: boolean;
  /**
   * Skip whichever pool's queue check applies to this spawn — start immediately
   * even if the configured concurrency limit would otherwise queue it. The slot
   * is still COUNTED once the run starts, so a bypassing spawn transiently
   * exceeds the limit rather than being invisible to it.
   *
   * Used by the scheduler, so a fired job can't be deferred past its trigger
   * window, and by the `/agents` agent-file generator, which has no way to
   * cancel a wait (see its call site).
   */
  bypassQueue?: boolean;
  /**
   * A caller is awaiting this record inline (`spawnAndWait`) — what
   * `maxConcurrentForeground` bounds. Set only by `spawnAndWait`; stripped from
   * caller-supplied options by `spawnTopLevel`, since a forged `blocking` would
   * defer a detached start behind a queue its caller cannot see or release.
   */
  blocking?: boolean;
  /**
   * The workflow run this child belongs to, when a workflow spawned it.
   *
   * Ownership, not decoration. A workflow's children are the workflow's — they
   * report through its card, its notification and its dialog, so they are
   * filtered out of every top-level surface exactly as nested children are, and
   * they take no `maxConcurrent` slot: the run has its own concurrency cap, and
   * counting them twice would let one workflow starve the whole session.
   */
  workflowId?: string;
  /**
   * Make the child report through a `StructuredOutput` tool built from this
   * compiled schema. Set only by the workflow host, for `agent({ schema })`.
   */
  structuredOutput?: CompiledSchema;
  /**
   * Repository for an explicit `task_id` without a captured snapshot (absolute
   * path). Default: parent session cwd. The agent itself always runs in its
   * claimed task checkout; .pi config still loads from `configCwd`.
   */
  cwd?: string;
  /** Resolved invocation snapshot captured for UI display. */
  invocation?: AgentInvocation;
  /** Parent abort signal — when aborted, the subagent is also stopped. */
  signal?: AbortSignal;
  /**
   * Called synchronously once the record is in the map and its promise is set,
   * before `onSessionCreated` fires — where callers attach the output file.
   *
   * Carried on the options rather than parked on the manager for the duration
   * of a spawn: with a foreground queue, `startAgent` can run at drain time,
   * long after any such field would have been restored, and the callback would
   * silently never fire (or fire into an unrelated caller's closure).
   */
  onSpawned?: (id: string) => void;
  /**
   * Called synchronously when the spawn is queued instead of started, with how
   * many entries in its own pool are ahead of it. The foreground UI uses it to
   * say so while it waits; nothing else needs it.
   */
  onQueued?: (id: string, ahead: number) => void;
  /** Called on tool start/end with activity info (for streaming progress to UI). */
  onToolActivity?: (activity: ToolActivity) => void;
  /** Called on streaming text deltas from the assistant response. */
  onTextDelta?: (delta: string, fullText: string) => void;
  /** Called when the agent session is created (for accessing session stats). */
  onSessionCreated?: (session: AgentSession) => void;
  /** Called at the end of each agentic turn with the cumulative count. */
  onTurnEnd?: (turnCount: number) => void;
  /** Called once per assistant message_end with that message's usage delta. */
  onAssistantUsage?: (usage: { input: number; output: number; cacheWrite: number }) => void;
  /** Called when the session successfully compacts. */
  onCompaction?: (info: CompactionInfo) => void;
  /** Nesting depth: top-level subagent = 1. */
  depth?: number;
  /** Parent agent ID for ownership-scoped nested controls. */
  parentAgentId?: string;
  /** Effective inherited nesting cap for this branch. */
  maxSubagentDepth?: number;
  /** Config-discovery root inherited by nested launches when it differs from the working directory. */
  configCwd?: string;
  /** Root session id, inherited by nested launches so transcripts stay grouped. */
  rootSessionId?: string;
}

export interface ResumeOptions {
  onBeforeTaskSettlement?: OnBeforeTaskSettlement;
  isBackground?: boolean;
  onToolActivity?: (activity: ToolActivity) => void;
  onAssistantUsage?: (usage: { input: number; output: number; cacheWrite: number }) => void;
  onCompaction?: (info: CompactionInfo) => void;
  onStarted?: () => void;
}

/** Best-effort ceiling on one child's shutdown handlers, so teardown can't strand a quit. */
const CHILD_SHUTDOWN_TIMEOUT_MS = 3_000;

/**
 * Close the extension lifecycle `runAgent` opened with `bindExtensions`, then dispose.
 *
 * `AgentSession.dispose()` only calls `ExtensionRunner.invalidate()` — pi emits the event
 * itself in `AgentSessionRuntime.dispose()` beforehand, and this is the one place that binds
 * extensions onto a session without going through that path. Without the emit, everything an
 * extension armed in `session_start` leaks once per spawn, and its next tick throws
 * `assertActive()` from a bare timer callback — an uncaughtException that kills pi (#242).
 */
async function shutdownChildSession(session: AgentSession | undefined): Promise<void> {
  try {
    const runner = session?.extensionRunner;
    // Optional all the way down: on a pi without the getter, or a stubbed session from a
    // partial `onSessionCreated`, skip the emit — the same degrade as before this fix.
    if (runner?.hasHandlers?.("session_shutdown")) {
      // Raced, not awaited outright. `emit` runs every handler serially with no timeout of
      // its own, and dispose() is reached from pi's own `session_shutdown` with the TUI
      // already torn down — one hung handler would leave a dead terminal.
      await Promise.race([
        runner.emit({ type: "session_shutdown", reason: "quit" }),
        new Promise<void>(resolve => setTimeout(resolve, CHILD_SHUTDOWN_TIMEOUT_MS).unref()),
      ]);
    }
  } catch { /* a partial session must degrade, not take the teardown down with it */ }
  // Always, even on timeout: disposal is what this function ultimately exists to do.
  try { session?.dispose?.(); } catch { /* ignore */ }
}

export class AgentManager {
  private agents = new Map<string, AgentRecord>();
  private cleanupInterval: ReturnType<typeof setInterval>;
  private onComplete?: OnAgentComplete;
  private onStart?: OnAgentStart;
  private onCompact?: OnAgentCompact;
  private onUsage?: OnAgentUsage;
  private runs = new WeakMap<AgentRecord, { activity: RunActivity; isTerminal: boolean }>();
  private rootSessions = new WeakMap<AgentRecord, string | undefined>();
  private parentAbortCleanup = new WeakMap<AgentRecord, () => void>();
  private maxConcurrent: number;
  private maxConcurrentForeground = DEFAULT_MAX_CONCURRENT_FOREGROUND;
  private binding?: TaskSnapshot;
  private holders = new WeakMap<AgentRecord, TaskClaimHolder>();
  private taskHooks = new WeakMap<AgentRecord, OnBeforeTaskSettlement>();
  private attempts = new Map<AgentRecord, Promise<string>>();
  private taskAuthorityFixture?: TaskAuthorityFixture;
  private isDisposing = false;
  /**
   * Records whose current settlement error no `waitForAll` has surfaced yet. Each
   * error rejects the first wait, dispose or session switch after it, and only
   * that one; the record itself stays retained and listed with the error.
   */
  private unreportedSettlements = new Set<AgentRecord>();

  /**
   * Startup phases, keyed by agent id. `spawn()` still returns synchronously,
   * but the agent is not running yet when it does — claiming its task is an
   * awaited helper request. This is what `awaitStartup` hands
   * callers that must fail their tool call on a startup failure, and what
   * `waitForAll` waits on while a record is "running" with no `promise` yet.
   * Entries are dropped once the run is underway, and kept (rejected) after a
   * startup failure so a late `awaitStartup` still sees it.
   */
  private startups = new Map<string, Promise<void>>();

  /**
   * Evicted agents that can still be reached by name, keyed by handle. Outlives
   * the 10-minute record cleanup — that timer exists to bound memory, not to
   * expire a conversation the user might still want — and is cleared alongside
   * completed records on session start/switch.
   */
  private tombstones = new Map<string, AgentTombstone>();

  /**
   * Agents waiting to start, tagged with the pool they wait on. One queue for
   * both pools: `drainQueue` picks the earliest entry whose own pool has room,
   * so neither can head-of-line-block the other, and every removal path
   * (`abort`, `abortAll`, `dispose`) stays a single filter.
   *
   * `release` wakes a caller blocked in `spawnAndWait`, and is fired once the
   * entry's `start` has SETTLED rather than at drain time: startup is async
   * now, so releasing earlier would wake the caller before `record.promise`
   * exists and it would read a still-starting agent as one that never ran.
   * Removing an entry from this array MUST release it — a queued record has no
   * promise to await, and pi has no tool-execution timeout to bail the caller
   * out.
   */
  private queue: { id: string; pool: Pool; start: () => Promise<void>; release: () => void }[] = [];
  /** Number of currently running background agents. */
  private runningBackground = 0;
  /** Number of currently running foreground (blocking) agents. */
  private runningForeground = 0;

  constructor(
    onComplete?: OnAgentComplete,
    maxConcurrent = DEFAULT_MAX_CONCURRENT,
    onStart?: OnAgentStart,
    onCompact?: OnAgentCompact,
    onUsage?: OnAgentUsage,
    private isRunActivityEnabled = false,
    taskAuthorityFixture?: TaskAuthorityFixture,
  ) {
    if (taskAuthorityFixture) {
      new TaskAuthority(taskAuthorityFixture);
      this.taskAuthorityFixture = Object.freeze({ ...taskAuthorityFixture });
    }
    this.onComplete = onComplete;
    this.onStart = onStart;
    this.onCompact = onCompact;
    this.onUsage = onUsage;
    this.maxConcurrent = maxConcurrent;
    // Cleanup completed agents after 10 minutes (but keep sessions for resume)
    this.cleanupInterval = setInterval(() => this.cleanup(), 60_000);
    this.cleanupInterval.unref();
  }

  getTaskBinding(): TaskSnapshot | undefined { return this.binding; }

  setTaskBinding(snapshot?: TaskSnapshot): void {
    this.binding = snapshot === undefined ? undefined : validateTaskSnapshot(snapshot);
  }

  async bindTask(repository: string, task_id: string, options: TaskBindOptions = {}): Promise<TaskSnapshot> {
    const snapshot = await this.captureTaskSnapshot(repository, task_id, options);
    this.setTaskBinding(snapshot);
    return snapshot;
  }

  async captureTaskSnapshot(repository: string, task_id: string, options: TaskBindOptions = {}): Promise<TaskSnapshot> {
    validateTaskId(task_id);
    const access = options.access === undefined ? "write" : validateTaskAccess(options.access);
    const configCwd = options.configCwd ?? repository;
    assertValidSpawnCwd(repository);
    assertValidSpawnCwd(configCwd);
    if (options.base_oid !== undefined && !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(options.base_oid)) {
      throw new Error("Task binding initialization requires an explicitly resolved full base_oid, not HEAD or a ref");
    }
    const authority = new TaskAuthority(this.taskAuthorityFixture);
    try {
      if (options.base_oid !== undefined) await authority.ensure(repository, task_id, options.base_oid);
      const claim = await this.acquireTask({ repository, task_id, generation: 1, access, configCwd }, `bind-${randomUUID()}`, authority);
      const snapshot = claim.snapshot;
      await claim.release();
      return snapshot;
    } finally {
      await authority.close();
    }
  }

  async finishTask(snapshot: TaskSnapshot, disposition: "complete" | "abandoned", preservation: string): Promise<void> {
    const { repository, task_id, generation } = validateTaskSnapshot(snapshot);
    const authority = new TaskAuthority(this.taskAuthorityFixture);
    try { await authority.finish({ repository, task_id, generation }, disposition, preservation); }
    finally { await authority.close(); }
  }

  private captureTask(ctx: ExtensionContext, options: SpawnOptions): TaskRequest {
    const explicitId = options.task_id === undefined ? undefined : validateTaskId(options.task_id);
    const supplied = options.taskSnapshot === undefined ? undefined : validateTaskSnapshot(options.taskSnapshot);
    if (supplied && explicitId !== undefined && supplied.task_id !== explicitId) throw new Error("task_id differs from the captured task snapshot");
    const snapshot = supplied ?? (options.parentAgentId === undefined && (explicitId === undefined || explicitId === this.binding?.task_id) ? this.binding : undefined);
    const task_id = explicitId ?? snapshot?.task_id;
    if (task_id === undefined) throw new Error("Explicit task_id or a captured task binding is required; use /agents task bind");
    const access = options.task_access === undefined ? snapshot?.access ?? "write" : validateTaskAccess(options.task_access);
    if (snapshot && access !== snapshot.access) throw new Error("task_access differs from the captured task snapshot; bind explicitly with the required access");
    const configCwd = options.configCwd ?? snapshot?.configCwd ?? ctx.cwd;
    assertValidSpawnCwd(configCwd);
    const captured = snapshot ? validateTaskSnapshot({ ...snapshot, configCwd }) : undefined;
    return {
      repository: captured?.repository ?? options.cwd ?? ctx.cwd, task_id, generation: captured?.generation ?? 1,
      access, configCwd, snapshot: captured,
    };
  }

  private async acquireTask(task: TaskRequest, worker_run: string, authority = new TaskAuthority(this.taskAuthorityFixture)): Promise<TaskClaim> {
    const identity = { repository: task.repository, task_id: task.task_id, generation: task.generation };
    try {
      const claimed = await authority.claim(identity, task.access, worker_run);
      const verified = await authority.verify(identity, claimed.token);
      const snapshot = validateTaskSnapshot({
        ...identity, access: task.access, configCwd: task.configCwd,
        repository_id: verified.repository_id, base_oid: verified.base_oid, checkout: verified.checkout,
      });
      if (verified.state !== "open" || claimed.checkout !== verified.checkout || claimed.base_oid !== verified.base_oid || claimed.repository_id !== verified.repository_id ||
          (task.snapshot && Object.keys(task.snapshot).some(key => snapshot[key as keyof TaskSnapshot] !== task.snapshot![key as keyof TaskSnapshot]))) {
        throw new Error("Task snapshot identity mismatch; explicit revalidation/binding is required");
      }
      return new TaskClaim(authority, snapshot, claimed.token);
    } catch (error) {
      try { await authority.close(); } catch {}
      throw error;
    }
  }

  private trackAttempt(record: AgentRecord, promise: Promise<string>): void {
    record.promise = promise;
    this.attempts.set(record, promise);
    const forget = () => { if (this.attempts.get(record) === promise) this.attempts.delete(record); };
    void promise.then(forget, forget);
    void promise.catch(() => {});
  }

  /** Update the max concurrent background agents limit. */
  setMaxConcurrent(n: number) {
    this.maxConcurrent = Math.max(1, n);
    // Start queued agents if the new limit allows
    this.drainQueue();
  }

  getMaxConcurrent(): number {
    return this.maxConcurrent;
  }

  /** Update the max concurrent foreground (blocking) agents limit. 0 = unlimited. */
  setMaxConcurrentForeground(n: number) {
    // Floor 0, not 1: unlimited is a meaningful value here and the default.
    this.maxConcurrentForeground = Math.max(0, n);
    // Start queued agents if the new limit allows — including everything, when
    // the limit is cleared back to unlimited mid-run.
    this.drainQueue();
  }

  getMaxConcurrentForeground(): number {
    return this.maxConcurrentForeground;
  }

  /**
   * Which pool a spawn is charged to, or undefined for one that is charged to
   * neither (nested children, detached non-background spawns).
   *
   * Nothing here queues when the limit is unset — `poolHasRoom` reports an
   * unlimited pool as always having room, so that alone is what keeps the
   * default path identical. The `> 0` guard is belt and braces on top: it also
   * keeps the counter from churning and the settle path from calling a drain
   * that would find nothing to do. Both are unobservable, which is why no test
   * pins them; the observable half — that the default start stays synchronous —
   * is pinned in `test/foreground-concurrency.test.ts`.
   */
  private poolFor(record: AgentRecord): Pool | undefined {
    if (occupiesPoolSlot(record)) return "background";
    if (this.maxConcurrentForeground > 0 && occupiesForegroundSlot(record)) return "foreground";
    return undefined;
  }

  private poolHasRoom(pool: Pool): boolean {
    return pool === "background"
      ? this.runningBackground < this.maxConcurrent
      : this.maxConcurrentForeground === 0 || this.runningForeground < this.maxConcurrentForeground;
  }

  /**
   * Spawn an agent and return its ID immediately (for background use).
   * If the concurrency limit is reached, the agent is queued.
   *
   * The id comes back synchronously, but the agent is not running yet when it
   * does — claiming its task is an awaited helper request.
   * Callers that must fail a tool call on a startup failure await
   * `awaitStartup(id)`; everyone else sees it on the record (status "error").
   */
  spawn(
    pi: ExtensionAPI,
    ctx: ExtensionContext,
    type: SubagentType,
    prompt: string,
    options: SpawnOptions,
  ): string {
    if (this.isDisposing) throw new Error("Agent manager is disposing");
    assertValidSpawnCwd(options.cwd);
    const task = this.captureTask(ctx, options);
    options = { ...options, configCwd: task.configCwd };

    // Snapshot the parent's live selection here, synchronously, before the queue
    // branch. `runAgent` can start minutes later at queue drain; reading either
    // value there would pair the dispatch-time model with a drain-time thinking
    // level, a combination the user never selected. A file-based resume keeps
    // its own resolution in `runAgent`.
    if (!options.resumeSessionFile) {
      options = {
        ...options,
        model: options.model ?? ctx.model,
        // `||` and not `??`: an empty string is an omitted field, not a level.
        // "off" is a non-empty string and stays an explicit choice.
        thinkingLevel: options.thinkingLevel || ctx.thinkingLevel || pi.getThinkingLevel?.(),
      };
    }

    const id = randomUUID().slice(0, 17);
    const abortController = new AbortController();
    const record: AgentRecord = {
      id,
      type,
      taskSnapshot: task.snapshot,
      // Owned children — nested, or a workflow's — are filtered out of every
      // top-level surface, so no handle: nothing can address them and they must
      // not consume a name a top-level sibling could otherwise take.
      handle: !isTopLevelAgent(options)
        ? undefined
        // A reclaimed handle is used as-is: it belongs to the conversation this
        // spawn is reopening, and re-deriving it would lose the numbering.
        : options.reclaim?.handle ?? assignHandle(handleBase(type), this.takenHandles()),
      description: options.description,
      // Reclaimed here, or filled in below from `name` — in which case it must
      // see the handle this record just took, since both come out of the same
      // namespace.
      alias: isTopLevelAgent(options) ? options.reclaim?.alias : undefined,
      // Overwritten below when the spawn is actually queued; a foreground spawn
      // that queues flips to "queued" there rather than being guessed at here,
      // since the pool decision needs the finished record.
      status: options.isBackground ? "queued" : "running",
      toolUses: 0,
      startedAt: Date.now(),
      abortController,
      lifetimeUsage: { input: 0, output: 0, cacheWrite: 0, cost: 0 },
      compactionCount: 0,
      // Raw tri-state (not coerced to a boolean): true = background, false =
      // foreground (has an inline tool-result surface), undefined = caller never
      // declared it (e.g. a cross-extension RPC spawn). The widget's background-
      // only filter excludes only explicit `false`, so undefined agents — which
      // have no inline surface — stay visible instead of vanishing.
      isBackground: options.isBackground,
      // Whether anyone is awaiting this agent is a property of the agent, not
      // of the call that made it — and both settle paths need it long after
      // `options` has stopped being the interesting object.
      blocking: options.blocking,
      invocation: options.invocation,
      depth: options.depth ?? 1,
      parentAgentId: options.parentAgentId,
      workflowId: options.workflowId,
      maxSubagentDepth: options.maxSubagentDepth,
      rootSessionId: options.rootSessionId,
    };
    const parent = options.parentAgentId !== undefined ? this.agents.get(options.parentAgentId) : undefined;
    record.rootSessionId = options.rootSessionId
      ?? (parent !== undefined ? this.rootSessions.get(parent) : undefined)
      ?? ctx.sessionManager?.getSessionId?.();
    this.rootSessions.set(record, record.rootSessionId);
    this.agents.set(id, record);
    this.holders.set(record, {});
    if (options.onBeforeTaskSettlement) this.taskHooks.set(record, options.onBeforeTaskSettlement);
    // After the insert, so `takenHandles()` already counts this record's own
    // handle — a spawn named after its own type gets `explore-2`, not a
    // duplicate `explore` that would make resolution ambiguous.
    if (record.handle !== undefined && record.alias === undefined && options.name !== undefined) {
      record.alias = assignHandle(handleBase(options.name), this.takenHandles());
    }

    if (options.signal?.aborted) {
      record.abortController!.abort(); record.status = "stopped"; record.completedAt = Date.now(); record.promise = Promise.resolve("");
      return id;
    }
    const args: SpawnArgs = { pi, ctx, type, prompt, options, task };

    const pool = this.poolFor(record);
    if (pool !== undefined && !options.bypassQueue && !this.poolHasRoom(pool)) {
      // Queue it — started when a running agent in the same pool completes.
      // Idempotent for background (already "queued"); the flip that matters is
      // a blocking foreground spawn, optimistically marked "running" above.
      record.status = "queued";
      // A queued record never reaches startAgent's signal wiring, so arm the
      // parent abort here or Esc could not release the position.
      if (!this.armQueuedAbort(id, options.signal)) return id;
      let release!: () => void;
      record.startGate = new Promise<void>(resolve => { release = resolve; });
      this.queue.push({
        id,
        pool,
        start: () => this.launch(id, record, args, pool),
        release: () => release(),
      });
      options.onQueued?.(id, this.queue.filter(e => e.pool === pool).length - 1);
      return id;
    }

    this.launch(id, record, args, undefined);
    return id;
  }

  private armQueuedAbort(id: string, signal?: AbortSignal): boolean {
    if (signal === undefined) return true;
    if (signal.aborted) {
      const record = this.agents.get(id);
      if (record) {
        record.status = "stopped";
        record.completedAt = Date.now();
      }
      return false;
    }
    const record = this.agents.get(id)!;
    const onQueuedAbort = () => this.abort(id);
    signal.addEventListener("abort", onQueuedAbort, { once: true });
    this.parentAbortCleanup.set(record, () => {
      signal.removeEventListener("abort", onQueuedAbort);
      this.parentAbortCleanup.delete(record);
    });
    return true;
  }

  private launch(id: string, record: AgentRecord, args: SpawnArgs, queuedPool: Pool | undefined): Promise<void> {
    let started!: () => void;
    let failed!: (error: unknown) => void;
    let isStarted = false;
    const startup = new Promise<void>((resolve, reject) => { started = resolve; failed = reject; });
    this.startups.set(id, startup);
    const attempt = this.startAgent(id, record, args, () => { isStarted = true; this.startups.delete(id); started(); }, queuedPool !== undefined);
    this.trackAttempt(record, attempt);
    void attempt.catch(error => {
      if (!isStarted) {
        record.status = "error";
        record.error = error instanceof Error ? error.message : String(error);
        record.completedAt ??= Date.now();
        if (queuedPool === "foreground") record.resultConsumed = true;
        failed(error);
        if (queuedPool === undefined && !record.taskSettlementError) {
          this.agents.delete(id);
          this.startups.delete(id);
        }
      }
    });
    return startup.catch(() => {});
  }

  /**
   * Resolves once the agent is actually running, and rejects with its startup
   * failure (a task claim that fails, such as TaskBusy). Resolves immediately for an agent that is already
   * running, still queued, or unknown — so callers can await it unconditionally.
   *
   * Call it in the same tick as the `spawn()` it belongs to: a failed startup
   * takes its record (and this entry) with it, exactly as the throw did.
   */
  awaitStartup(id: string): Promise<void> {
    return this.startups.get(id) ?? Promise.resolve();
  }

  private async startAgent(
    id: string,
    record: AgentRecord,
    { pi, ctx, type, prompt, options, task }: SpawnArgs,
    started: () => void,
    isQueued: boolean,
  ): Promise<string> {
    const pool = this.poolFor(record);
    record.status = "running";
    record.startedAt = Date.now();
    record.startGate = undefined;
    if (pool === "background") this.runningBackground++;
    else if (pool === "foreground") this.runningForeground++;
    this.armRunningAbort(record, options.signal);
    const holder = this.holders.get(record)!;
    let claim: TaskClaim | undefined;
    let isLaunched = false;
    let isPreLaunchFailure = false;
    try {
      assertValidSpawnCwd(options.cwd);
      if (record.abortController!.signal.aborted) { started(); return ""; }
      claim = await this.acquireTask(task, id);
      record.taskSnapshot = claim.snapshot;
      holder.current = claim;
      if (record.abortController!.signal.aborted || this.isStopped(record)) { started(); return ""; }
      this.startRun(record);
      if (record.abortController!.signal.aborted || this.isStopped(record)) { started(); return ""; }
      options.onSpawned?.(id);
      if (record.abortController!.signal.aborted || this.isStopped(record)) { started(); return ""; }
      isLaunched = true;
      const worker = runAgent(ctx, type, prompt, {
      pi,
      agentId: id,
      model: options.model,
      maxTurns: options.maxTurns,
      isolated: options.isolated,
      inheritContext: options.inheritContext,
      thinkingLevel: options.thinkingLevel,
      structuredOutput: options.structuredOutput,
      resumeSessionFile: options.resumeSessionFile,
      nested: options.parentAgentId !== undefined,
      workflow: options.workflowId !== undefined,
      cwd: claim.snapshot.checkout,
      worktreeBase: claim.snapshot.repository,
      configCwd: task.configCwd,
      taskClaimHolder: holder,
      signal: record.abortController!.signal,
      onToolActivity: (activity) => {
        if (activity.type === "end") record.toolUses++;
        options.onToolActivity?.(activity);
      },
      onTurnEnd: options.onTurnEnd,
      onTextDelta: options.onTextDelta,
      onAssistantUsage: (usage) => {
        addUsage(record.lifetimeUsage, usage);
        this.onUsage?.(record, usage);
        options.onAssistantUsage?.(usage);
      },
      onCompaction: (info) => {
        record.compactionCount++;
        this.onCompact?.(record, info);
        options.onCompaction?.(info);
      },
      nestedRuntime: {
        manager: this,
        parentAgentId: id,
        depth: record.depth ?? 1,
        maxSubagentDepth: record.maxSubagentDepth,
      },
      onSessionCreated: (session) => {
        record.session = session;
        // Capture now, while the session object exists: after eviction this
        // path is the only thing that can reopen the conversation, and an
        // in-memory session reports undefined, which correctly means
        // "nothing to come back to".
        // Optional chaining, not defensiveness for its own sake: this is the
        // only field read off the session at creation, so an older pi or a
        // stubbed session must degrade to "not resumable" rather than throw
        // and take the whole spawn down with it.
        record.sessionFile = session.sessionManager?.getSessionFile?.();
        // Same reason, different field: the model and thinking level are only
        // knowable once pi has resolved its defaults and clamped the level to
        // what the model supports. Writing them back here makes the record
        // authoritative, so every surface reads one place instead of each
        // re-deriving "session, else the request" for itself.
        if (session.model) {
          record.invocation ??= {};
          // Read the kept request first: a caller's level survives being clamped
          // AND, one line later, being replaced by the effective one.
          const requested = record.invocation.requestedThinking ?? record.invocation.thinking;
          Object.assign(record.invocation, describeModel(session.model));
          // Guarded for the reason above: a session that reports no level keeps
          // the request rather than losing it. Overwriting unconditionally would
          // turn an older or stubbed session into a blank `thinking:` tag, which
          // is worse than the stale-but-true value it replaced.
          if (session.thinkingLevel) {
            record.invocation.thinking = session.thinkingLevel;
            if (requested && requested !== session.thinkingLevel) {
              record.invocation.requestedThinking = requested;
            }
          }
        }
        // Flush any steers that arrived before the session was ready
        if (record.pendingSteers?.length) {
          for (const msg of record.pendingSteers) {
            session.steer(msg).catch(() => {});
          }
          record.pendingSteers = undefined;
        }
        options.onSessionCreated?.(session);
      },
      });
      started();
      try {
        const result = await worker;
        if (!this.isStopped(record)) {
          record.status = result.aborted ? "aborted" : result.failure ? "error" : result.steered ? "steered" : "completed";
          if (result.failure) record.error = result.failure;
        }
        record.result = result.responseText;
        record.session = result.session;
        record.structuredJson = result.structuredJson;
        record.structuredRetried = result.structuredRetried;
      } catch (error) {
        if (!this.isStopped(record)) record.status = "error";
        record.error = error instanceof Error ? error.message : String(error);
        record.result = "";
      }
      return record.result ?? "";
    } catch (error) {
      isPreLaunchFailure = true;
      record.error = error instanceof Error ? error.message : String(error);
      if (!this.isStopped(record)) record.status = "error";
      throw error;
    } finally {
      try { if (claim) await this.settleTask(record, claim, isLaunched); }
      finally {
        this.parentAbortCleanup.get(record)?.();
        record.completedAt ??= Date.now();
        this.flushOutput(record);
        // An immediate spawn that fails before launch reaches its caller as a throw
        // and its record is dropped; presenting it too would report it twice. A
        // queued one has no caller left, so its failure is presented as before.
        this.settleRun(record, true, pool, isQueued || !isPreLaunchFailure);
      }
    }
  }

  private async settleTask(record: AgentRecord, claim: TaskClaim, isLaunched: boolean): Promise<void> {
    const failures: unknown[] = [];
    const phases: NonNullable<TaskClaimHolder["recovery"]>["phases"] = [];
    try { await this.abortOwnedChildren(record.id); }
    catch (error) { failures.push(error); phases.push("children"); }
    if (!failures.length && isLaunched) {
      try { await this.taskHooks.get(record)?.(claim, record); }
      catch (error) { failures.push(error); phases.push("hook"); }
    }
    const holder = this.holders.get(record)!;
    holder.current = undefined;
    try { await claim.release(); } catch (error) { failures.push(error); phases.push("release"); }
    try { await claim.authority.close(); } catch (error) { failures.push(error); phases.push("close"); }
    if (failures.length) {
      record.taskSettlementError = failures.map(error => (error instanceof Error ? error.message : String(error)).replaceAll(claim.token, "[redacted]")).join("; ");
      holder.recovery = { snapshot: claim.snapshot, phases, error: record.taskSettlementError };
      this.unreportedSettlements.add(record);
      record.status = "error";
      record.error = record.error ? `${record.error}; Task settlement failed: ${record.taskSettlementError}` : `Task settlement failed: ${record.taskSettlementError}`;
      throw new AggregateError(failures, record.taskSettlementError);
    }
  }

  private isStopped(record: AgentRecord): boolean { return record.status === "stopped"; }

  private flushOutput(record: AgentRecord): void {
    if (record.outputCleanup) { try { record.outputCleanup(); } catch {} record.outputCleanup = undefined; }
  }

  private armRunningAbort(record: AgentRecord, signal?: AbortSignal): void {
    if (!signal) return;
    const onParentAbort = () => this.abort(record.id);
    signal.addEventListener("abort", onParentAbort, { once: true });
    this.parentAbortCleanup.get(record)?.();
    this.parentAbortCleanup.set(record, () => {
      signal.removeEventListener("abort", onParentAbort);
      this.parentAbortCleanup.delete(record);
    });
    if (signal.aborted) onParentAbort();
  }

  private startRun(record: AgentRecord, isPresentation = true): void {
    const activity: RunActivity = {
      version: 1,
      rootSessionId: this.rootSessions.get(record)!,
      agentId: record.id,
      runId: randomUUID(),
      ...(record.parentAgentId !== undefined ? { parentAgentId: record.parentAgentId } : {}),
      ...(record.workflowId !== undefined ? { workflowId: record.workflowId } : {}),
      transition: "started",
    };
    this.runs.set(record, { activity, isTerminal: false });
    if (this.isRunActivityEnabled) {
      try { this.onStart?.(record, activity, isPresentation); } catch {}
    } else if (isPresentation) this.onStart?.(record);
  }

  private finishRun(record: AgentRecord, isPresentation = true, isSettled = true): void {
    const run = this.runs.get(record);
    let activity: RunActivity | undefined;
    if (run && !run.isTerminal && record.status !== "running" && record.status !== "queued") {
      run.isTerminal = true;
      activity = {
        ...run.activity,
        transition: record.status === "error" ? "failed"
          : record.status === "stopped" || record.status === "aborted" ? "stopped" : "completed",
        status: record.status,
      };
    }
    if (isSettled) this.runs.delete(record);
    if (this.isRunActivityEnabled && (activity || isPresentation)) {
      try { this.onComplete?.(record, activity, isPresentation); } catch {}
    } else if (isPresentation) this.onComplete?.(record);
  }

  private settleRun(record: AgentRecord, guardCallback: boolean, pool: Pool | undefined, isPresentation = true): void {
    if (!record.isBackground) record.resultConsumed = true;
    if (pool === "background") this.runningBackground--;
    else if (pool === "foreground") this.runningForeground--;

    if (guardCallback) {
      try { this.finishRun(record, isPresentation); } catch {}
    } else {
      this.finishRun(record, isPresentation);
    }

    // The isBackground half reproduces the pre-pool condition exactly — a
    // background settle has always drained, even for a nested child that held
    // no slot — so that path is unchanged whether or not the foreground pool is
    // on. The `pool` half only adds the drain a freed FOREGROUND slot needs.
    // A drain with nothing freed is a no-op anyway, but "no-op" is a claim
    // about reachability, and matching the old condition needs no such claim.
    if (record.isBackground || pool !== undefined) this.drainQueue();
  }

  /**
   * Stop the nested children a settled parent owns. Nested records are hidden
   * from the UI and only their owner can consume them, so a child outliving its
   * parent would burn tokens unseen with no way to reach it. Grandchildren are
   * covered transitively — each abort lands in that child's own settle path.
   */
  private async abortOwnedChildren(parentId: string): Promise<void> {
    const pending: Promise<string>[] = [];
    for (const [id, record] of this.agents) {
      if (record.parentAgentId !== parentId) continue;
      this.abort(id);
      const attempt = this.attempts.get(record);
      if (attempt) pending.push(attempt);
    }
    const results = await Promise.allSettled(pending);
    const failures = results.flatMap(result => result.status === "rejected" ? [result.reason] : []);
    for (const record of this.agents.values()) {
      if (record.parentAgentId === parentId && record.taskSettlementError) failures.push(new Error(record.taskSettlementError));
    }
    if (failures.length) throw new AggregateError(failures, failures.map(error => error instanceof Error ? error.message : String(error)).join("; "));
  }

  private drainQueue() {
    if (this.isDisposing) return;
    for (;;) {
      const i = this.queue.findIndex(e => this.poolHasRoom(e.pool));
      if (i === -1) return;
      const [next] = this.queue.splice(i, 1);
      const record = this.agents.get(next.id);
      if (record?.status !== "queued") { next.release(); continue; }
      void next.start().then(() => next.release(), () => next.release());
    }
  }

  /**
   * Remove queued entries and wake anyone blocked on them. The single point
   * that enforces "leaving the queue releases the waiter" — a missed release is
   * an unbounded hang, not a failed call.
   */
  private dequeue(pred: (entry: { id: string; pool: Pool }) => boolean): void {
    const kept: typeof this.queue = [];
    for (const entry of this.queue) {
      if (pred(entry)) entry.release();
      else kept.push(entry);
    }
    this.queue = kept;
  }

  /**
   * Spawn an agent and wait for completion (foreground use).
   * Charged to the foreground pool (`maxConcurrentForeground`), which is
   * unlimited by default; never to the background one.
   * Returns { id, record } so callers can access the agent ID.
   *
   * @param onSpawned - Called synchronously once the run is kicked off, before
   *   onSessionCreated fires. Use this to set record.outputFile so
   *   streamToOutputFile can pick it up.
   */
  async spawnAndWait(
    pi: ExtensionAPI,
    ctx: ExtensionContext,
    type: SubagentType,
    prompt: string,
    options: Omit<SpawnOptions, "isBackground">,
    onSpawned?: (id: string) => void,
  ): Promise<{ id: string; record: AgentRecord }> {
    // `blocking` is what maxConcurrentForeground bounds, and this is its only
    // source. onSpawned rides on the options rather than on a field of this
    // manager: a queued spawn starts at drain time, long after any install/
    // restore pair around this call would have put the field back — and it now
    // fires after an await (worktree creation) even on the immediate path.
    const id = this.spawn(pi, ctx, type, prompt, {
      ...options,
      isBackground: false,
      blocking: true,
      onSpawned,
    });
    const record = this.agents.get(id)!;

    // Queued: nothing to await yet — the promise appears when the drain starts
    // it. The gate resolves (never rejects) on every path out of the queue,
    // start and abort alike, so a rejection can never escape into the caller's
    // tool `execute` and take down pi's whole Promise.all tool batch.
    if (record.status === "queued") await record.startGate;

    // The run promise only exists once startup is past its awaited task claim —
    // without this the call would return before the agent had started at all.
    // A startup failure (such as TaskBusy) rejects here, which is what
    // the immediate path owes its caller: pi only marks a tool result failed
    // when `execute` throws. A queued spawn's failure landed on the record
    // instead (nobody was awaiting `startups` at drain time) and is rethrown
    // below, so the contract is the same either way.
    await this.awaitStartup(id);

    // undefined when it was aborted while queued, or stopped mid-claim, and so
    // never ran — the record is already terminal with a completedAt, which is
    // what the caller renders.
    if (record.promise) await record.promise;

    // A record that ended "error" without ever getting a promise never ran: the
    // same startup failure spawn() rethrows on the immediate path (#179). Keep
    // one contract rather than letting queue pressure decide whether a strict
    // worktree failure throws or returns as a result.
    if (record.promise === undefined && record.status === "error") {
      throw new Error(record.error ?? "Agent failed to start");
    }
    return { id, record };
  }

  async resume(id: string, prompt: string, signal?: AbortSignal, options: ResumeOptions = {}): Promise<AgentRecord | undefined> {
    if (this.isDisposing) throw new Error("Agent manager is disposing");
    const record = this.agents.get(id);
    if (!record?.session) return undefined;
    if (record.status === "running" || record.status === "queued" || this.attempts.has(record) || this.runs.has(record)) return undefined;
    if (!record.taskSnapshot) throw new Error("Cannot resume a legacy record without a captured task snapshot; explicitly bind/reopen its task");
    const snapshot = validateTaskSnapshot(record.taskSnapshot);
    if (options.onBeforeTaskSettlement) this.taskHooks.set(record, options.onBeforeTaskSettlement);
    record.abortController = new AbortController();
    record.result = undefined; record.error = undefined; record.completedAt = undefined;
    if (signal?.aborted) {
      record.abortController.abort(); record.status = "stopped"; record.completedAt = Date.now(); record.promise = Promise.resolve("");
      return record;
    }
    if (options.isBackground) {
      record.isBackground = true; record.resultConsumed = false; record.status = "queued"; record.promise = undefined;
      if (!this.armQueuedAbort(id, signal)) return record;
      if (occupiesPoolSlot(record) && !this.poolHasRoom("background")) {
        let release!: () => void;
        record.startGate = new Promise<void>(resolve => { release = resolve; });
        this.queue.push({ id, pool: "background", start: () => this.launchResume(record, snapshot, prompt, signal, options, true), release });
        return record;
      }
      await this.launchResume(record, snapshot, prompt, signal, options, true);
      return record;
    }
    await this.launchResume(record, snapshot, prompt, signal, options, false);
    await record.promise;
    return record;
  }

  private launchResume(record: AgentRecord, snapshot: TaskSnapshot, prompt: string, parentSignal: AbortSignal | undefined, options: ResumeOptions, isPresentation: boolean): Promise<void> {
    let started!: () => void;
    let failed!: (error: unknown) => void;
    let isStarted = false;
    const startup = new Promise<void>((resolve, reject) => { started = resolve; failed = reject; });
    this.startups.set(record.id, startup);
    const attempt = this.startResume(record, snapshot, prompt, parentSignal, options, isPresentation, () => { isStarted = true; this.startups.delete(record.id); started(); });
    this.trackAttempt(record, attempt);
    void attempt.catch(error => { if (!isStarted) failed(error); });
    return startup;
  }

  private async startResume(record: AgentRecord, snapshot: TaskSnapshot, prompt: string, parentSignal: AbortSignal | undefined, options: ResumeOptions, isPresentation: boolean, started: () => void): Promise<string> {
    const pool = isPresentation && occupiesPoolSlot(record) ? "background" : undefined;
    record.status = "running"; record.startedAt = Date.now(); record.startGate = undefined;
    if (pool === "background") this.runningBackground++;
    this.armRunningAbort(record, parentSignal);
    const holder = this.holders.get(record) ?? {};
    this.holders.set(record, holder);
    let claim: TaskClaim | undefined;
    let isLaunched = false;
    try {
      if (record.abortController!.signal.aborted) { started(); return ""; }
      claim = await this.acquireTask({ ...snapshot, snapshot }, `${record.id}-${randomUUID()}`);
      record.taskSettlementError = undefined;
      this.unreportedSettlements.delete(record);
      holder.recovery = undefined;
      holder.current = claim;
      if (record.abortController!.signal.aborted || this.isStopped(record)) { started(); return ""; }
      this.startRun(record, isPresentation);
      if (record.abortController!.signal.aborted || this.isStopped(record)) { started(); return ""; }
      try { options.onStarted?.(); } catch {}
      if (record.abortController!.signal.aborted || this.isStopped(record)) { started(); return ""; }
      isLaunched = true;
      const worker = resumeAgent(record.session!, prompt, {
        onToolActivity: activity => { if (activity.type === "end") record.toolUses++; options.onToolActivity?.(activity); },
        onAssistantUsage: usage => { addUsage(record.lifetimeUsage, usage); this.onUsage?.(record, usage); options.onAssistantUsage?.(usage); },
        onCompaction: info => { record.compactionCount++; this.onCompact?.(record, info); options.onCompaction?.(info); },
        signal: record.abortController!.signal,
      });
      started();
      try {
        const result = await worker;
        if (!this.isStopped(record)) { record.status = result.failure ? "error" : "completed"; if (result.failure) record.error = result.failure; }
        record.result = result.text;
      } catch (error) {
        if (!this.isStopped(record)) record.status = "error";
        record.error = error instanceof Error ? error.message : String(error); record.result = "";
      }
      return record.result ?? "";
    } catch (error) {
      record.status = "error"; record.error = error instanceof Error ? error.message : String(error); throw error;
    } finally {
      try { if (claim) await this.settleTask(record, claim, isLaunched); }
      finally {
        this.parentAbortCleanup.get(record)?.(); record.completedAt ??= Date.now(); this.flushOutput(record);
        this.settleRun(record, true, pool, isPresentation);
      }
    }
  }

  /**
   * Send a steering message to an agent from the UI (mirrors the steer_subagent
   * tool). A live session delivers it now — it interrupts the agent after its
   * current tool execution and appears as a user message. If the session isn't
   * ready yet, the message is queued on `pendingSteers` and flushed when the
   * session is created. Returns false if the agent can't accept steering
   * (unknown id, or no longer running/queued).
   */
  steer(id: string, message: string): boolean {
    const record = this.agents.get(id);
    if (!record) return false;
    if (record.status !== "running" && record.status !== "queued") return false;
    if (record.session) {
      record.session.steer(message).catch(() => {});
    } else {
      if (!record.pendingSteers) record.pendingSteers = [];
      record.pendingSteers.push(message);
    }
    return true;
  }

  getRecord(id: string): AgentRecord | undefined {
    return this.agents.get(id);
  }

  /** Handles already in use, so a fresh spawn can pick an unclaimed one. */
  private takenHandles(): Set<string> {
    const taken = new Set<string>();
    for (const record of this.agents.values()) {
      if (record.handle) taken.add(record.handle);
      if (record.alias) taken.add(record.alias);
    }
    // Tombstones hold their names too: an evicted `@explore` is still
    // resurrectable, so a later Explore must become `explore-2` rather than
    // shadowing a conversation the user can still reach.
    for (const entry of this.tombstones.values()) {
      taken.add(entry.handle);
      if (entry.alias) taken.add(entry.alias);
    }
    return taken;
  }

  /**
   * Resolve an `@name` from the prompt. Matches a top-level agent's handle
   * case-insensitively, preferring one that can still be steered and otherwise
   * the most recently started (which is the one a resume should continue), then
   * falls back to an exact agent id so `@<agentId>` works too.
   */
  resolveMention(name: string): MentionResolution | undefined {
    const wanted = name.toLowerCase();
    let fallback: AgentRecord | undefined;
    for (const record of this.agents.values()) {
      if (record.parentAgentId !== undefined) continue;
      // Handle and alias share one namespace, so at most one agent answers a
      // name and it makes no difference which of the two matched.
      if (record.handle?.toLowerCase() !== wanted && record.alias?.toLowerCase() !== wanted) continue;
      if (record.status === "running" || record.status === "queued") return { kind: "live", record };
      if (!fallback || record.startedAt > fallback.startedAt) fallback = record;
    }
    if (fallback) return { kind: "live", record: fallback };
    const byId = this.agents.get(name);
    if (byId?.parentAgentId === undefined && byId !== undefined) return { kind: "live", record: byId };
    // Only once nothing live answers: a tombstone is a conversation to reopen,
    // and reopening one while its record still exists would fork the session.
    for (const entry of this.tombstones.values()) {
      if (entry.handle.toLowerCase() === wanted || entry.alias?.toLowerCase() === wanted || entry.id === name) {
        return { kind: "tombstone", entry };
      }
    }
    return undefined;
  }

  /**
   * Forget an evicted agent, by handle. For the case where its session file has
   * gone: the entry can then only ever fail, while still holding the name
   * against the type that would otherwise start a fresh agent under it.
   *
   * A *successful* resume does not drop its tombstone — the live record it
   * creates already wins in `resolveMention`, and overwrites the entry in place
   * when it is itself evicted.
   */
  dropTombstone(handle: string): void {
    this.tombstones.delete(handle);
  }

  /** Evicted agents whose conversation can still be reopened, newest first. */
  listTombstones(): AgentTombstone[] {
    return [...this.tombstones.values()].sort((a, b) => b.completedAt - a.completedAt);
  }

  listAgents(): AgentRecord[] {
    return [...this.agents.values()].sort(
      (a, b) => b.startedAt - a.startedAt,
    );
  }

  abort(id: string): boolean {
    const record = this.agents.get(id);
    if (!record) return false;
    this.parentAbortCleanup.get(record)?.();

    // Remove from queue if queued. No decrement — the slot was never taken —
    // and no onComplete, matching what a queued background abort has always
    // done; a blocking caller learns of the stop from its own tool result.
    if (record.status === "queued") {
      this.dequeue(q => q.id === id);
      record.status = "stopped";
      record.completedAt = Date.now();
      return true;
    }

    // A finished worker can still be settling (hook, gate, children, helper
    // release). Its settlement work is cancelled and still awaited, but its
    // status is the worker's outcome: only running or queued records stop.
    if (record.status !== "running") {
      if (this.attempts.has(record)) record.abortController?.abort();
      return false;
    }
    record.abortController?.abort();
    record.status = "stopped";
    record.completedAt = Date.now();
    this.finishRun(record, false, false);
    return true;
  }

  private removeRecord(id: string, record: AgentRecord, isSettlementFailureRemovable = false): void {
    if (this.attempts.has(record) || (record.taskSettlementError && !isSettlementFailureRemovable)) return;
    this.tombstone(record);
    const session = record.session;
    // Detached before the shutdown starts, so the record leaves the map at once and
    // nothing can observe a session that is half torn down.
    record.session = undefined;
    this.agents.delete(id);
    // A failed startup keeps its (rejected) entry so a late awaitStartup still
    // sees it; drop it with the record so the map can't grow unbounded.
    this.startups.delete(id);
    // Fire-and-forget is right here and only here: this runs from the 60s cleanup timer
    // and from `clearCompleted()` on session boundaries, with the process staying alive,
    // so handlers get their full window. The quit path awaits instead — see dispose().
    void shutdownChildSession(session);
  }

  /**
   * Preserve enough of a departing record for `@handle` to reopen its
   * conversation later. Nothing to keep unless it has both a handle to be
   * addressed by and a session file to reopen — an in-memory session leaves no
   * transcript, so the mention would have nothing to continue from.
   */
  private tombstone(record: AgentRecord): void {
    if (!record.handle || !record.sessionFile) return;
    this.tombstones.set(record.handle, {
      handle: record.handle,
      alias: record.alias,
      id: record.id,
      type: record.type,
      description: record.description,
      sessionFile: record.sessionFile,
      taskSnapshot: record.taskSnapshot === undefined ? undefined : validateTaskSnapshot(record.taskSnapshot),
      completedAt: record.completedAt ?? Date.now(),
    });
    // Bound the memory a long session can accumulate. Oldest first, since the
    // agent someone still wants to reach is the one they used most recently.
    while (this.tombstones.size > MAX_TOMBSTONES) {
      const oldest = [...this.tombstones.values()].reduce((a, b) => (a.completedAt <= b.completedAt ? a : b));
      this.tombstones.delete(oldest.handle);
    }
  }

  private cleanup() {
    const cutoff = Date.now() - 10 * 60_000;
    for (const [id, record] of this.agents) {
      if (record.status === "running" || record.status === "queued" || this.attempts.has(record)) continue;
      if ((record.completedAt ?? 0) >= cutoff) continue;
      this.removeRecord(id, record);
    }
  }

  /**
   * Drop finished records. A record with a settlement error is retained, except at
   * a successful session switch (`isSessionSwitch`) once its error was reported:
   * the helper's durable recovery state on disk stays authoritative.
   */
  clearCompleted(skipUnconsumed = false, isSessionSwitch = false): void {
    for (const [id, record] of this.agents) {
      if (record.status === "running" || record.status === "queued" || this.attempts.has(record)) continue;
      if (skipUnconsumed && !record.resultConsumed) continue;
      this.removeRecord(id, record, isSessionSwitch);
    }
    this.tombstones.clear();
  }

  hasRunning(): boolean {
    return this.attempts.size > 0 || [...this.agents.values()].some(
      r => r.status === "running" || r.status === "queued",
    );
  }

  abortAll(): number {
    let count = 0;
    // Clear queued agents first
    for (const queued of this.queue) {
      const record = this.agents.get(queued.id);
      if (record) {
        record.status = "stopped";
        record.completedAt = Date.now();
        count++;
      }
    }
    this.dequeue(() => true);
    for (const record of this.agents.values()) {
      this.parentAbortCleanup.get(record)?.();
      // Same rule as abort(): a settling record's work is cancelled, its status kept.
      if (record.status !== "running" && this.attempts.has(record)) record.abortController?.abort();
      if (record.status === "running") {
        record.abortController?.abort();
        record.status = "stopped";
        record.completedAt = Date.now();
        this.finishRun(record, false, false);
        count++;
      }
    }
    return count;
  }

  async waitForAll(): Promise<void> {
    const failures: unknown[] = [];
    while (this.attempts.size || this.queue.length) {
      this.drainQueue();
      const attempts = [...this.attempts.entries()];
      const pending: Promise<unknown>[] = attempts.map(([, attempt]) => attempt);
      for (const entry of this.queue) { const gate = this.agents.get(entry.id)?.startGate; if (gate) pending.push(gate); }
      if (!pending.length) break;
      const results = await Promise.allSettled(pending);
      results.forEach((result, index) => {
        // A settlement failure is reported once, from its record, below.
        if (result.status === "rejected" && !attempts[index]?.[0].taskSettlementError) failures.push(result.reason);
      });
    }
    for (const record of this.unreportedSettlements) failures.push(new Error(record.taskSettlementError));
    this.unreportedSettlements.clear();
    if (failures.length) throw new AggregateError(failures, failures.map(error => error instanceof Error ? error.message : String(error)).join("; "));
  }

  async dispose(_pi?: ExtensionAPI): Promise<void> {
    clearInterval(this.cleanupInterval);
    this.isDisposing = true;
    this.abortAll(); this.dequeue(() => true);
    try { await this.waitForAll(); }
    finally {
      const sessions = [...this.agents.values()].map(record => record.session);
      await Promise.all(sessions.map(shutdownChildSession));
    }
    this.agents.clear(); this.startups.clear(); this.unreportedSettlements.clear(); this.binding = undefined;
  }
}
