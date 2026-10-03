import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { open } from "node:fs/promises";
import { join } from "node:path";
import { fauxAssistantMessage, fauxToolCall } from "@earendil-works/pi-ai";
import type { AgentSession, ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AgentManager, type OnAgentComplete } from "../src/agent-manager.js";
import type * as runnerModule from "../src/agent-runner.js";
import { resumeAgent, runAgent } from "../src/agent-runner.js";
import { registerAgents } from "../src/agent-types.js";
import { TaskAuthority, type TaskClaimHolder } from "../src/task-worktree.js";
import { fauxModelBackend } from "./helpers/faux-model-backend.js";
import { registerFauxProvider } from "./helpers/pi-ai.js";
import { fixtureDirectory, taskHelper, taskHelperTitle } from "./helpers/task-fixture.js";

vi.mock("../src/agent-runner.js", () => ({ runAgent: vi.fn(), resumeAgent: vi.fn() }));
vi.setConfig({ testTimeout: 30_000 });
const binary = taskHelper();
const managers: AgentManager[] = [];
const releases: (() => void)[] = [];
const holders = new Map<AgentSession, TaskClaimHolder>();

function latch() {
  let release!: () => void;
  const promise = new Promise<void>(resolve => { release = resolve; });
  releases.push(release);
  return { promise, release };
}

beforeEach(() => {
  vi.mocked(runAgent).mockReset().mockImplementation(async (_ctx, _type, _prompt, options) => {
    const session = { dispose: vi.fn(), sessionManager: { getSessionFile: () => undefined } } as unknown as AgentSession;
    holders.set(session, options.taskClaimHolder!);
    options.onSessionCreated?.(session);
    return { responseText: "worker result", session, aborted: false, steered: false };
  });
  vi.mocked(resumeAgent).mockReset().mockResolvedValue({ text: "resume result" });
});

afterEach(async () => {
  for (const release of releases.splice(0)) release();
  vi.restoreAllMocks();
  for (const manager of managers.splice(0)) {
    // A retained settlement error rejects the first dispose only; a test that
    // already surfaced it leaves a dispose that resolves.
    const settlementError = manager.listAgents().find(record => record.taskSettlementError)?.taskSettlementError;
    await manager.dispose().catch((error: Error) => { if (!settlementError || !error.message.includes(settlementError)) throw error; });
  }
  holders.clear();
});

function fixture(maxConcurrent = 10, selectedBinary = binary, onComplete?: OnAgentComplete) {
  const directory = fixtureDirectory("manager");
  const repository = join(directory, "repository");
  const storage = join(directory, "storage");
  mkdirSync(repository);
  const git = (args: string[]) => execFileSync("git", args, { cwd: repository, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  git(["init"]); git(["config", "user.name", "Fixture"]); git(["config", "user.email", "fixture@example.invalid"]);
  writeFileSync(join(repository, "source.txt"), "base A");
  git(["add", "source.txt"]); git(["commit", "-m", "fixture A"]);
  const base = git(["rev-parse", "HEAD"]);
  const manager = new AgentManager(onComplete, maxConcurrent, undefined, undefined, undefined, false, { binary: selectedBinary, storage });
  managers.push(manager);
  const ctx = { cwd: repository, thinkingLevel: "medium" } as unknown as ExtensionContext;
  const pi = {} as ExtensionAPI;
  const bind = (task_id = "task-A") => manager.bindTask(repository, task_id, { base_oid: base, configCwd: repository });
  return { directory, repository, storage, base, git, manager, ctx, pi, bind };
}

describe.skipIf(!binary)(taskHelperTitle("mandatory manager task ownership"), () => {
  it("rejects missing identity and malformed public task fields before worker launch", () => {
    const f = fixture();
    expect(() => f.manager.spawn(f.pi, f.ctx, "fixture", "prompt", { description: "missing" })).toThrow(/task_id|bind/);
    expect(() => f.manager.spawn(f.pi, f.ctx, "fixture", "prompt", { description: "bad", task_id: "", task_access: "write" })).toThrow(/task_id/);
    expect(() => f.manager.spawn(f.pi, f.ctx, "fixture", "prompt", { description: "bad", task_id: "A", task_access: null as never })).toThrow(/task_access/);
    expect(runAgent).not.toHaveBeenCalled();
    expect(f.manager.listAgents()).toEqual([]);
  });

  it("never allocates on missing existing task or missing helper", async () => {
    const f = fixture();
    await expect(f.manager.bindTask(f.repository, "missing")).rejects.toThrow(/HelperError|bind|existing/);
    expect(f.manager.getTaskBinding()).toBeUndefined();
    const broken = fixture(10, join(f.directory, "absent-helper"));
    const id = broken.manager.spawn(broken.pi, broken.ctx, "fixture", "prompt", { description: "missing helper", task_id: "explicit" });
    await expect(broken.manager.awaitStartup(id)).rejects.toThrow(/ENOENT|disconnected/);
    expect(runAgent).not.toHaveBeenCalled();
  });

  it("captures task A and model/thinking before queueing despite later task B binding", async () => {
    const f = fixture(1);
    const a = await f.bind();
    const hold = latch();
    vi.mocked(runAgent).mockImplementationOnce(async (_ctx, _type, _prompt, options) => {
      options.signal?.addEventListener("abort", hold.release, { once: true });
      await hold.promise;
      return { responseText: "holder", session: { dispose() {} } as AgentSession, aborted: false, steered: false };
    });
    const blocker = f.manager.spawn(f.pi, f.ctx, "fixture", "holder", { description: "holder", isBackground: true });
    await f.manager.awaitStartup(blocker);
    const modelA = { id: "selected-A", provider: "fixture" };
    const modelB = { id: "selected-B", provider: "fixture" };
    Object.assign(f.ctx, { model: modelA });
    const queued = f.manager.spawn(f.pi, f.ctx, "fixture", "queued", { description: "queued", isBackground: true });
    expect(f.manager.getRecord(queued)?.status).toBe("queued");
    expect(f.manager.getRecord(queued)?.taskSnapshot).toEqual(a);
    await f.bind("task-B");
    Object.assign(f.ctx, { model: modelB, thinkingLevel: "high" });
    hold.release();
    await f.manager.waitForAll();
    const options = vi.mocked(runAgent).mock.calls[1][3];
    expect(options.cwd).toBe(a.checkout);
    expect(options.configCwd).toBe(f.repository);
    expect(options.model?.id).toBe("selected-A");
    expect(options.thinkingLevel).toBe("medium");
    expect(f.manager.getRecord(queued)?.taskSnapshot?.task_id).toBe("task-A");
  });

  it("same-task contention fails while an independent task launches", async () => {
    const f = fixture();
    await f.bind();
    const hold = latch();
    vi.mocked(runAgent).mockImplementationOnce(async (_ctx, _type, _prompt, options) => {
      options.signal?.addEventListener("abort", hold.release, { once: true });
      await hold.promise;
      return { responseText: "held", session: { dispose() {} } as AgentSession, aborted: false, steered: false };
    });
    const held = f.manager.spawn(f.pi, f.ctx, "fixture", "held", { description: "held", isBackground: true });
    await f.manager.awaitStartup(held);
    await expect(f.manager.spawnAndWait(f.pi, f.ctx, "fixture", "collision", { description: "collision" })).rejects.toThrow("TaskBusy");
    await f.bind("task-B");
    const independent = await f.manager.spawnAndWait(f.pi, f.ctx, "fixture", "independent", { description: "independent" });
    expect(independent.record.status).toBe("completed");
    expect(independent.record.taskSnapshot?.checkout).not.toBe(f.manager.getRecord(held)?.taskSnapshot?.checkout);
    hold.release();
    await f.manager.waitForAll();
  });

  it("keeps edited failed-worker handoff and immutable base after parent HEAD advances", async () => {
    const f = fixture();
    const snapshot = await f.bind();
    vi.mocked(runAgent).mockImplementationOnce(async (_ctx, _type, _prompt, options) => {
      const claim = options.taskClaimHolder!.current!;
      await claim.run({ argv: ["/bin/sh", "-c", "printf edited > source.txt"], cwd: claim.snapshot.checkout, env: {} });
      return { responseText: "failed worker prose", session: { dispose() {} } as AgentSession, aborted: false, steered: false, failure: "fixture worker failure" };
    });
    const first = await f.manager.spawnAndWait(f.pi, f.ctx, "fixture", "edit", { description: "edit", isolation: "off" });
    expect(first.record.status).toBe("error");
    writeFileSync(join(f.repository, "source.txt"), "base B");
    f.git(["commit", "-am", "fixture B"]);
    const second = await f.manager.spawnAndWait(f.pi, f.ctx, "fixture", "handoff", { description: "handoff" });
    expect(second.record.taskSnapshot?.base_oid).toBe(f.base);
    expect(second.record.taskSnapshot?.checkout).toBe(snapshot.checkout);
    expect(readFileSync(join(snapshot.checkout, "source.txt"), "utf8")).toBe("edited");
    expect(first.record.result).toBe("failed worker prose");
    expect(first.record.worktree).toBeUndefined();
    expect(first.record.worktreeResult).toBeUndefined();
  });

  it.each([false, true])("resumes foreground/background=%s using a fresh token in the same holder and checkout", async isBackground => {
    const f = fixture();
    const snapshot = await f.bind();
    let firstToken = "";
    let sessionHolder: TaskClaimHolder | undefined;
    vi.mocked(runAgent).mockImplementationOnce(async (_ctx, _type, _prompt, options) => {
      sessionHolder = options.taskClaimHolder;
      firstToken = sessionHolder!.current!.token;
      const session = { dispose() {} } as AgentSession;
      holders.set(session, sessionHolder!);
      options.onSessionCreated?.(session);
      return { responseText: "first", session, aborted: false, steered: false };
    });
    const { id, record } = await f.manager.spawnAndWait(f.pi, f.ctx, "fixture", "first", { description: "first" });
    expect(sessionHolder?.current).toBeUndefined();
    vi.mocked(resumeAgent).mockImplementationOnce(async session => {
      const holder = holders.get(session)!;
      expect(holder).toBe(sessionHolder);
      expect(holder.current?.token).not.toBe(firstToken);
      expect(holder.current?.snapshot.checkout).toBe(snapshot.checkout);
      await holder.current!.run({ argv: ["/bin/sh", "-c", "printf resumed > resumed.txt"], cwd: snapshot.checkout, env: {} });
      return { text: "resumed" };
    });
    await f.manager.resume(id, "again", undefined, { isBackground });
    await record.promise;
    expect(record.status).toBe("completed");
    expect(record.result).toBe("resumed");
    expect(record.taskSnapshot).toEqual(snapshot);
    expect(sessionHolder?.current).toBeUndefined();
    expect(readFileSync(join(snapshot.checkout, "resumed.txt"), "utf8")).toBe("resumed");
    expect(JSON.stringify(record.taskSnapshot)).not.toContain("token");
  });

  it("retains file/tombstone snapshot and reopens only that existing task", async () => {
    const f = fixture();
    const snapshot = await f.bind();
    const file = join(f.directory, "session.jsonl");
    writeFileSync(file, "fixture session");
    vi.mocked(runAgent).mockImplementationOnce(async (_ctx, _type, _prompt, options) => {
      const session = { dispose() {}, sessionManager: { getSessionFile: () => file } } as unknown as AgentSession;
      options.onSessionCreated?.(session);
      return { responseText: "first", session, aborted: false, steered: false };
    });
    const { record } = await f.manager.spawnAndWait(f.pi, f.ctx, "fixture", "first", { description: "first" });
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(Date.now() + 11 * 60_000);
    try { (f.manager as unknown as { cleanup(): void }).cleanup(); } finally { vi.useRealTimers(); }
    const tombstone = f.manager.listTombstones()[0];
    expect(tombstone.taskSnapshot).toEqual(snapshot);
    expect(tombstone.sessionFile).toBe(file);
    await f.bind("task-B");
    const reopened = await f.manager.spawnAndWait(f.pi, f.ctx, "fixture", "reopen", {
      description: "reopen", taskSnapshot: tombstone.taskSnapshot, resumeSessionFile: file, reclaim: { handle: record.handle! },
    });
    expect(reopened.record.taskSnapshot).toEqual(snapshot);
    expect(vi.mocked(runAgent).mock.lastCall?.[3].resumeSessionFile).toBe(file);
  });

  it("queued and already-aborted cancellation acquire no claims", async () => {
    const f = fixture(1);
    await f.bind();
    const claims = vi.spyOn(TaskAuthority.prototype, "claim");
    const hold = latch();
    vi.mocked(runAgent).mockImplementationOnce(async (_ctx, _type, _prompt, options) => {
      options.signal?.addEventListener("abort", hold.release, { once: true });
      await hold.promise;
      return { responseText: "held", session: { dispose() {} } as AgentSession, aborted: false, steered: false };
    });
    const held = f.manager.spawn(f.pi, f.ctx, "fixture", "held", { description: "held", isBackground: true });
    await f.manager.awaitStartup(held);
    const queued = f.manager.spawn(f.pi, f.ctx, "fixture", "queued", { description: "queued", isBackground: true });
    f.manager.abort(queued);
    const controller = new AbortController(); controller.abort();
    f.manager.spawn(f.pi, f.ctx, "fixture", "aborted", { description: "aborted", signal: controller.signal });
    expect(claims).toHaveBeenCalledTimes(1);
    hold.release();
    await f.manager.waitForAll();
    expect(runAgent).toHaveBeenCalledTimes(1);
  });

  it("a stopped acquisition settles without launching and returns its pool slot", async () => {
    const f = fixture(1);
    await f.bind();
    const ready = latch();
    const original = TaskAuthority.prototype.claim;
    vi.spyOn(TaskAuthority.prototype, "claim").mockImplementationOnce(async function(...args) {
      const record = await original.apply(this, args);
      await ready.promise;
      return record;
    });
    const id = f.manager.spawn(f.pi, f.ctx, "fixture", "acquiring", { description: "acquiring", isBackground: true });
    f.manager.abort(id);
    const queued = f.manager.spawn(f.pi, f.ctx, "fixture", "after", { description: "after", isBackground: true });
    ready.release();
    await f.manager.waitForAll();
    expect(runAgent).toHaveBeenCalledTimes(1);
    expect(f.manager.getRecord(id)?.status).toBe("stopped");
    expect(f.manager.getRecord(queued)?.status).toBe("completed");
  });

  it("holds ownership through delayed settlement hook and protects GC/wait/dispose from display status", async () => {
    const f = fixture();
    const snapshot = await f.bind();
    const gate = latch();
    let isEntered = false;
    const id = f.manager.spawn(f.pi, f.ctx, "fixture", "gate", {
      description: "gate", isBackground: true,
      onBeforeTaskSettlement: async (claim, record) => {
        expect(record.result).toBe("worker result");
        expect(claim.snapshot.checkout).toBe(snapshot.checkout);
        isEntered = true;
        await gate.promise;
      },
    });
    await vi.waitFor(() => expect(isEntered).toBe(true));
    const competitor = new TaskAuthority({ binary, storage: f.storage });
    try {
      await expect(competitor.claim({ repository: f.repository, task_id: "task-A", generation: 1 }, "write", "competitor")).rejects.toThrow("TaskBusy");
    } finally { await competitor.close(); }
    f.manager.abort(id);
    f.manager.clearCompleted();
    expect(f.manager.getRecord(id)).toBeDefined();
    let isWaitDone = false;
    const wait = f.manager.waitForAll().then(() => { isWaitDone = true; });
    let isDisposed = false;
    const dispose = f.manager.dispose().then(() => { isDisposed = true; });
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(isWaitDone).toBe(false);
    expect(isDisposed).toBe(false);
    gate.release();
    await wait; await dispose;
    expect(isWaitDone).toBe(true);
    expect(isDisposed).toBe(true);
  });

  it("surfaces hook and actual release errors without overwriting worker prose", async () => {
    const f = fixture();
    await f.bind();
    const id = f.manager.spawn(f.pi, f.ctx, "fixture", "hook", {
      description: "hook", onBeforeTaskSettlement: async () => { throw new Error("gate failure"); },
    });
    const record = f.manager.getRecord(id)!;
    await expect(record.promise).rejects.toThrow("gate failure");
    expect(record.result).toBe("worker result");
    expect(record.taskSettlementError).toContain("gate failure");
    expect(record.status).toBe("error");
    const hookHolder = holders.get(record.session!)!;
    expect(hookHolder.recovery?.phases).toEqual(["hook"]);
    await f.manager.resume(id, "explicit verified retry", undefined, { onBeforeTaskSettlement: async () => {} });
    expect(record.taskSettlementError).toBeUndefined();
    expect(hookHolder.recovery).toBeUndefined();
    expect(record.status).toBe("completed");
    let descriptor: Awaited<ReturnType<typeof open>> | undefined;
    let holder!: TaskClaimHolder;
    let claimToken: string = "";
    const actual = await vi.importActual<typeof runnerModule>("../src/agent-runner.js");
    const faux = registerFauxProvider({ provider: "faux", models: [{ id: "faux-1", reasoning: true, contextWindow: 200_000 }] });
    const backend = fauxModelBackend(faux.getModel());
    backend.modelRegistry.runtime = backend.modelRuntime;
    Object.assign(f.ctx, { model: faux.getModel(), modelRegistry: backend.modelRegistry, getSystemPrompt: () => "fixture" });
    registerAgents(new Map([["fixture", { name: "fixture", description: "fixture", extensions: false, skills: false, persistSession: false, builtinToolNames: ["write", "edit", "bash"], systemPrompt: "fixture", promptMode: "replace" }]]));
    faux.setResponses([fauxAssistantMessage("worker result")]);
    vi.mocked(runAgent).mockImplementationOnce(async (ctx, type, prompt, options) => {
      holder = options.taskClaimHolder!;
      claimToken = holder.current!.token;
      const result = await actual.runAgent(ctx, type, prompt, options);
      descriptor = await open(join(holder.current!.snapshot.checkout, "source.txt"), "r");
      return result;
    });
    try {
      const released = f.manager.spawn(f.pi, f.ctx, "fixture", "release", { description: "release" });
      const failed = f.manager.getRecord(released)!;
      await expect(failed.promise).rejects.toThrow(/UnknownUse|RecoveryRequired/);
      expect(failed.result).toBe("worker result");
      expect(failed.status).toBe("error");
      expect(failed.taskSettlementError).toMatch(/UnknownUse|RecoveryRequired/);
      expect(holder.current).toBeUndefined();
      expect(holder.recovery).toEqual({ snapshot: failed.taskSnapshot, phases: ["release"], error: failed.taskSettlementError });
      expect(JSON.stringify(holder.recovery)).not.toContain(claimToken);
      expect(JSON.stringify(holder.recovery)).not.toContain('"token"');
      for (const name of ["write", "edit", "bash"]) {
        const call = fauxToolCall(name, {});
        await expect(failed.session!.agent.beforeToolCall!({ toolCall: call, args: {}, assistantMessage: fauxAssistantMessage(call), context: failed.session!.agent.state })).resolves.toMatchObject({ block: true, reason: "Task claim is not active" });
      }
      f.manager.clearCompleted();
      failed.completedAt = Date.now() - 11 * 60_000;
      (f.manager as unknown as { cleanup(): void }).cleanup();
      expect(f.manager.getRecord(released)).toBe(failed);
      const competitor = new TaskAuthority({ binary, storage: f.storage });
      try { await expect(competitor.claim({ repository: f.repository, task_id: "task-A", generation: 1 }, "write", "competitor")).rejects.toThrow(/UnknownUse|RecoveryRequired/); }
      finally { await competitor.close(); }
      await expect(f.manager.resume(released, "unverified retry")).rejects.toThrow(/UnknownUse|RecoveryRequired/);
      expect(holder.recovery?.snapshot).toEqual(failed.taskSnapshot);
      expect(failed.taskSettlementError).toMatch(/UnknownUse|RecoveryRequired/);
      await expect(f.manager.dispose()).rejects.toThrow(/UnknownUse|RecoveryRequired/);
      expect(f.manager.getRecord(released)).toBe(failed);
      expect(f.manager.getTaskBinding()).toEqual(failed.taskSnapshot);
      expect(holder.recovery?.snapshot).toEqual(failed.taskSnapshot);
      expect(readFileSync(join(failed.taskSnapshot!.checkout, "source.txt"), "utf8")).toBe("base A");
      expect(() => f.manager.spawn(f.pi, f.ctx, "fixture", "late", { description: "late" })).toThrow("disposing");
      // Reported once: a later wait has nothing new to surface.
      await expect(f.manager.waitForAll()).resolves.toBeUndefined();
      expect(f.manager.getRecord(released)).toBe(failed);
    } finally { await descriptor?.close(); faux.unregister(); }
    await expect(f.manager.dispose()).resolves.toBeUndefined();
    expect(f.manager.listAgents()).toEqual([]);
    expect(f.manager.getTaskBinding()).toBeUndefined();
  });

  it("awaits a held release rejection before shutdown and retains the failed record", async () => {
    const f = fixture();
    const snapshot = await f.bind();
    const gate = latch();
    let isEntered = false;
    vi.spyOn(TaskAuthority.prototype, "release").mockImplementationOnce(async () => {
      isEntered = true; await gate.promise; throw new Error("RecoveryRequired held release");
    });
    const id = f.manager.spawn(f.pi, f.ctx, "fixture", "held", { description: "held" });
    const record = f.manager.getRecord(id)!;
    await vi.waitFor(() => expect(isEntered).toBe(true));
    let isDone = false;
    const disposal = f.manager.dispose();
    const rejected = expect(disposal).rejects.toThrow("RecoveryRequired held release");
    void disposal.then(() => { isDone = true; }, () => { isDone = true; });
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(isDone).toBe(false);
    expect(f.manager.getRecord(id)).toBe(record);
    gate.release(); await rejected;
    expect(isDone).toBe(true);
    expect(f.manager.getRecord(id)).toBe(record);
    expect(f.manager.getTaskBinding()).toEqual(snapshot);
    await expect(record.promise).rejects.toThrow("RecoveryRequired held release");
  });

  it("reports an immediate pre-launch failure only to the caller while a queued one keeps onComplete", async () => {
    const onComplete = vi.fn();
    const f = fixture(1, binary, onComplete);
    await f.bind("task-B");
    await f.bind();
    const competitor = new TaskAuthority({ binary, storage: f.storage });
    const held = await competitor.claim({ repository: f.repository, task_id: "task-A", generation: 1 }, "write", "competitor");
    try {
      const immediate = f.manager.spawn(f.pi, f.ctx, "fixture", "busy", { description: "busy", isBackground: true });
      await expect(f.manager.awaitStartup(immediate)).rejects.toThrow("TaskBusy");
      expect(f.manager.getRecord(immediate)).toBeUndefined();
      expect(onComplete).not.toHaveBeenCalled();
      expect((f.manager as unknown as { startups: Map<string, unknown> }).startups.has(immediate)).toBe(false);
      const hold = latch();
      vi.mocked(runAgent).mockImplementationOnce(async (_ctx, _type, _prompt, options) => {
        options.signal?.addEventListener("abort", hold.release, { once: true });
        await hold.promise;
        return { responseText: "blocker", session: { dispose() {} } as AgentSession, aborted: false, steered: false };
      });
      const blocker = f.manager.spawn(f.pi, f.ctx, "fixture", "blocker", { description: "blocker", task_id: "task-B", isBackground: true });
      await f.manager.awaitStartup(blocker);
      const queued = f.manager.spawn(f.pi, f.ctx, "fixture", "queued", { description: "queued", isBackground: true });
      expect(f.manager.getRecord(queued)?.status).toBe("queued");
      hold.release();
      await f.manager.waitForAll().catch(() => {});
      expect(f.manager.getRecord(queued)).toMatchObject({ status: "error", error: expect.stringContaining("TaskBusy") });
      expect(onComplete.mock.calls.map(([record]) => [record.id, record.status])).toEqual([[blocker, "completed"], [queued, "error"]]);
      expect(runAgent).toHaveBeenCalledTimes(1);
    } finally {
      await competitor.release({ repository: f.repository, task_id: "task-A", generation: 1 }, held.token);
      await competitor.close();
    }
  });

  it("abort during settlement leaves a finished record's status alone and still awaits settlement", async () => {
    const f = fixture();
    await f.bind();
    const gate = latch();
    let isEntered = false;
    let settlementSignal: AbortSignal | undefined;
    const id = f.manager.spawn(f.pi, f.ctx, "fixture", "settling", {
      description: "settling", isBackground: true,
      onBeforeTaskSettlement: async (_claim, record) => { settlementSignal = record.abortController?.signal; isEntered = true; await gate.promise; },
    });
    await vi.waitFor(() => expect(isEntered).toBe(true));
    const record = f.manager.getRecord(id)!;
    expect(record.status).toBe("completed");
    expect(f.manager.abort(id)).toBe(false);
    expect(record.status).toBe("completed");
    expect(settlementSignal?.aborted).toBe(true);
    expect(f.manager.abortAll()).toBe(0);
    expect(record.status).toBe("completed");
    let isSettled = false;
    const settled = f.manager.waitForAll().then(() => { isSettled = true; });
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(isSettled).toBe(false);
    gate.release();
    await settled;
    await expect(record.promise).resolves.toBe("worker result");
    expect(record).toMatchObject({ status: "completed", result: "worker result" });
  });

  it("surfaces each retained settlement error once while keeping the record and its recovery descriptor", async () => {
    const f = fixture();
    const snapshot = await f.bind();
    const failing = (message: string) => f.manager.spawnAndWait(f.pi, f.ctx, "fixture", message, {
      description: message, onBeforeTaskSettlement: async () => { throw new Error(message); },
    });
    await expect(failing("first boom")).rejects.toThrow("first boom");
    const first = f.manager.listAgents()[0];
    const holder = holders.get(first.session!)!;
    expect(holder.recovery).toEqual({ snapshot: first.taskSnapshot, phases: ["hook"], error: first.taskSettlementError });
    await expect(f.manager.waitForAll()).rejects.toThrow("first boom");
    await expect(f.manager.waitForAll()).resolves.toBeUndefined();
    f.manager.clearCompleted();
    first.completedAt = Date.now() - 11 * 60_000;
    (f.manager as unknown as { cleanup(): void }).cleanup();
    expect(f.manager.getRecord(first.id)).toBe(first);
    expect(first.taskSettlementError).toContain("first boom");
    expect(holder.recovery?.error).toBe(first.taskSettlementError);
    await expect(failing("second boom")).rejects.toThrow("second boom");
    const second = await f.manager.waitForAll().then(() => undefined, (error: Error) => error.message);
    expect(second).toContain("second boom");
    expect(second).not.toContain("first boom");
    await expect(failing("resumed boom")).rejects.toThrow("resumed boom");
    const resumed = f.manager.listAgents().find(record => record.description === "resumed boom")!;
    await f.manager.resume(resumed.id, "verified retry", undefined, { onBeforeTaskSettlement: async () => {} });
    expect(resumed.taskSettlementError).toBeUndefined();
    await expect(f.manager.waitForAll()).resolves.toBeUndefined();
    await expect(failing("third boom")).rejects.toThrow("third boom");
    await expect(f.manager.dispose()).rejects.toThrow("third boom");
    expect(f.manager.listAgents()).toHaveLength(4);
    expect(f.manager.getTaskBinding()).toEqual(snapshot);
    await expect(f.manager.dispose()).resolves.toBeUndefined();
    expect(f.manager.listAgents()).toEqual([]);
    expect(f.manager.getTaskBinding()).toBeUndefined();
  });

  it("refuses a legacy resume without recorded task snapshot", async () => {
    const f = fixture();
    await f.bind();
    const { id, record } = await f.manager.spawnAndWait(f.pi, f.ctx, "fixture", "first", { description: "first" });
    record.taskSnapshot = undefined;
    await expect(f.manager.resume(id, "legacy")).rejects.toThrow(/snapshot|binding/);
    expect(resumeAgent).not.toHaveBeenCalled();
  });
});
