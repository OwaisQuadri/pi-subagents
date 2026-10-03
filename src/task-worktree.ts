import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { isAbsolute, join } from "node:path";
import { getShellConfig } from "@earendil-works/pi-coding-agent";

export type TaskAccess = "write" | "read-stable";

/**
 * How long a control request (ensure, claim, verify, release, cancel, finish) and
 * the post-EOF exit wait may take. A miss fails the connection as uncertain: task
 * data stays, the helper is not killed, and the error reaches the caller.
 */
export const TASK_AUTHORITY_CONTROL_DEADLINE_MS = 120_000;
/** Added to a caller's `timeout_ms` for the helper's own shutdown and quiet-settlement checks. */
export const TASK_AUTHORITY_RUN_GRACE_MS = 120_000;

export interface TaskIdentity {
  repository: string;
  task_id: string;
  generation: number;
}

export interface TaskRecord {
  version: 1;
  repository_id: string;
  task_id: string;
  generation: number;
  checkout: string;
  branch: string;
  base_oid: string;
  private_git_dir: string;
  checkout_dev: number;
  checkout_ino: number;
  private_dev: number;
  private_ino: number;
  state: string;
  head_oid: string;
  scratch: string;
  evidence: string;
  preservation: string | null;
  disposable_targets: string[];
  token?: string;
  access?: TaskAccess;
}

export interface TaskSnapshot extends TaskIdentity {
  repository_id: string;
  base_oid: string;
  checkout: string;
  access: TaskAccess;
  configCwd: string;
}

export interface TaskRunResult {
  exit_code: number | null;
  stdout: string;
  stderr: string;
  is_cancelled: boolean;
  is_timed_out: boolean;
  is_disconnected: boolean;
}

export interface TaskRun {
  argv: string[];
  cwd: string;
  env: Record<string, string>;
  outputs?: { target?: string; scratch?: string };
  timeout_ms?: number;
}

/**
 * The argv Pi's native bash tool would spawn for `command`: the same shell
 * resolution, including the user's `shellPath` setting, so a managed command
 * behaves exactly as it would unmanaged.
 */
export function taskShellArgv(shellPath: string | undefined, command: string): string[] {
  const { shell, args, commandTransport } = getShellConfig(shellPath);
  if (commandTransport === "stdin") throw new Error(`Managed task commands pass the command as an argument, but ${shell} reads it from stdin`);
  return [shell, ...args, command];
}

export class TaskAuthorityError extends Error {
  constructor(readonly code: string, message: string) {
    super(`${code}: ${message}`);
    this.name = "TaskAuthorityError";
  }
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid task authority object");
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, required: string[], optional: string[] = []): void {
  if (required.some(key => !(key in value)) || Object.keys(value).some(key => !required.includes(key) && !optional.includes(key))) {
    throw new Error("Invalid task authority fields");
  }
}

export function homeRelativePath(path: string): string {
  const home = homedir().replace(/\/+$/, "");
  return home && path.startsWith(`${home}/`) ? `~${path.slice(home.length)}` : path;
}

export function validateTaskAccess(value: unknown): TaskAccess {
  if (value !== "write" && value !== "read-stable") throw new Error('task_access must be "write" or "read-stable"');
  return value;
}

export function validateTaskId(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value.includes("\0") || Buffer.byteLength(value) > 128) {
    throw new Error("task_id must be an explicit nonempty string of at most 128 UTF-8 bytes; use /agents task bind");
  }
  return value;
}

export function validateTaskSnapshot(value: unknown): TaskSnapshot {
  const snapshot = object(value);
  const keys = ["repository", "task_id", "generation", "repository_id", "base_oid", "checkout", "access", "configCwd"];
  if (keys.some(key => !Object.hasOwn(snapshot, key)) || Object.keys(snapshot).some(key => !keys.includes(key))) {
    throw new Error("Invalid task snapshot fields; bind an existing task explicitly");
  }
  validateTaskId(snapshot.task_id);
  validateTaskAccess(snapshot.access);
  for (const key of ["repository", "checkout", "configCwd"]) {
    if (typeof snapshot[key] !== "string" || !isAbsolute(snapshot[key])) throw new Error(`Invalid task snapshot ${key}`);
  }
  if (typeof snapshot.repository_id !== "string" || !snapshot.repository_id ||
      typeof snapshot.base_oid !== "string" || !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(snapshot.base_oid) ||
      typeof snapshot.generation !== "number" || !Number.isSafeInteger(snapshot.generation) || snapshot.generation <= 0) {
    throw new Error("Invalid task snapshot identity or base");
  }
  return Object.freeze({ ...snapshot }) as unknown as TaskSnapshot;
}

function validateRecord(value: unknown): TaskRecord {
  const record = object(value);
  const strings = ["repository_id", "task_id", "checkout", "branch", "base_oid", "private_git_dir", "state", "head_oid", "scratch", "evidence"];
  const integers = ["generation", "checkout_dev", "checkout_ino", "private_dev", "private_ino"];
  exactKeys(record, ["version", ...strings, ...integers, "preservation", "disposable_targets"], ["token", "access"]);
  if (record.version !== 1 || strings.some(key => typeof record[key] !== "string" || !record[key]) ||
      integers.some(key => typeof record[key] !== "number" || !Number.isSafeInteger(record[key]) || (record[key] as number) < 0) ||
      (record.preservation !== null && typeof record.preservation !== "string") ||
      !Array.isArray(record.disposable_targets) || record.disposable_targets.some(path => typeof path !== "string" || !isAbsolute(path)) ||
      (record.token !== undefined && (typeof record.token !== "string" || !record.token)) ||
      (record.access !== undefined && record.access !== "write" && record.access !== "read-stable")) {
    throw new Error("Invalid task authority record");
  }
  for (const key of ["checkout", "private_git_dir", "scratch", "evidence"]) {
    if (!isAbsolute(record[key] as string)) throw new Error("Invalid task authority path");
  }
  if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(record.base_oid as string) ||
      !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(record.head_oid as string)) throw new Error("Invalid task authority revision");
  validateTaskId(record.task_id);
  if (!record.generation || !["allocating", "open", "recovery-required", "complete", "abandoned", "removing", "removed"].includes(record.state as string)) {
    throw new Error("Invalid task authority state or generation");
  }
  return record as unknown as TaskRecord;
}

function validateRun(value: unknown): TaskRunResult {
  const result = object(value);
  exactKeys(result, ["exit_code", "stdout", "stderr", "is_cancelled", "is_timed_out", "is_disconnected"]);
  if ((result.exit_code !== null && !Number.isInteger(result.exit_code)) ||
      typeof result.stdout !== "string" || !isAbsolute(result.stdout) ||
      typeof result.stderr !== "string" || !isAbsolute(result.stderr) ||
      ["is_cancelled", "is_timed_out", "is_disconnected"].some(key => typeof result[key] !== "boolean")) {
    throw new Error("Invalid task authority run result");
  }
  return result as unknown as TaskRunResult;
}

interface Pending {
  resolve: (result: unknown) => void;
  reject: (error: Error) => void;
}

export interface TaskAuthorityFixture {
  binary: string;
  storage: string;
}

export class TaskAuthority {
  private child?: ChildProcessWithoutNullStreams;
  private connection?: Promise<void>;
  private exit?: Promise<void>;
  private pending = new Map<string, Pending>();
  private sequence = 0;
  private readonly nonce = randomUUID();
  private failure?: Error;
  private isReady = false;
  private isClosing = false;
  private readonly binary: string;
  private readonly storage: string;

  constructor(fixture?: TaskAuthorityFixture) {
    if (fixture && (!isAbsolute(fixture.binary) || !isAbsolute(fixture.storage))) {
      throw new Error("Task authority fixture requires exact absolute binary and storage paths");
    }
    this.binary = fixture?.binary ?? "worktree-hygiene";
    this.storage = fixture?.storage ?? join(homedir(), ".local", "share", "agents", "task-worktrees", "v1");
  }

  private fail(error: Error): void {
    this.failure ??= error;
    for (const entry of this.pending.values()) entry.reject(this.failure);
    this.pending.clear();
    this.child?.stdin.end();
  }

  private connect(): Promise<void> {
    this.connection ??= this.open();
    return this.connection;
  }

  private async open(): Promise<void> {
    await mkdir(this.storage, { recursive: true, mode: 0o700 });
    const child = spawn(this.binary, ["task", "--storage", this.storage], { stdio: ["pipe", "pipe", "pipe"] });
    this.child = child;
    let stderr = "";
    child.stderr.on("data", (data: Buffer) => { stderr = (stderr + data.toString()).slice(-4096); });
    this.exit = new Promise<void>((resolve) => { child.once("close", () => resolve()); });
    return new Promise<void>((resolve, reject) => {
      let buffer = Buffer.alloc(0);
      const startup = setTimeout(() => {
        const error = new Error("Task authority did not send version-1 ready within 10 seconds");
        this.fail(error);
        child.kill();
        reject(error);
      }, 10_000);
      const failed = (error: Error) => {
        clearTimeout(startup);
        this.fail(error);
        reject(error);
      };
      child.once("error", failed);
      child.stdin.on("error", failed);
      child.stdout.on("error", failed);
      child.stderr.on("error", failed);
      child.once("close", (code, signal) => {
        failed(new Error(`Task authority disconnected (${code ?? signal}): ${stderr}`));
      });
      child.stdout.on("data", (data: Buffer) => {
        buffer = Buffer.concat([buffer, data]);
        try {
          let newline = buffer.indexOf(10);
          while (newline !== -1) {
            if (newline > 1_048_576) throw new Error("Task authority response exceeds frame limit");
            const message = object(JSON.parse(buffer.subarray(0, newline).toString("utf8")));
            buffer = buffer.subarray(newline + 1);
            if (message.version !== 1) throw new Error("Unsupported task authority protocol version");
            if (message.event === "ready") {
              exactKeys(message, ["version", "event", "pid"]);
              if (this.isReady || message.pid !== child.pid) throw new Error("Invalid task authority ready");
              this.isReady = true;
              clearTimeout(startup);
              resolve();
            } else {
              if (!this.isReady || message.event !== "response" || typeof message.id !== "string" || typeof message.is_ok !== "boolean") {
                throw new Error("Invalid task authority response");
              }
              const entry = this.pending.get(message.id);
              if (!entry) throw new Error("Uncorrelated task authority response");
              exactKeys(message, ["version", "event", "id", "is_ok", message.is_ok ? "result" : "error"]);
              if (message.is_ok) {
                const result = object(message.result);
                this.pending.delete(message.id);
                entry.resolve(result);
              } else {
                const error = object(message.error);
                exactKeys(error, ["code", "message"]);
                if (typeof error.code !== "string" || typeof error.message !== "string" ||
                    !["InvalidRequest", "TaskBusy", "IdentityMismatch", "RecoveryRequired", "UnsafePath", "NotPreserved", "UnknownUse", "HelperError"].includes(error.code)) {
                  throw new Error("Invalid task authority error");
                }
                this.pending.delete(message.id);
                entry.reject(new TaskAuthorityError(error.code, error.message));
              }
            }
            newline = buffer.indexOf(10);
          }
          if (buffer.length > 1_048_576) throw new Error("Task authority response exceeds frame limit");
        } catch (error) {
          failed(error instanceof Error ? error : new Error(String(error)));
        }
      });
    });
  }

  private async request(operation: string, body: object, id = `${this.nonce}:${++this.sequence}`, deadlineMs: number | null = TASK_AUTHORITY_CONTROL_DEADLINE_MS): Promise<unknown> {
    await this.connect();
    if (this.failure) throw this.failure;
    if (this.isClosing) throw new Error("Task authority connection is closing");
    const frame = `${JSON.stringify({ version: 1, id, operation, body })}\n`;
    if (Buffer.byteLength(frame) > 1_048_576) throw new Error("Task authority request exceeds frame limit");
    return new Promise((resolve, reject) => {
      // A missed deadline fails the whole connection: its state is unknown, so EOF
      // follows and every pending request rejects rather than one reading as success.
      const timer = deadlineMs === null ? undefined : setTimeout(() => {
        this.fail(new Error(`Task authority ${operation} did not respond within ${deadlineMs} ms; settlement is uncertain and task data is retained`));
      }, deadlineMs);
      this.pending.set(id, {
        resolve: value => { clearTimeout(timer); resolve(value); },
        reject: error => { clearTimeout(timer); reject(error); },
      });
      this.child!.stdin.write(frame, (error) => { if (error) this.fail(error); });
    });
  }

  async ensure(repository: string, task_id: string, base_oid: string): Promise<TaskRecord> {
    const record = validateRecord(await this.request("ensure", { repository, task_id: validateTaskId(task_id), base_oid }));
    if (record.task_id !== task_id || record.base_oid !== base_oid) throw new Error("Task authority allocation identity mismatch");
    return record;
  }

  async claim(identity: TaskIdentity, access: TaskAccess, worker_run: string): Promise<TaskRecord & { token: string; access: TaskAccess }> {
    const record = validateRecord(await this.request("claim", { ...identity, access: validateTaskAccess(access), worker_run }));
    if (!record.token || record.access !== access || record.task_id !== identity.task_id || record.generation !== identity.generation) {
      throw new Error("Task authority claim identity mismatch");
    }
    return record as TaskRecord & { token: string; access: TaskAccess };
  }

  async verify(identity: TaskIdentity, token: string): Promise<TaskRecord> {
    const record = validateRecord(await this.request("verify", { ...identity, token }));
    if (record.task_id !== identity.task_id || record.generation !== identity.generation) throw new Error("Task authority verification identity mismatch");
    return record;
  }

  async release(identity: TaskIdentity, token: string): Promise<void> {
    const result = object(await this.request("release", { ...identity, token }));
    exactKeys(result, ["is_released"]);
    if (result.is_released !== true) throw new Error("Task authority did not release claim");
  }

  async run(identity: TaskIdentity, token: string, command: TaskRun, signal?: AbortSignal): Promise<TaskRunResult> {
    if (signal?.aborted) throw new Error("aborted");
    const run_id = `${this.nonce}:${++this.sequence}`;
    let cancel: Promise<void> | undefined;
    const onAbort = () => {
      cancel = this.request("cancel", { ...identity, token, run_id }).then(value => {
        const result = object(value);
        exactKeys(result, ["run_id", "is_cancel_requested"]);
        if (result.run_id !== run_id || result.is_cancel_requested !== true) throw new Error("Invalid task authority cancel acknowledgment");
      }).catch(() => {});
    };
    // Register only once the run frame has been written, so cancel cannot overtake it.
    await this.connect();
    // Bounded only when the caller bounded the command; an unbounded command stays
    // unbounded, and settlement cancels it before release.
    const deadlineMs = command.timeout_ms === undefined ? null : command.timeout_ms + TASK_AUTHORITY_RUN_GRACE_MS;
    const result = this.request("run", { ...identity, token, ...command }, run_id, deadlineMs);
    await Promise.resolve();
    signal?.addEventListener("abort", onAbort, { once: true });
    if (signal?.aborted) onAbort();
    try {
      const settled = validateRun(await result);
      // The run's own response is authoritative. A cancel that lost the race
      // reaches a helper with no active run and fails; that is not a run failure.
      await cancel;
      return settled;
    } finally {
      signal?.removeEventListener("abort", onAbort);
    }
  }

  async finish(identity: TaskIdentity, disposition: "complete" | "abandoned", preservation: string): Promise<TaskRecord> {
    return validateRecord(await this.request("finish", { ...identity, disposition, preservation }));
  }

  async close(): Promise<void> {
    if (!this.connection) return;
    this.isClosing = true;
    try { await this.connection; } finally {
      this.child?.stdin.end();
      // EOF asks the helper to settle a quiet claim and exit. Waiting is bounded so a
      // hung helper cannot strand quit, but it is never killed: a miss is uncertainty.
      let timer: ReturnType<typeof setTimeout> | undefined;
      const deadline = new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error(`Task authority did not exit within ${TASK_AUTHORITY_CONTROL_DEADLINE_MS} ms after EOF; settlement is uncertain and task data is retained`)), TASK_AUTHORITY_CONTROL_DEADLINE_MS);
      });
      try { await Promise.race([this.exit, deadline]); } finally { clearTimeout(timer); }
    }
  }
}

export class TaskClaim {
  private isReleased = false;
  private active = new Set<Promise<TaskRunResult>>();

  constructor(readonly authority: TaskAuthority, readonly snapshot: TaskSnapshot, readonly token: string) {}

  run(command: TaskRun, signal?: AbortSignal): Promise<TaskRunResult> {
    if (this.isReleased) return Promise.reject(new Error("Task claim already released"));
    const run = this.authority.run(this.snapshotIdentity(), this.token, command, signal);
    this.active.add(run);
    void run.then(() => this.active.delete(run), () => this.active.delete(run));
    return run;
  }

  private snapshotIdentity(): TaskIdentity {
    const { repository, task_id, generation } = this.snapshot;
    return { repository, task_id, generation };
  }

  async release(): Promise<void> {
    if (this.isReleased) throw new Error("Task claim already released");
    await Promise.all(this.active);
    await this.authority.release(this.snapshotIdentity(), this.token);
    this.isReleased = true;
    await this.authority.close();
  }
}

export interface TaskClaimHolder {
  current?: TaskClaim;
  recovery?: {
    snapshot: TaskSnapshot;
    phases: ("children" | "hook" | "release" | "close")[];
    error: string;
  };
}
