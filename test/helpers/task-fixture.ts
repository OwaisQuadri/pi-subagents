import { randomUUID } from "node:crypto";
import { accessSync, constants, mkdtempSync, realpathSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join } from "node:path";
import { afterEach } from "vitest";
import type { TaskAccess, TaskIdentity, TaskRecord, TaskSnapshot } from "../../src/task-worktree.js";

/** The one place helper-backed suites learn where the `worktree-hygiene` task helper lives. */
export const TASK_HELPER_ENV = "PI_SUBAGENTS_TASK_HELPER";
export const TASK_HELPER_SKIP_REASON = `skipped: ${TASK_HELPER_ENV} is unset; set it to the absolute path of an executable worktree-hygiene task helper to run this suite`;

/**
 * Absolute path of the configured task helper, or "" when the variable is unset.
 * Throws when it is set but names no executable file: a configured but broken
 * helper must fail the suite, not quietly skip it.
 */
export function taskHelper(): string {
  const value = process.env[TASK_HELPER_ENV];
  if (!value) return "";
  if (!isAbsolute(value)) throw new Error(`${TASK_HELPER_ENV} must be an absolute path, got "${value}"`);
  try {
    if (!statSync(value).isFile()) throw new Error("not a regular file");
    accessSync(value, constants.X_OK);
  } catch (error) {
    throw new Error(`${TASK_HELPER_ENV} is set to "${value}", which is missing or not executable: ${error instanceof Error ? error.message : String(error)}`);
  }
  return value;
}

/** A helper-backed suite or test title, carrying the visible skip reason when the helper is unset. */
export function taskHelperTitle(title: string): string {
  if (taskHelper()) return title;
  // Written directly: the default reporter hides collection-time console output, and the reason must stay visible.
  process.stderr.write(`${title}: ${TASK_HELPER_SKIP_REASON}\n`);
  return `${title} [${TASK_HELPER_SKIP_REASON}]`;
}

/** A fresh canonical fixture directory under the OS temp root (macOS /var resolves to /private/var). */
export function fixtureDirectory(prefix: string): string {
  return realpathSync(mkdtempSync(join(tmpdir(), `pi-subagents-${prefix}-`)));
}

const tasks = new Map<string, TaskRecord>();
const claims = new Map<string, { access: TaskAccess; identity: TaskIdentity }>();
const pending = new Set<() => void>();
const held = new Set<() => void>();
const shutdowns = new Set<() => Promise<void>>();
const taskKey = (identity: Pick<TaskIdentity, "repository" | "task_id">) => `${identity.repository}\0${identity.task_id}`;

export function declareTask(repository: string, task_id: string): TaskSnapshot {
  const key = taskKey({ repository, task_id });
  if (!tasks.has(key)) tasks.set(key, {
    version: 1, repository_id: repository, task_id, generation: 1, checkout: repository,
    branch: "fixture", base_oid: "a".repeat(40), head_oid: "a".repeat(40), private_git_dir: repository,
    checkout_dev: 1, checkout_ino: 1, private_dev: 1, private_ino: 1, state: "open",
    scratch: repository, evidence: repository, preservation: null, disposable_targets: [],
  });
  const record = tasks.get(key)!;
  return { repository, task_id, generation: 1, repository_id: record.repository_id, base_oid: record.base_oid, checkout: repository, access: "write", configCwd: repository };
}

export class FixtureTaskAuthority {
  private token?: string;
  async ensure(repository: string, task_id: string, base_oid: string): Promise<TaskRecord> {
    const record = tasks.get(taskKey({ repository, task_id }));
    if (!record || record.base_oid !== base_oid) throw new Error("IdentityMismatch: fixture task must be explicitly declared at its exact base");
    return { ...record };
  }
  async claim(identity: TaskIdentity, access: TaskAccess, worker_run: string): Promise<TaskRecord> {
    if (!worker_run || (access !== "write" && access !== "read-stable")) throw new Error("InvalidRequest: fixture worker/access");
    const key = taskKey(identity); const record = tasks.get(key);
    if (!record) throw new Error("HelperError: fixture task is not initialized");
    if (identity.generation !== record.generation || this.token) throw new Error("IdentityMismatch: fixture claim identity");
    for (const claim of claims.values()) if (taskKey(claim.identity) === key && (claim.access === "write" || access === "write")) throw new Error("TaskBusy: fixture claim is held");
    this.token = randomUUID(); claims.set(this.token, { access, identity });
    return { ...record, token: this.token, access };
  }
  async verify(identity: TaskIdentity, token: string): Promise<TaskRecord> {
    const claim = claims.get(token);
    if (token !== this.token || !claim || taskKey(identity) !== taskKey(claim.identity) || identity.generation !== claim.identity.generation) throw new Error("IdentityMismatch: fixture token");
    return { ...tasks.get(taskKey(identity))! };
  }
  async release(identity: TaskIdentity, token: string): Promise<void> {
    await this.verify(identity, token); claims.delete(token); this.token = undefined;
  }
  async close(): Promise<void> { if (this.token) { claims.delete(this.token); this.token = undefined; } }
}

export function heldWorker<T>(value: T, start?: () => void, signal?: AbortSignal): Promise<T> {
  return new Promise(resolve => {
    const settle = () => { pending.delete(settle); held.delete(settle); signal?.removeEventListener("abort", settle); resolve(value); };
    pending.add(settle); held.add(settle); signal?.addEventListener("abort", settle, { once: true }); start?.();
    if (signal?.aborted) settle();
  });
}

export function fixturePromise<T>(start: (resolve: (value: T) => void, reject: (error: unknown) => void) => void, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const clean = () => { pending.delete(cancel); signal?.removeEventListener("abort", cancel); };
    const finish = (value: T) => { clean(); resolve(value); };
    const cancel = () => finish({ responseText: "stopped", text: "stopped", session: { messages: [], dispose() {} }, aborted: false, steered: false } as T);
    pending.add(cancel); signal?.addEventListener("abort", cancel, { once: true });
    start(finish, error => { clean(); reject(error); });
    if (signal?.aborted) cancel();
  });
}

export function settleFixtureWorkers(): void { for (const settle of [...pending]) settle(); }

export function wiringTasks(pi: any, task_ids: readonly string[]): void {
  if (!task_ids.length) throw new Error("Declare at least one fixture task");
  let call = 0;
  let ready: Promise<void> | undefined;
  let command: any;
  const snapshots = (cwd: string) => task_ids.map(task_id => declareTask(cwd, task_id));
  const initialize = (ctx: any) => ready ??= (async () => {
    const [snapshot] = snapshots(ctx.cwd);
    await command.handler(`task bind ${snapshot.task_id} --base ${snapshot.base_oid}`, ctx);
  })();
  const registerCommand = pi.registerCommand.getMockImplementation();
  pi.registerCommand.mockImplementation((name: string, definition: any) => {
    if (name === "agents") command = definition;
    return registerCommand?.(name, definition);
  });
  const registerTool = pi.registerTool.getMockImplementation();
  pi.registerTool.mockImplementation((tool: any) => registerTool?.({ ...tool,
    execute: async (id: string, params: any, signal: AbortSignal | undefined, update: unknown, ctx: any) => {
      if (tool.name === "Agent" && !params.resume && !params.schedule) {
        snapshots(ctx.cwd);
        const task_id = task_ids[1 + call++];
        if (!task_id) throw new Error("Fixture exhausted its explicitly declared task IDs");
        return tool.execute(id, { task_id, ...params }, signal, update, ctx);
      }
      return tool.execute(id, params, signal, update, ctx);
    },
  }));
  const on = pi.on.getMockImplementation();
  pi.on.mockImplementation((name: string, handler: any) => {
    if (name === "session_shutdown") shutdowns.add(() => handler());
    return on?.(name, async (event: unknown, ctx: any) => {
      if (name === "input") await initialize(ctx);
      if (name === "session_start") {
        const [snapshot] = snapshots(ctx.cwd);
        const original = ctx.sessionManager.getBranch.bind(ctx.sessionManager);
        const bound = { ...ctx, sessionManager: { ...ctx.sessionManager, getBranch: () => [{ type: "custom", customType: "subagents:task-binding", data: { version: 1, snapshot } }, ...original()] } };
        return handler(event, bound);
      }
      const result = handler(event, ctx);
      if (name === "session_shutdown") for (const settle of [...held]) settle();
      return result;
    });
  });
}

afterEach(async () => {
  settleFixtureWorkers();
  const handlers = [...shutdowns]; shutdowns.clear();
  await Promise.all(handlers.map(handler => handler()));
  if (claims.size) throw new Error(`Fixture teardown retained ${claims.size} claims`);
  tasks.clear();
});
