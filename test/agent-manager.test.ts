import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentManager } from "../src/agent-manager.js";
import * as taskRuntime from "../src/task-worktree.js";
import type { AgentRecord } from "../src/types.js";

vi.mock("../src/task-worktree.js", async importOriginal => {
  const actual = await importOriginal<typeof taskRuntime>();
  return { ...actual, TaskAuthority: class {
    private record?: taskRuntime.TaskRecord;
    async claim(identity: taskRuntime.TaskIdentity, access: taskRuntime.TaskAccess) {
      this.record = { version: 1, repository_id: "fixture-repository", task_id: identity.task_id, generation: identity.generation,
        checkout: identity.repository, branch: "fixture", base_oid: "a".repeat(40), head_oid: "a".repeat(40),
        private_git_dir: "/tmp/fixture-git", checkout_dev: 1, checkout_ino: 1, private_dev: 1, private_ino: 1,
        state: "open", scratch: "/tmp/fixture-scratch", evidence: "/tmp/fixture-evidence", preservation: null, disposable_targets: [], token: "fixture-token", access };
      return this.record;
    }
    async verify() { return this.record; }
    async release() {}
    async close() {}
  } };
});

function fixtureManager(...args: ConstructorParameters<typeof AgentManager>): AgentManager {
  const manager = new AgentManager(...args);
  const spawn = manager.spawn.bind(manager);
  manager.spawn = (pi, ctx, type, prompt, options) => spawn(pi, ctx, type, prompt, { task_id: "explicit-manager-fixture", ...options });
  return manager;
}

vi.mock("../src/agent-runner.js", () => ({
  runAgent: vi.fn(),
  resumeAgent: vi.fn(),
}));

import { resumeAgent, runAgent } from "../src/agent-runner.js";
import { addUsage } from "../src/usage.js";

const mockPi = {} as any;
const mockCtx = { cwd: "/tmp" } as any;

const mockSession = () => ({ dispose: vi.fn() } as any);

const resolvedRun = () =>
  vi.mocked(runAgent).mockResolvedValue({
    responseText: "done",
    session: mockSession(),
    aborted: false,
    steered: false,
  });

describe("AgentManager — Bug 1 race condition (resultConsumed vs onComplete)", () => {
  let manager: AgentManager;

  afterEach(() => {
    manager?.dispose();
  });

  it("reproduces bug: onComplete fires with resultConsumed=false when set after await", async () => {
    let seenConsumed: boolean | undefined;
    manager = fixtureManager((r) => {
      seenConsumed = r.resultConsumed;
    });
    resolvedRun();

    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      isBackground: true,
    });
    const record = manager.getRecord(id)!;

    // Simulate the buggy get_subagent_result: await THEN mark consumed
    await record.promise;
    record.resultConsumed = true; // too late — onComplete already fired

    // onComplete saw resultConsumed as falsy (undefined) — would queue a notification (the bug)
    expect(seenConsumed).toBeFalsy();
  });

  it("fix: onComplete sees resultConsumed=true when pre-marked before await", async () => {
    let seenConsumed: boolean | undefined;
    manager = fixtureManager((r) => {
      seenConsumed = r.resultConsumed;
    });
    resolvedRun();

    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      isBackground: true,
    });
    const record = manager.getRecord(id)!;

    // The fix: pre-mark BEFORE awaiting
    record.resultConsumed = true;
    await record.promise;

    expect(seenConsumed).toBe(true);
  });

  it("normal case: onComplete fires with resultConsumed falsy when no explicit polling", async () => {
    let completedRecord: AgentRecord | undefined;
    manager = fixtureManager((r) => {
      completedRecord = r;
    });
    resolvedRun();

    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      isBackground: true,
    });
    await manager.getRecord(id)!.promise;

    expect(completedRecord).toBeDefined();
    expect(completedRecord!.resultConsumed).toBeFalsy();
  });

  it("onComplete IS called for foreground agents (lifecycle symmetry)", async () => {
    let completedRecord: AgentRecord | undefined;
    manager = fixtureManager((r) => {
      completedRecord = r;
    });
    resolvedRun();

    const { record } = await manager.spawnAndWait(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
    });

    expect(completedRecord).toBeDefined();
    expect(completedRecord!.status).toBe("completed");
    // resultConsumed is set by spawnAndWait so onComplete skips notifications
    expect(completedRecord!.resultConsumed).toBe(true);
    expect(record).toBe(completedRecord);
  });
});

describe("AgentManager — spawnAndWait onSpawned + foreground output file wiring (#105)", () => {
  let manager: AgentManager;
  afterEach(() => { void manager?.dispose(); });

  it("fields set on the record in onSpawned are visible when onSessionCreated fires", async () => {
    // The load-bearing ordering guarantee: onSpawned fires synchronously inside
    // spawn(), before runAgent's async onSessionCreated fires. index.ts relies on
    // this to set record.outputFile so streamToOutputFile can pick it up.
    manager = fixtureManager();
    let capturedId: string | undefined;
    let outputFileSeenAtSessionCreated: string | undefined;

    vi.mocked(runAgent).mockImplementation(async (_ctx, _type, _prompt, opts: any) => {
      const session = mockSession();
      // Yield one microtask to mirror real behavior: in production, onSessionCreated
      // fires async (after network/session setup). onSpawned fires synchronously
      // inside spawn() before runAgent's promise even starts. This await lets the
      // remainder of startAgent (record.promise = …, onSpawned?.()) finish first.
      await Promise.resolve();
      opts.onSessionCreated?.(session);
      outputFileSeenAtSessionCreated = capturedId
        ? manager.getRecord(capturedId)?.outputFile
        : undefined;
      return { responseText: "done", session, aborted: false, steered: false };
    });

    await manager.spawnAndWait(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
    }, (fgId) => {
      capturedId = fgId;
      manager.getRecord(fgId)!.outputFile = "/fake/agent.jsonl";
    });

    expect(outputFileSeenAtSessionCreated).toBe("/fake/agent.jsonl");
  });

  it("onSpawned id matches the id returned by spawnAndWait", async () => {
    manager = fixtureManager();
    let spawnedId: string | undefined;
    resolvedRun();

    const { id } = await manager.spawnAndWait(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
    }, (fgId) => { spawnedId = fgId; });

    expect(spawnedId).toBe(id);
  });

  it("restores the shared onSpawned callback before awaiting the foreground run", async () => {
    manager = fixtureManager();
    let finishFirst: ((value: any) => void) | undefined;
    vi.mocked(runAgent)
      .mockImplementationOnce(() => new Promise(resolve => { finishFirst = resolve; }))
      .mockResolvedValueOnce({
        responseText: "second",
        session: mockSession(),
        aborted: false,
        steered: false,
      });
    const firstCallback = vi.fn();

    const first = manager.spawnAndWait(mockPi, mockCtx, "general-purpose", "first", {
      description: "first",
    }, firstCallback);
    const secondId = manager.spawn(mockPi, mockCtx, "general-purpose", "second", {
      description: "second",
      isBackground: true,
    });

    await vi.waitFor(() => expect(firstCallback).toHaveBeenCalledTimes(1));
    await manager.getRecord(secondId)!.promise;
    finishFirst?.({
      responseText: "first",
      session: mockSession(),
      aborted: false,
      steered: false,
    });
    await first;
  });

  it("onComplete fires on the error path with resultConsumed=true", async () => {
    // The .then path is covered by the lifecycle-symmetry test above; this guards
    // the .catch path which lacks try/catch around onComplete (a known asymmetry).
    let completedRecord: AgentRecord | undefined;
    manager = fixtureManager((r) => { completedRecord = r; });
    vi.mocked(runAgent).mockRejectedValue(new Error("agent failed"));

    const { record } = await manager.spawnAndWait(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
    });

    expect(completedRecord).toBeDefined();
    expect(completedRecord!.status).toBe("error");
    expect(completedRecord!.resultConsumed).toBe(true);
    expect(record).toBe(completedRecord);
  });
});

describe("AgentManager — nested runtime propagation", () => {
  let manager: AgentManager;

  afterEach(() => { void manager?.dispose(); });

  it("stores nesting metadata and passes the owning manager/runtime to runAgent", async () => {
    resolvedRun();
    manager = fixtureManager();
    const id = manager.spawn(mockPi, mockCtx, "scout", "nested", {
      description: "nested",
      isBackground: true,
      depth: 2,
      parentAgentId: "parent-1",
      maxSubagentDepth: 3,
      configCwd: "/tmp",
    });
    await manager.getRecord(id)!.promise;

    expect(manager.getRecord(id)).toEqual(expect.objectContaining({
      depth: 2,
      parentAgentId: "parent-1",
      maxSubagentDepth: 3,
    }));
    expect(runAgent).toHaveBeenLastCalledWith(
      mockCtx,
      "scout",
      "nested",
      expect.objectContaining({
        configCwd: "/tmp",
        nestedRuntime: {
          manager,
          parentAgentId: id,
          depth: 2,
          maxSubagentDepth: 3,
        },
      }),
    );
  });

  it("tells the runner which spawns are nested, so only top-level ones persist", async () => {
    // `rememberAgents` exists so `@handle` can reopen a conversation. A nested
    // child never gets a handle, so persisting it writes a session file nothing
    // can ever reach — the runner needs the fact to decline.
    resolvedRun();
    manager = fixtureManager();
    const child = manager.spawn(mockPi, mockCtx, "scout", "child", {
      description: "child", isBackground: true, depth: 2, parentAgentId: "parent-1",
    });
    await manager.getRecord(child)!.promise;
    expect(runAgent).toHaveBeenLastCalledWith(
      mockCtx, "scout", "child", expect.objectContaining({ nested: true }),
    );

    const top = manager.spawn(mockPi, mockCtx, "scout", "top", { description: "top", isBackground: true });
    await manager.getRecord(top)!.promise;
    expect(runAgent).toHaveBeenLastCalledWith(
      mockCtx, "scout", "top", expect.objectContaining({ nested: false }),
    );
  });

  it("defaults top-level subagents to depth one", async () => {
    resolvedRun();
    manager = fixtureManager();
    const id = manager.spawn(mockPi, mockCtx, "scout", "top", {
      description: "top",
      isBackground: true,
    });
    await manager.getRecord(id)!.promise;

    expect(manager.getRecord(id)?.depth).toBe(1);
    expect(vi.mocked(runAgent).mock.lastCall?.[3].nestedRuntime).toEqual(expect.objectContaining({
      parentAgentId: id,
      depth: 1,
    }));
  });

  it("starts a nested background child even when the concurrency pool is full", async () => {
    // A parent holding the only slot and waiting on its own child would
    // otherwise deadlock: the child can never be drained from the queue.
    vi.mocked(runAgent).mockImplementation(() => new Promise(() => {}));
    manager = fixtureManager(undefined, 1);

    const parentId = manager.spawn(mockPi, mockCtx, "general-purpose", "parent", {
      description: "parent",
      isBackground: true,
    });
    const childId = manager.spawn(mockPi, mockCtx, "scout", "child", {
      description: "child",
      isBackground: true,
      depth: 2,
      parentAgentId: parentId,
    });
    // A second top-level background agent still queues — the pool is untouched.
    const siblingId = manager.spawn(mockPi, mockCtx, "general-purpose", "sibling", {
      description: "sibling",
      isBackground: true,
    });

    expect(manager.getRecord(childId)?.status).toBe("running");
    expect(manager.getRecord(siblingId)?.status).toBe("queued");
  });

  it("starts a workflow's children regardless of the concurrency pool", async () => {
    // A workflow bounds its own fan-out. Routing its agents through the session
    // pool as well would let one run fill it and starve everything else — and
    // the run itself is not in the pool to be drained behind them.
    vi.mocked(runAgent).mockImplementation(() => new Promise(() => {}));
    manager = fixtureManager(undefined, 1);

    const holder = manager.spawn(mockPi, mockCtx, "general-purpose", "holder", {
      description: "holder",
      isBackground: true,
    });
    const childId = manager.spawn(mockPi, mockCtx, "scout", "child", {
      description: "child",
      isBackground: true,
      workflowId: "wf_run1",
    });
    // A second top-level background agent still queues — the pool is untouched.
    const siblingId = manager.spawn(mockPi, mockCtx, "general-purpose", "sibling", {
      description: "sibling",
      isBackground: true,
    });

    expect(manager.getRecord(holder)?.status).toBe("running");
    expect(manager.getRecord(childId)?.status).toBe("running");
    expect(manager.getRecord(siblingId)?.status).toBe("queued");
  });

  it("gives a workflow's child no handle, so nothing can address it", async () => {
    manager = fixtureManager();
    // Same reasoning as a nested child: it is filtered out of every top-level
    // surface, so a handle would name something unreachable and consume a name
    // a visible agent could have taken.
    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "child", {
      description: "child",
      workflowId: "wf_run1",
    });
    expect(manager.getRecord(id)?.handle).toBeUndefined();

    const visible = manager.spawn(mockPi, mockCtx, "general-purpose", "mine", { description: "mine" });
    expect(manager.getRecord(visible)?.handle).toBe("general-purpose");
  });

  it("aborts owned children when the parent settles", async () => {
    let finishParent: ((value: any) => void) | undefined;
    // Children settle on abort, as a real run does when its signal fires.
    const abortable = (_ctx: any, _type: any, _prompt: any, opts: any) =>
      new Promise<any>(resolve => {
        opts.signal?.addEventListener("abort", () =>
          resolve({ responseText: "", session: mockSession(), aborted: true, steered: false }),
        );
      });
    vi.mocked(runAgent)
      .mockImplementationOnce(() => new Promise(resolve => { finishParent = resolve; }))
      .mockImplementation(abortable as any);
    manager = fixtureManager();

    const parentId = manager.spawn(mockPi, mockCtx, "general-purpose", "parent", {
      description: "parent",
      isBackground: true,
    });
    const runningChild = manager.spawn(mockPi, mockCtx, "scout", "child", {
      description: "child",
      isBackground: true,
      depth: 2,
      parentAgentId: parentId,
    });
    const grandchild = manager.spawn(mockPi, mockCtx, "scout", "grandchild", {
      description: "grandchild",
      isBackground: true,
      depth: 3,
      parentAgentId: runningChild,
    });

    await manager.awaitStartup(parentId);
    await manager.awaitStartup(runningChild);
    await manager.awaitStartup(grandchild);
    finishParent?.({ responseText: "done", session: mockSession(), aborted: false, steered: false });
    await manager.getRecord(parentId)!.promise;

    expect(manager.getRecord(runningChild)?.status).toBe("stopped");
    // The child's own settle path stops the generation below it.
    await manager.getRecord(runningChild)!.promise;
    expect(manager.getRecord(grandchild)?.status).toBe("stopped");
  });

  it("aborts children spawned during a resumed turn", async () => {
    // The spawn settle path already ran, so only resume() can stop what the
    // resumed turn launched — otherwise the child runs on, invisible.
    vi.mocked(runAgent).mockResolvedValue({
      responseText: "done",
      session: mockSession(),
      aborted: false,
      steered: false,
    });
    manager = fixtureManager();

    const parentId = manager.spawn(mockPi, mockCtx, "general-purpose", "parent", {
      description: "parent",
      isBackground: true,
    });
    await manager.getRecord(parentId)!.promise;

    let childId = "";
    vi.mocked(resumeAgent).mockImplementation(async () => {
      vi.mocked(runAgent).mockImplementation(() => new Promise(() => {}));
      childId = manager.spawn(mockPi, mockCtx, "scout", "child", {
        description: "child",
        isBackground: true,
        depth: 2,
        parentAgentId: parentId,
      });
      return { text: "resumed" } as any;
    });

    await manager.resume(parentId, "keep going");

    expect(manager.getRecord(childId)?.status).toBe("stopped");
  });
});

describe("AgentManager — completion callbacks", () => {
  let manager: AgentManager;

  afterEach(() => {
    manager?.dispose();
  });

  it("does not let onComplete errors turn a completed agent into a failed run", async () => {
    manager = fixtureManager(() => {
      throw new Error("stale extension context");
    });
    resolvedRun();

    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      isBackground: true,
    });
    await expect(manager.getRecord(id)!.promise).resolves.toBe("done");

    expect(manager.getRecord(id)!.status).toBe("completed");
  });
});

describe("AgentManager — cleanup timer", () => {
  let manager: AgentManager;

  afterEach(() => {
    manager?.dispose();
  });

  it("does not keep the process alive on its own", async () => {
    manager = fixtureManager();

    expect((manager as any).cleanupInterval.hasRef()).toBe(false);
  });
});

describe("AgentManager — Bug 3 clearCompleted", () => {
  let manager: AgentManager;

  afterEach(() => {
    manager?.dispose();
  });

  it("clearCompleted removes completed records", async () => {
    manager = fixtureManager();
    resolvedRun();

    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      isBackground: true,
    });
    await manager.getRecord(id)!.promise;

    expect(manager.listAgents()).toHaveLength(1);
    manager.clearCompleted();
    expect(manager.listAgents()).toHaveLength(0);
  });

  it("clearCompleted does not remove running or queued agents", async () => {
    // Use maxConcurrent=0 to keep agents queued, then spawn one running via foreground
    manager = fixtureManager(undefined, 1);

    // Mock runAgent to never resolve (keeps agent "running")
    vi.mocked(runAgent).mockImplementation(
      () => new Promise(() => {}), // hangs forever
    );

    const id1 = manager.spawn(mockPi, mockCtx, "general-purpose", "test1", {
      description: "running agent",
      isBackground: true,
    });
    // Second agent should be queued (limit=1)
    const id2 = manager.spawn(mockPi, mockCtx, "general-purpose", "test2", {
      description: "queued agent",
      isBackground: true,
    });

    expect(manager.getRecord(id1)!.status).toBe("running");
    expect(manager.getRecord(id2)!.status).toBe("queued");

    manager.clearCompleted();

    // Both should still be present
    expect(manager.getRecord(id1)).toBeDefined();
    expect(manager.getRecord(id2)).toBeDefined();

    // Abort to allow cleanup
    manager.abort(id1);
    manager.abort(id2);
  });

  it("clearCompleted calls dispose on sessions of removed records", async () => {
    manager = fixtureManager();
    const disposeSpy = vi.fn();
    const sess = { dispose: disposeSpy };
    vi.mocked(runAgent).mockResolvedValue({
      responseText: "done",
      session: sess as any,
      aborted: false,
      steered: false,
    });

    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      isBackground: true,
    });
    await manager.getRecord(id)!.promise;

    manager.clearCompleted();

    expect(disposeSpy).toHaveBeenCalledOnce();
  });

  it("clearCompleted removes error and stopped records", async () => {
    manager = fixtureManager();
    vi.mocked(runAgent).mockRejectedValue(new Error("boom"));

    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      isBackground: true,
    });
    await manager.getRecord(id)!.promise;
    expect(manager.getRecord(id)!.status).toBe("error");

    manager.clearCompleted();
    expect(manager.getRecord(id)).toBeUndefined();
  });

  it("clearCompleted(true) preserves completed records with resultConsumed=false", async () => {
    manager = fixtureManager();
    resolvedRun();

    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      isBackground: true,
    });
    await manager.getRecord(id)!.promise;
    expect(manager.getRecord(id)!.status).toBe("completed");
    expect(manager.getRecord(id)!.resultConsumed).toBeFalsy();

    manager.clearCompleted(true);
    expect(manager.getRecord(id)).toBeDefined();
  });

  it("clearCompleted(true) removes completed records with resultConsumed=true", async () => {
    manager = fixtureManager();
    resolvedRun();

    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      isBackground: true,
    });
    const record = manager.getRecord(id)!;
    await record.promise;
    record.resultConsumed = true;

    manager.clearCompleted(true);
    expect(manager.getRecord(id)).toBeUndefined();
  });

  it("clearCompleted(true) still removes running=false queued=false records when resultConsumed=false for error status", async () => {
    manager = fixtureManager();
    vi.mocked(runAgent).mockRejectedValue(new Error("boom"));

    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      isBackground: true,
    });
    await manager.getRecord(id)!.promise;
    expect(manager.getRecord(id)!.status).toBe("error");
    expect(manager.getRecord(id)!.resultConsumed).toBeFalsy();

    // Error records with unread results are also preserved — the LLM should
    // be able to read the error message via get_subagent_result before the
    // record is evicted.
    manager.clearCompleted(true);
    expect(manager.getRecord(id)).toBeDefined();
  });
});

// The manager-level usage hook is the ONE place every assistant message is seen
// exactly once, which is what parent-session accounting (#193) is built on.
// `record.lifetimeUsage` cannot serve: nested spend is deliberately double-booked
// into every ancestor so a hidden child shows up on a record a human can see.
describe("AgentManager — the usage hook fires once per assistant message", () => {
  let manager: AgentManager;

  afterEach(() => {
    manager?.dispose();
  });

  it("fires once per message, with the same delta the record accumulates", async () => {
    const seen: any[] = [];
    manager = fixtureManager(undefined, undefined, undefined, undefined, (r, u) => seen.push({ id: r.id, u }));
    vi.mocked(runAgent).mockImplementation(async (_ctx, _type, _prompt, opts: any) => {
      opts.onAssistantUsage?.({ input: 100, output: 50, cacheWrite: 10, cost: 0.01 });
      opts.onAssistantUsage?.({ input: 200, output: 80, cacheWrite: 20, cost: 0.02 });
      return { responseText: "done", session: mockSession(), aborted: false, steered: false };
    });

    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      isBackground: true,
    });
    await manager.getRecord(id)!.promise;

    expect(seen.map(s => s.u)).toEqual([
      { input: 100, output: 50, cacheWrite: 10, cost: 0.01 },
      { input: 200, output: 80, cacheWrite: 20, cost: 0.02 },
    ]);
    expect(seen.every(s => s.id === id)).toBe(true);
  });

  it("fires once for a nested child, even though its spend is booked to ancestors too", async () => {
    // Mimics `nested-tools.ts`: the caller's own onAssistantUsage walks the
    // ancestor chain. If the hook sat below that walk — or if accounting read
    // the records it writes — one child message would be billed twice.
    const seen: any[] = [];
    manager = fixtureManager(undefined, undefined, undefined, undefined, (_r, u) => seen.push(u));
    vi.mocked(runAgent).mockImplementation(async (_ctx, _type, _prompt, opts: any) => {
      opts.onAssistantUsage?.({ input: 10, output: 5, cacheWrite: 0, cost: 0.001 });
      return { responseText: "done", session: mockSession(), aborted: false, steered: false };
    });

    const parentId = manager.spawn(mockPi, mockCtx, "general-purpose", "parent", {
      description: "parent",
      isBackground: true,
    });
    await manager.getRecord(parentId)!.promise;
    seen.length = 0;

    const childId = manager.spawn(mockPi, mockCtx, "general-purpose", "child", {
      description: "child",
      isBackground: true,
      parentAgentId: parentId,
      onAssistantUsage: (u: any) => { addUsage(manager.getRecord(parentId)!.lifetimeUsage, u); },
    } as any);
    await manager.getRecord(childId)!.promise;

    expect(seen).toEqual([{ input: 10, output: 5, cacheWrite: 0, cost: 0.001 }]);
    // And here is why the hook has to exist: the parent's record now carries the
    // child's message on top of its own identical one, so anything that summed
    // records would bill this session for two messages when one was sent. The
    // double-booking stays — it is what makes a hidden child visible.
    expect(manager.getRecord(parentId)!.lifetimeUsage).toEqual({ input: 20, output: 10, cacheWrite: 0, cost: 0.002 });
  });
});

// Eager init removes the optional/required asymmetry that previously required
// `??=` defaults at the callback sites and `?? 0` / `?? 1` at the read sites.
describe("AgentManager — lifetime usage + compaction count are eagerly initialized", () => {
  let manager: AgentManager;

  afterEach(() => {
    manager?.dispose();
  });

  it("spawn initializes lifetimeUsage to zeros and compactionCount to 0", async () => {
    manager = fixtureManager();
    // Don't resolve the run — we just want to inspect the record at spawn time.
    vi.mocked(runAgent).mockImplementation(() => new Promise(() => {}));

    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      isBackground: true,
    });
    const record = manager.getRecord(id)!;

    expect(record.lifetimeUsage).toEqual({ input: 0, output: 0, cacheWrite: 0, cost: 0 });
    expect(record.compactionCount).toBe(0);

    manager.abort(id);
  });

  it("onAssistantUsage from runAgent accumulates into record.lifetimeUsage", async () => {
    manager = fixtureManager();

    // Capture the options passed to runAgent so we can drive callbacks
    let captured: any;
    vi.mocked(runAgent).mockImplementation(async (_ctx, _type, _prompt, opts: any) => {
      captured = opts;
      // Two assistant messages with usage
      opts.onAssistantUsage?.({ input: 100, output: 50, cacheWrite: 10, cost: 0.01 });
      opts.onAssistantUsage?.({ input: 200, output: 80, cacheWrite: 20, cost: 0.02 });
      return { responseText: "done", session: mockSession(), aborted: false, steered: false };
    });

    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      isBackground: true,
    });
    await manager.getRecord(id)!.promise;

    expect(captured).toBeDefined();
    expect(manager.getRecord(id)!.lifetimeUsage).toEqual({
      input: 300, output: 130, cacheWrite: 30, cost: 0.03,
    });
  });

  it("onCompaction from runAgent increments record.compactionCount", async () => {
    manager = fixtureManager();
    const compactSeen: any[] = [];

    vi.mocked(runAgent).mockImplementation(async (_ctx, _type, _prompt, opts: any) => {
      // Compaction fires while the agent is still running — the record passed to
      // onCompact should reflect the just-incremented count.
      opts.onCompaction?.({ reason: "threshold", tokensBefore: 12345 });
      opts.onCompaction?.({ reason: "manual", tokensBefore: 22222 });
      return { responseText: "done", session: mockSession(), aborted: false, steered: false };
    });

    manager = fixtureManager(undefined, undefined, undefined, (record, info) => {
      compactSeen.push({ count: record.compactionCount, reason: info.reason });
    });

    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      isBackground: true,
    });
    await manager.getRecord(id)!.promise;

    expect(compactSeen).toEqual([
      { count: 1, reason: "threshold" },
      { count: 2, reason: "manual" },
    ]);
    expect(manager.getRecord(id)!.compactionCount).toBe(2);
  });

  it("resume() also accumulates usage and increments compactions on the same record", async () => {
    manager = fixtureManager();

    // First, spawn with a session that resume can latch onto
    const session = { ...mockSession() };
    vi.mocked(runAgent).mockResolvedValue({
      responseText: "first",
      session: session as any,
      aborted: false,
      steered: false,
    });

    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      isBackground: true,
    });
    await manager.getRecord(id)!.promise;

    // Pre-resume: lifetimeUsage from spawn was zero (mock didn't call onAssistantUsage)
    expect(manager.getRecord(id)!.lifetimeUsage).toEqual({ input: 0, output: 0, cacheWrite: 0, cost: 0 });
    expect(manager.getRecord(id)!.compactionCount).toBe(0);

    // Now resume — drive callbacks via the mocked resumeAgent
    const { resumeAgent: resumeMock } = await import("../src/agent-runner.js");
    vi.mocked(resumeMock).mockImplementation(async (_session, _prompt, opts: any) => {
      opts.onAssistantUsage?.({ input: 70, output: 30, cacheWrite: 5, cost: 0.007 });
      opts.onCompaction?.({ reason: "overflow", tokensBefore: 999 });
      return { text: "second" };
    });

    await manager.resume(id, "more");

    expect(manager.getRecord(id)!.lifetimeUsage).toEqual({ input: 70, output: 30, cacheWrite: 5, cost: 0.007 });
    expect(manager.getRecord(id)!.compactionCount).toBe(1);
  });
});

// Regression: `isolation: "worktree"` MUST fail loud when the cwd can't host
// a worktree. The previous behavior silently fell back to the main tree and
// injected a warning into the LLM's prompt — invisible to the caller.
describe("AgentManager — mandatory claims replace legacy worktree isolation", () => {
  let manager: AgentManager;
  afterEach(() => { void manager?.dispose(); });

  it("awaitStartup rejects an unavailable task without launching a worker or retaining an orphan", async () => {
    resolvedRun();
    vi.mocked(runAgent).mockClear();
    vi.spyOn(taskRuntime.TaskAuthority.prototype, "claim").mockRejectedValueOnce(new Error("Task unavailable"));
    manager = fixtureManager();
    const id = manager.spawn(mockPi, mockCtx, "X", "go", { description: "go", isolation: "worktree" });
    await expect(manager.awaitStartup(id)).rejects.toThrow("Task unavailable");
    expect(manager.listAgents()).toEqual([]);
    expect(runAgent).not.toHaveBeenCalled();
  });

  it("foreground claim failure rejects spawnAndWait without a parent-directory fallback", async () => {
    resolvedRun();
    vi.mocked(runAgent).mockClear();
    vi.spyOn(taskRuntime.TaskAuthority.prototype, "claim").mockRejectedValueOnce(new Error("Task unavailable"));
    manager = fixtureManager();
    await expect(manager.spawnAndWait(mockPi, mockCtx, "X", "go", { description: "go" })).rejects.toThrow("Task unavailable");
    expect(runAgent).not.toHaveBeenCalled();
  });

  it("returns the charged slot when claim acquisition fails and drains the next worker", async () => {
    resolvedRun();
    vi.mocked(runAgent).mockClear();
    let release!: () => void;
    vi.spyOn(taskRuntime.TaskAuthority.prototype, "claim").mockImplementationOnce(() => new Promise((_resolve, reject) => { release = () => reject(new Error("Task unavailable")); }));
    manager = fixtureManager(undefined, 1);
    const first = manager.spawn(mockPi, mockCtx, "X", "first", { description: "first", isBackground: true });
    const next = manager.spawn(mockPi, mockCtx, "X", "next", { description: "next", isBackground: true });
    expect(manager.getRecord(next)?.status).toBe("queued");
    release();
    await expect(manager.awaitStartup(first)).rejects.toThrow("Task unavailable");
    await manager.getRecord(next)?.promise;
    expect(runAgent).toHaveBeenCalledTimes(1);
  });

  it("keeps structured payload separate from worker prose", async () => {
    vi.mocked(runAgent).mockResolvedValue({ responseText: "worker prose", session: mockSession(), aborted: false, steered: false, structuredJson: '{"answer":"42"}' });
    manager = fixtureManager();
    const { record } = await manager.spawnAndWait(mockPi, mockCtx, "X", "go", { description: "go", isolation: "worktree" });
    expect(JSON.parse(record.structuredJson!)).toEqual({ answer: "42" });
    expect(record.result).toBe("worker prose");
  });

  it("a stop during acquisition releases the claim without launching or cleaning a checkout", async () => {
    resolvedRun(); vi.mocked(runAgent).mockClear();
    const original = taskRuntime.TaskAuthority.prototype.claim;
    let release!: () => void;
    vi.spyOn(taskRuntime.TaskAuthority.prototype, "claim").mockImplementationOnce(async function(...args) {
      const record = await original.apply(this, args);
      await new Promise<void>(resolve => { release = resolve; });
      return record;
    });
    manager = fixtureManager();
    const id = manager.spawn(mockPi, mockCtx, "X", "go", { description: "go" });
    await vi.waitFor(() => expect(release).toBeTypeOf("function"));
    manager.abort(id); release();
    await manager.getRecord(id)?.promise;
    expect(runAgent).not.toHaveBeenCalled(); expect(manager.getRecord(id)?.status).toBe("stopped");
  });
});

describe("AgentManager — onBeforeTaskSettlement", () => {
  let manager: AgentManager;
  let disposalError: string | undefined;
  afterEach(async () => {
    try {
      if (disposalError) await expect(manager.dispose()).rejects.toThrow(disposalError);
      else await manager?.dispose();
    } finally { disposalError = undefined; vi.restoreAllMocks(); }
  });

  it("awaits the hook with the live claim before release", async () => {
    resolvedRun(); manager = fixtureManager();
    const order: string[] = [];
    vi.spyOn(taskRuntime.TaskAuthority.prototype, "release").mockImplementation(async () => { order.push("release"); });
    await manager.spawnAndWait(mockPi, mockCtx, "X", "go", { description: "go", onBeforeTaskSettlement: async (claim, record) => {
      expect(claim.snapshot.checkout).toBe("/tmp"); expect(record.result).toBe("done"); order.push("hook");
    } });
    expect(order).toEqual(["hook", "release"]);
  });

  it("surfaces hook failure while retaining worker text and still releasing ownership", async () => {
    disposalError = "gate failure";
    resolvedRun(); manager = fixtureManager();
    const release = vi.spyOn(taskRuntime.TaskAuthority.prototype, "release");
    const id = manager.spawn(mockPi, mockCtx, "X", "go", { description: "go", onBeforeTaskSettlement: async () => { throw new Error("gate failure"); } });
    const record = manager.getRecord(id)!;
    await expect(record.promise).rejects.toThrow("gate failure");
    expect(record.result).toBe("done"); expect(record.status).toBe("error"); expect(release).toHaveBeenCalledTimes(1);
  });

  it("runs settlement after a worker exception without losing its error", async () => {
    vi.mocked(runAgent).mockRejectedValue(new Error("worker failure")); manager = fixtureManager();
    const hook = vi.fn(async () => {});
    const { record } = await manager.spawnAndWait(mockPi, mockCtx, "X", "go", { description: "go", onBeforeTaskSettlement: hook });
    expect(hook).toHaveBeenCalledTimes(1); expect(record.error).toBe("worker failure");
  });

  it("never starts a settlement hook for a cancelled acquisition", async () => {
    resolvedRun(); manager = fixtureManager();
    const hook = vi.fn(async () => {});
    const controller = new AbortController(); controller.abort();
    const { record } = await manager.spawnAndWait(mockPi, mockCtx, "X", "go", { description: "go", signal: controller.signal, onBeforeTaskSettlement: hook });
    expect(record.status).toBe("stopped"); expect(hook).not.toHaveBeenCalled();
  });
});

describe("AgentManager — SpawnOptions.cwd passthrough (#96)", () => {
  let manager: AgentManager;
  afterEach(() => { void manager?.dispose(); });

  it("passes cwd to runAgent as the working dir, parent cwd as configCwd", async () => {
    resolvedRun();
    manager = fixtureManager();
    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      cwd: "/", // absolute and always exists
    });
    await manager.getRecord(id)!.promise;

    expect(runAgent).toHaveBeenCalledWith(
      mockCtx, "general-purpose", "test",
      expect.objectContaining({ cwd: "/", configCwd: "/tmp" }),
    );
  });

  it("without cwd, the parent cwd is both the task repository and the trusted config root", async () => {
    // mockClear + lastCall: toHaveBeenCalledWith would scan the file's whole
    // accumulated call history, where earlier no-cwd spawns already match.
    vi.mocked(runAgent).mockClear();
    resolvedRun();
    manager = fixtureManager();
    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
    });
    await manager.getRecord(id)!.promise;

    const opts = vi.mocked(runAgent).mock.lastCall![3];
    expect(opts.cwd).toBe(manager.getRecord(id)!.taskSnapshot!.checkout);
    expect(opts.configCwd).toBe("/tmp");
    expect(opts.taskClaimHolder).toBeDefined();
  });

  it("cwd: null (RPC 'unset') behaves exactly like omitting cwd", async () => {
    vi.mocked(runAgent).mockClear();
    resolvedRun();
    manager = fixtureManager();
    const omitted = manager.spawn(mockPi, mockCtx, "general-purpose", "test", { description: "test" });
    await manager.getRecord(omitted)!.promise;
    const omittedOpts = vi.mocked(runAgent).mock.lastCall![3];

    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      cwd: null as any,
    });
    await manager.getRecord(id)!.promise;

    const opts = vi.mocked(runAgent).mock.lastCall![3];
    expect(opts.cwd).toBe("/tmp");
    expect(opts.configCwd).toBe("/tmp");
    expect(manager.getRecord(id)!.taskSnapshot).toEqual(manager.getRecord(omitted)!.taskSnapshot);
    expect([opts.cwd, opts.configCwd, opts.worktreeBase]).toEqual([omittedOpts.cwd, omittedOpts.configCwd, omittedOpts.worktreeBase]);
  });

  it("cwd — the task is claimed FROM cwd and the session runs at its checkout", async () => {
    resolvedRun();

    manager = fixtureManager();
    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      cwd: "/",
    });
    await manager.awaitStartup(id);
    await manager.getRecord(id)!.promise;

    const snapshot = manager.getRecord(id)!.taskSnapshot!;
    expect(snapshot.repository).toBe("/");
    expect(runAgent).toHaveBeenCalledWith(
      mockCtx, "general-purpose", "test",
      expect.objectContaining({ cwd: snapshot.checkout, configCwd: "/tmp", worktreeBase: "/" }),
    );
  });

  it("plain spawn (no cwd) claims the parent cwd's task and names that repository as worktreeBase (#187)", async () => {
    vi.mocked(runAgent).mockClear();
    resolvedRun();

    manager = fixtureManager();
    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      isolation: "worktree",
    });
    await manager.awaitStartup(id);
    await manager.getRecord(id)!.promise;

    const opts = vi.mocked(runAgent).mock.lastCall![3];
    expect(opts.cwd).toBe(manager.getRecord(id)!.taskSnapshot!.checkout);
    expect(opts.configCwd).toBe("/tmp");
    expect(opts.worktreeBase).toBe("/tmp");
  });

  it("isolation: off cannot opt out of the task checkout; worktreeBase still names its repository", async () => {
    vi.mocked(runAgent).mockClear();
    resolvedRun();

    manager = fixtureManager();
    const id = manager.spawn(mockPi, mockCtx, "general-purpose", "test", { description: "test", isolation: "off" });
    await manager.getRecord(id)!.promise;

    const opts = vi.mocked(runAgent).mock.lastCall![3];
    expect(opts.worktreeBase).toBe("/tmp");
    expect(opts.cwd).toBe(manager.getRecord(id)!.taskSnapshot!.checkout);
  });

  it("passes `workflow` to the runner exactly when the spawn carries a workflowId", async () => {
    vi.mocked(runAgent).mockClear();
    resolvedRun();

    manager = fixtureManager();
    const owned = manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      workflowId: "wf_abc123",
    });
    await manager.getRecord(owned)!.promise;
    expect(vi.mocked(runAgent).mock.lastCall![3].workflow).toBe(true);

    const plain = manager.spawn(mockPi, mockCtx, "general-purpose", "test", { description: "test" });
    await manager.getRecord(plain)!.promise;
    expect(vi.mocked(runAgent).mock.lastCall![3].workflow).toBe(false);
  });

  it("relative cwd throws immediately; no orphan record", async () => {
    vi.mocked(runAgent).mockClear();
    manager = fixtureManager();
    expect(() => manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      cwd: "relative/path",
    })).toThrow(/absolute path/);
    expect(manager.listAgents()).toEqual([]);
    expect(runAgent).not.toHaveBeenCalled();
  });

  it("nonexistent cwd throws immediately; no orphan record", async () => {
    vi.mocked(runAgent).mockClear();
    manager = fixtureManager();
    expect(() => manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      cwd: "/nonexistent-pi-subagents-test-dir",
    })).toThrow(/does not exist/);
    expect(manager.listAgents()).toEqual([]);
    expect(runAgent).not.toHaveBeenCalled();
  });

  it("cwd pointing at a regular file throws a curated 'not a directory' error", async () => {
    vi.mocked(runAgent).mockClear();
    manager = fixtureManager();
    expect(() => manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      cwd: fileURLToPath(import.meta.url), // this test file: absolute, exists, not a directory
    })).toThrow(/not a directory/);
    expect(manager.listAgents()).toEqual([]);
    expect(runAgent).not.toHaveBeenCalled();
  });

  it("non-string cwd (RPC junk) throws the curated error, not a TypeError from path internals", async () => {
    vi.mocked(runAgent).mockClear();
    manager = fixtureManager();
    expect(() => manager.spawn(mockPi, mockCtx, "general-purpose", "test", {
      description: "test",
      cwd: 123 as any,
    })).toThrow(/must be an absolute path/);
    expect(manager.listAgents()).toEqual([]);
  });
});

describe("AgentManager — abort() state machine", () => {
  let manager: AgentManager;
  afterEach(() => { void manager?.dispose(); });

  it("returns false for an unknown id (no record, no side-effects)", async () => {
    manager = fixtureManager();
    expect(manager.abort("does-not-exist")).toBe(false);
  });

  it("removes a queued agent from the queue and marks it stopped", async () => {
    // Concurrency=1: the second background spawn queues behind the first
    manager = fixtureManager(undefined, 1);
    vi.mocked(runAgent).mockImplementation(() => new Promise(() => {}));

    manager.spawn(mockPi, mockCtx, "X", "blocker", { description: "block", isBackground: true });
    const queuedId = manager.spawn(mockPi, mockCtx, "Y", "queued", {
      description: "q",
      isBackground: true,
    });
    const queuedRecord = manager.getRecord(queuedId)!;
    expect(queuedRecord.status).toBe("queued");

    expect(manager.abort(queuedId)).toBe(true);
    expect(queuedRecord.status).toBe("stopped");
    expect(queuedRecord.completedAt).toBeGreaterThan(0);
    // Aborting again is a no-op — status is no longer "queued" or "running"
    expect(manager.abort(queuedId)).toBe(false);
  });

  it("aborts a running agent by firing its AbortController and setting status='stopped'", async () => {
    manager = fixtureManager();
    let receivedSignal: AbortSignal | undefined;
    vi.mocked(runAgent).mockImplementation((_ctx, _type, _prompt, opts) => {
      receivedSignal = (opts as { signal?: AbortSignal })?.signal;
      return new Promise(() => {});
    });

    const id = manager.spawn(mockPi, mockCtx, "X", "p", {
      description: "r",
      isBackground: true,
    });
    const record = manager.getRecord(id)!;
    expect(record.status).toBe("running");
    await manager.awaitStartup(id);
    expect(receivedSignal?.aborted).toBe(false);

    expect(manager.abort(id)).toBe(true);
    expect(record.status).toBe("stopped");
    expect(record.completedAt).toBeGreaterThan(0);
    expect(receivedSignal?.aborted).toBe(true);
  });

  it("returns false (and does not change status) for an already-completed agent", async () => {
    manager = fixtureManager();
    resolvedRun();
    const id = manager.spawn(mockPi, mockCtx, "X", "p", {
      description: "x",
      isBackground: false,
    });
    await manager.getRecord(id)?.promise;
    expect(manager.getRecord(id)?.status).toBe("completed");

    expect(manager.abort(id)).toBe(false);
    expect(manager.getRecord(id)?.status).toBe("completed");
  });

  it("a user abort survives the agent settling — stays 'stopped', never 'completed'", async () => {
    // Guards the `if (record.status !== "stopped")` check in the completion
    // handler: after a user abort, runAgent's promise still settles (here with
    // aborted:false, as a non-cooperative mock would), and must NOT flip the
    // user-stopped status back to "completed" — otherwise the parent agent
    // would read the partial output as a finished result.
    manager = fixtureManager();
    let resolveRun!: (v: unknown) => void;
    vi.mocked(runAgent).mockImplementation(() => new Promise((res) => { resolveRun = res as (v: unknown) => void; }));

    const id = manager.spawn(mockPi, mockCtx, "X", "p", { description: "r", isBackground: true });
    const record = manager.getRecord(id)!;
    expect(record.status).toBe("running");
    await manager.awaitStartup(id);

    expect(manager.abort(id)).toBe(true);
    expect(record.status).toBe("stopped");

    // The agent loop ends and the promise settles "normally".
    resolveRun({ responseText: "partial output", session: mockSession(), aborted: false, steered: false });
    await record.promise;

    expect(record.status).toBe("stopped");        // not overwritten to "completed"
    expect(record.result).toBe("partial output"); // partial result still captured
  });
});

// Regression for #44: ESC during a foreground Agent call must propagate to
// the child. Pi delivers parent abort via AbortSignal; the manager wires the
// signal's "abort" event to this.abort(id).
describe("AgentManager — steer()", () => {
  let manager: AgentManager;
  afterEach(() => { void manager?.dispose(); });

  it("returns false for an unknown id", async () => {
    manager = fixtureManager();
    expect(manager.steer("nope", "hi")).toBe(false);
  });

  it("delivers to a live session via session.steer()", async () => {
    manager = fixtureManager();
    const steer = vi.fn(() => Promise.resolve());
    let captured: ((s: any) => void) | undefined;
    vi.mocked(runAgent).mockImplementation((_ctx, _type, _prompt, opts) => {
      captured = (opts as any)?.onSessionCreated;
      return new Promise(() => {});
    });
    const id = manager.spawn(mockPi, mockCtx, "X", "p", { description: "r", isBackground: true });
    await manager.awaitStartup(id);
    captured?.({ steer, dispose: vi.fn() });

    expect(manager.steer(id, "go left")).toBe(true);
    expect(steer).toHaveBeenCalledWith("go left");
  });

  it("queues onto pendingSteers when the session isn't ready yet", async () => {
    manager = fixtureManager();
    vi.mocked(runAgent).mockImplementation(() => new Promise(() => {}));
    const id = manager.spawn(mockPi, mockCtx, "X", "p", { description: "r", isBackground: true });
    const record = manager.getRecord(id)!;
    record.session = undefined; // not ready

    expect(manager.steer(id, "first")).toBe(true);
    expect(manager.steer(id, "second")).toBe(true);
    expect(record.pendingSteers).toEqual(["first", "second"]);
  });

  it("refuses to steer an agent that is no longer running", async () => {
    manager = fixtureManager();
    resolvedRun();
    const id = manager.spawn(mockPi, mockCtx, "X", "p", { description: "x", isBackground: false });
    await manager.getRecord(id)?.promise;
    expect(manager.getRecord(id)?.status).toBe("completed");
    expect(manager.steer(id, "too late")).toBe(false);
  });
});

describe("AgentManager — parent abort signal forwarding (#44)", () => {
  let manager: AgentManager;
  afterEach(() => { void manager?.dispose(); });

  it("aborts the child when the parent signal aborts", async () => {
    manager = fixtureManager();
    vi.mocked(runAgent).mockImplementation(() => new Promise(() => {}));

    const parent = new AbortController();
    const id = manager.spawn(mockPi, mockCtx, "X", "p", {
      description: "x",
      isBackground: false,
      signal: parent.signal,
    });
    const record = manager.getRecord(id)!;
    expect(record.status).toBe("running");

    parent.abort();
    expect(record.status).toBe("stopped");
    expect(record.completedAt).toBeGreaterThan(0);
  });
});

describe("AgentManager — listAgents() ordering", () => {
  let manager: AgentManager;
  afterEach(() => { void manager?.dispose(); });

  it("returns records sorted by startedAt descending (most recent first)", async () => {
    manager = fixtureManager();
    resolvedRun();

    const a = manager.spawn(mockPi, mockCtx, "X", "1", { description: "a" });
    const b = manager.spawn(mockPi, mockCtx, "X", "2", { description: "b" });
    const c = manager.spawn(mockPi, mockCtx, "X", "3", { description: "c" });

    // Force deterministic startedAt — Date.now() can collide on fast runs
    manager.getRecord(a)!.startedAt = 100;
    manager.getRecord(b)!.startedAt = 200;
    manager.getRecord(c)!.startedAt = 300;

    expect(manager.listAgents().map((r) => r.id)).toEqual([c, b, a]);
  });
});

describe("AgentManager — abortAll", () => {
  let manager: AgentManager;
  afterEach(() => { void manager?.dispose(); });

  it("stops both queued and running agents and returns the total count", async () => {
    manager = fixtureManager(undefined, 1);
    vi.mocked(runAgent).mockImplementation(() => new Promise(() => {}));

    const running = manager.spawn(mockPi, mockCtx, "X", "r", {
      description: "r",
      isBackground: true,
    });
    const queued = manager.spawn(mockPi, mockCtx, "Y", "q", {
      description: "q",
      isBackground: true,
    });
    expect(manager.getRecord(running)?.status).toBe("running");
    expect(manager.getRecord(queued)?.status).toBe("queued");

    expect(manager.abortAll()).toBe(2);
    expect(manager.getRecord(running)?.status).toBe("stopped");
    expect(manager.getRecord(queued)?.status).toBe("stopped");
    await manager.waitForAll();
    expect(manager.hasRunning()).toBe(false);
  });

  it("returns 0 when there are no running or queued agents", async () => {
    manager = fixtureManager();
    expect(manager.abortAll()).toBe(0);
  });
});

describe("AgentManager — hasRunning", () => {
  let manager: AgentManager;
  afterEach(() => { void manager?.dispose(); });

  it("is true while a background agent is running, false after it completes", async () => {
    manager = fixtureManager();
    resolvedRun();

    expect(manager.hasRunning()).toBe(false);
    const id = manager.spawn(mockPi, mockCtx, "X", "p", {
      description: "x",
      isBackground: true,
    });
    expect(manager.hasRunning()).toBe(true);

    await manager.getRecord(id)?.promise;
    expect(manager.hasRunning()).toBe(false);
  });

  it("is true when an agent is queued behind the concurrency limit", async () => {
    manager = fixtureManager(undefined, 1);
    vi.mocked(runAgent).mockImplementation(() => new Promise(() => {}));

    manager.spawn(mockPi, mockCtx, "X", "r", { description: "r", isBackground: true });
    manager.spawn(mockPi, mockCtx, "Y", "q", { description: "q", isBackground: true });
    expect(manager.hasRunning()).toBe(true);
  });
});

describe("AgentManager — runAgent rejection leaves the record visible with error status", () => {
  let manager: AgentManager;
  afterEach(() => { void manager?.dispose(); });

  it("sets status='error', captures the error message, and stamps completedAt", async () => {
    manager = fixtureManager();
    vi.mocked(runAgent).mockRejectedValue(new Error("boom"));

    const id = manager.spawn(mockPi, mockCtx, "X", "p", {
      description: "x",
      isBackground: false,
    });
    const record = manager.getRecord(id)!;
    await record.promise;

    expect(record.status).toBe("error");
    expect(record.error).toBe("boom");
    expect(record.completedAt).toBeGreaterThan(0);
  });
});

// #144 — a run that RESOLVES with a failed final turn (pi never rejects on
// retry exhaustion) must map to status "error", not "completed".
describe("AgentManager — resolved runs with a failed final turn map to error (#144)", () => {
  let manager: AgentManager;
  afterEach(() => { void manager?.dispose(); });

  const failedRun = (failure: string, responseText = "") =>
    vi.mocked(runAgent).mockResolvedValue({
      responseText,
      session: mockSession(),
      aborted: false,
      steered: false,
      failure,
    } as any);

  it("sets status='error' and captures the provider message", async () => {
    manager = fixtureManager();
    failedRun("retries exhausted: 529 overloaded");

    const id = manager.spawn(mockPi, mockCtx, "X", "p", { description: "x", isBackground: true });
    const record = manager.getRecord(id)!;
    await record.promise;

    expect(record.status).toBe("error");
    expect(record.error).toBe("retries exhausted: 529 overloaded");
    expect(record.completedAt).toBeGreaterThan(0);
  });

  it("keeps earlier-turn text available as result context, but never as a clean completion", async () => {
    manager = fixtureManager();
    failedRun("provider died", "partial progress from an earlier turn");

    const id = manager.spawn(mockPi, mockCtx, "X", "p", { description: "x", isBackground: true });
    const record = manager.getRecord(id)!;
    await record.promise;

    expect(record.status).toBe("error");
    expect(record.result).toBe("partial progress from an earlier turn");
  });

  it("onComplete sees the error status (routes to subagents:failed in the host)", async () => {
    let completed: AgentRecord | undefined;
    manager = fixtureManager((r) => { completed = r; });
    failedRun("boom");

    const id = manager.spawn(mockPi, mockCtx, "X", "p", { description: "x", isBackground: true });
    await manager.getRecord(id)!.promise;

    expect(completed?.status).toBe("error");
  });

  it("an external stop still wins over a late failure resolution", async () => {
    manager = fixtureManager();
    let resolveRun: ((v: unknown) => void) | undefined;
    const session = mockSession();
    vi.mocked(runAgent).mockImplementation(() => new Promise((r) => { resolveRun = r; }));

    const id = manager.spawn(mockPi, mockCtx, "X", "p", { description: "x", isBackground: true });
    const record = manager.getRecord(id)!;
    await manager.awaitStartup(id);
    manager.abort(id);
    resolveRun!({ responseText: "", session, aborted: false, steered: false, failure: "late error" });
    await record.promise;

    expect(record.status).toBe("stopped");
    expect(record.error).toBeUndefined();
  });

  it("resume(): a failed final turn on the resumed prompt maps to error too", async () => {
    manager = fixtureManager();
    resolvedRun();
    const id = manager.spawn(mockPi, mockCtx, "X", "p", { description: "x", isBackground: true });
    const record = manager.getRecord(id)!;
    await record.promise;
    expect(record.status).toBe("completed");

    const { resumeAgent: resumeMock } = await import("../src/agent-runner.js");
    // resumeAgent bounds its fallback to this invocation, so a failed empty
    // resume yields text "" — never the prior turn's answer (#144 root-fix).
    vi.mocked(resumeMock).mockResolvedValue({
      text: "",
      failure: "retries exhausted on resume",
    });

    await manager.resume(id, "more");

    expect(record.status).toBe("error");
    expect(record.error).toBe("retries exhausted on resume");
    expect(record.result).toBe(""); // no stale prior answer
  });

  it("resume(): partial text produced before the failure is kept as result", async () => {
    manager = fixtureManager();
    resolvedRun();
    const id = manager.spawn(mockPi, mockCtx, "X", "p", { description: "x", isBackground: true });
    const record = manager.getRecord(id)!;
    await record.promise;

    const { resumeAgent: resumeMock } = await import("../src/agent-runner.js");
    vi.mocked(resumeMock).mockResolvedValue({
      text: "new partial progress",
      failure: "provider died mid-turn",
    });

    await manager.resume(id, "more");

    expect(record.status).toBe("error");
    expect(record.result).toBe("new partial progress"); // salvageable, this-run text
  });
});

// The pool counter is decremented when a background agent settles, but ONLY for
// records that took a slot in the first place. Nested children bypass the pool
// (occupiesPoolSlot), so decrementing on their behalf drives runningBackground
// negative and permanently lifts maxConcurrent. Only the START side of that rule
// had coverage.
describe("AgentManager — pool slot accounting on settle", () => {
  let manager: AgentManager;

  afterEach(() => { void manager?.dispose(); });

  /** A run that only settles when its returned resolver is called. */
  function controllableRuns() {
    const resolvers = new Map<string, (v: any) => void>();
    vi.mocked(runAgent).mockImplementation((_ctx: any, _type: any, prompt: any) =>
      new Promise<any>(resolve => {
        resolvers.set(prompt as string, () => resolve({
          responseText: "done",
          session: mockSession(),
          aborted: false,
          steered: false,
        }));
      }),
    );
    return resolvers;
  }

  it("a nested child settling does not free a pool slot it never held", async () => {
    const resolvers = controllableRuns();
    manager = fixtureManager(undefined, 1);

    const parentId = manager.spawn(mockPi, mockCtx, "general-purpose", "parent", {
      description: "parent", isBackground: true,
    });
    manager.spawn(mockPi, mockCtx, "scout", "child", {
      description: "child", isBackground: true, depth: 2, parentAgentId: parentId,
    });
    const siblingId = manager.spawn(mockPi, mockCtx, "general-purpose", "sibling", {
      description: "sibling", isBackground: true,
    });
    expect(manager.getRecord(siblingId)?.status).toBe("queued");

    await manager.awaitStartup(parentId);
    await manager.awaitStartup(manager.listAgents().find(a => a.description === "child")!.id);
    resolvers.get("child")!(undefined);
    await manager.getRecord(manager.listAgents().find(a => a.description === "child")!.id)?.promise;

    // The parent still holds the only slot, so the sibling must stay queued.
    expect(manager.getRecord(siblingId)?.status).toBe("queued");
  });

  it("a nested child failing does not free a pool slot either", async () => {
    const rejectors = new Map<string, (e: any) => void>();
    // Nothing resolves here — only the child is settled, by rejection.
    vi.mocked(runAgent).mockImplementation((_ctx: any, _type: any, prompt: any) =>
      new Promise<any>((_resolve, reject) => {
        rejectors.set(prompt as string, reject);
      }),
    );
    manager = fixtureManager(undefined, 1);

    const parentId = manager.spawn(mockPi, mockCtx, "general-purpose", "parent", {
      description: "parent", isBackground: true,
    });
    const childId = manager.spawn(mockPi, mockCtx, "scout", "child", {
      description: "child", isBackground: true, depth: 2, parentAgentId: parentId,
    });
    const siblingId = manager.spawn(mockPi, mockCtx, "general-purpose", "sibling", {
      description: "sibling", isBackground: true,
    });

    await manager.awaitStartup(parentId);
    await manager.awaitStartup(childId);
    rejectors.get("child")!(new Error("child blew up"));
    await manager.getRecord(childId)?.promise;

    expect(manager.getRecord(childId)?.status).toBe("error");
    expect(manager.getRecord(siblingId)?.status).toBe("queued");
  });

  it("a top-level agent settling DOES free its slot", async () => {
    // The other half of the rule — guards against over-correcting the fix into
    // "never decrement", which would wedge the queue permanently.
    const resolvers = controllableRuns();
    manager = fixtureManager(undefined, 1);

    const parentId = manager.spawn(mockPi, mockCtx, "general-purpose", "parent", {
      description: "parent", isBackground: true,
    });
    const siblingId = manager.spawn(mockPi, mockCtx, "general-purpose", "sibling", {
      description: "sibling", isBackground: true,
    });
    expect(manager.getRecord(siblingId)?.status).toBe("queued");

    await manager.awaitStartup(parentId);
    resolvers.get("parent")!(undefined);
    await manager.getRecord(parentId)?.promise;

    expect(manager.getRecord(siblingId)?.status).toBe("running");
  });
});

describe("AgentManager — drainQueue failure handling", () => {
  let manager: AgentManager;

  afterEach(() => { void manager?.dispose(); });

  it("a spawn that throws at drain time errors that record and keeps draining", async () => {
    // A claim refused at drain time is the documented drain-time failure: the
    // acquisition runs in startAgent, which drainQueue calls minutes after
    // spawn() returned. If the throw escaped drainQueue, every agent still
    // queued behind it would be stranded forever: a hang, not an error.
    const completed: AgentRecord[] = [];
    manager = fixtureManager(r => { completed.push(r); }, 1);

    let blocker: ((v: any) => void) | undefined;
    vi.mocked(runAgent).mockClear().mockImplementation((_ctx: any, _type: any, prompt: any) =>
      new Promise<any>(resolve => {
        if (prompt === "first") blocker = () => resolve({
          responseText: "ok", session: mockSession(), aborted: false, steered: false,
        });
      }),
    );

    const firstId = manager.spawn(mockPi, mockCtx, "X", "first", { description: "first", isBackground: true });
    vi.spyOn(taskRuntime.TaskAuthority.prototype, "claim").mockRejectedValueOnce(new Error("TaskBusy: boom is owned elsewhere"));
    const boomId = manager.spawn(mockPi, mockCtx, "X", "boom", {
      description: "boom", isBackground: true, isolation: "worktree",
    });
    const lastId = manager.spawn(mockPi, mockCtx, "X", "last", { description: "last", isBackground: true });
    expect(manager.getRecord(boomId)?.status).toBe("queued");

    await manager.awaitStartup(firstId);
    blocker!(undefined);
    await manager.getRecord(firstId)?.promise;

    const boom = manager.getRecord(boomId)!;
    await expect(boom.promise).rejects.toThrow("TaskBusy");
    expect(boom.status).toBe("error");
    expect(boom.error).toContain("TaskBusy");
    expect(boom.completedAt).toBeGreaterThan(0);
    expect(completed.map(r => r.id)).toContain(boomId);
    // ...and the drain continued past the failure rather than stopping there.
    expect(manager.getRecord(lastId)?.status).toBe("running");
    expect(vi.mocked(runAgent).mock.calls.map(call => call[2])).toEqual(["first", "last"]);
  });

  it("a cwd deleted between enqueue and drain is caught by the re-validation", async () => {
    // spawn() validated this cwd when it was still there. startAgent checks
    // again precisely because a queued agent can start minutes later (TOCTOU) —
    // that second check has never run in a test.
    manager = fixtureManager(undefined, 1);

    let blocker: ((v: any) => void) | undefined;
    vi.mocked(runAgent).mockImplementation((_ctx: any, _type: any, prompt: any) =>
      new Promise<any>(resolve => {
        if (prompt === "first") blocker = () => resolve({
          responseText: "ok", session: mockSession(), aborted: false, steered: false,
        });
      }),
    );

    const firstId = manager.spawn(mockPi, mockCtx, "X", "first", { description: "first", isBackground: true });
    const goneDir = mkdtempSync(join(tmpdir(), "pi-mgr-gone-"));
    const goneId = manager.spawn(mockPi, mockCtx, "X", "gone", {
      description: "gone", isBackground: true, cwd: goneDir,
    });
    expect(manager.getRecord(goneId)?.status).toBe("queued");

    rmSync(goneDir, { recursive: true, force: true }); // vanishes while queued

    await manager.awaitStartup(firstId);
    blocker!(undefined);
    await manager.getRecord(firstId)?.promise;

    const gone = manager.getRecord(goneId)!;
    expect(gone.status).toBe("error");
    expect(gone.error).toContain(goneDir); // the curated message, not a raw ENOENT
  });

  it("raising maxConcurrent releases queued agents immediately", async () => {
    vi.mocked(runAgent).mockImplementation(() => new Promise(() => {}));
    manager = fixtureManager(undefined, 1);

    manager.spawn(mockPi, mockCtx, "X", "a", { description: "a", isBackground: true });
    const bId = manager.spawn(mockPi, mockCtx, "X", "b", { description: "b", isBackground: true });
    expect(manager.getRecord(bId)?.status).toBe("queued");

    manager.setMaxConcurrent(2);
    expect(manager.getRecord(bId)?.status).toBe("running");
  });

  it("setMaxConcurrent clamps to at least 1", async () => {
    manager = fixtureManager(undefined, 4);
    manager.setMaxConcurrent(0);
    expect(manager.getMaxConcurrent()).toBe(1);
  });
});

describe("AgentManager — pendingSteers flush", () => {
  let manager: AgentManager;

  afterEach(() => { void manager?.dispose(); });

  it("delivers steers queued before the session existed, in order, then clears them", async () => {
    // A steer sent in the window between spawn and session creation is parked on
    // the record. If the flush breaks, the user's course correction is silently
    // dropped — steer_subagent already told them it was queued.
    const steer = vi.fn().mockResolvedValue(undefined);
    let release: (() => void) | undefined;
    vi.mocked(runAgent).mockImplementation((_ctx: any, _type: any, _prompt: any, opts: any) =>
      new Promise<any>(resolve => {
        release = () => {
          opts.onSessionCreated?.({ steer, dispose: vi.fn() });
          resolve({ responseText: "ok", session: mockSession(), aborted: false, steered: false });
        };
      }),
    );

    manager = fixtureManager();
    const id = manager.spawn(mockPi, mockCtx, "X", "p", { description: "p", isBackground: true });
    const record = manager.getRecord(id)!;

    manager.steer(id, "first correction");
    manager.steer(id, "second correction");
    expect(record.pendingSteers).toEqual(["first correction", "second correction"]);

    await manager.awaitStartup(id);
    release!();
    await record.promise;

    expect(steer.mock.calls.map(c => c[0])).toEqual(["first correction", "second correction"]);
    // Cleared, or every later session creation would re-deliver the same steers.
    expect(record.pendingSteers).toBeUndefined();
  });

  it("a steer that rejects does not fail the run", async () => {
    const steer = vi.fn().mockRejectedValue(new Error("session closed"));
    let release: (() => void) | undefined;
    vi.mocked(runAgent).mockImplementation((_ctx: any, _type: any, _prompt: any, opts: any) =>
      new Promise<any>(resolve => {
        release = () => {
          opts.onSessionCreated?.({ steer, dispose: vi.fn() });
          resolve({ responseText: "ok", session: mockSession(), aborted: false, steered: false });
        };
      }),
    );

    manager = fixtureManager();
    const id = manager.spawn(mockPi, mockCtx, "X", "p", { description: "p", isBackground: true });
    const record = manager.getRecord(id)!;
    manager.steer(id, "hello");

    await manager.awaitStartup(id);
    release!();
    await expect(record.promise).resolves.toBe("ok");
    expect(record.status).toBe("completed");
  });
});

// waitForAll() had zero coverage despite backing the Symbol.for registry entry
// and the print-mode host's shutdown hold. Its loop exists BECAUSE drainQueue
// respects maxConcurrent: a single Promise.allSettled pass would return while
// queued agents had not even started. That reads like a redundant loop, which
// is exactly why it needs a test — collapsing it resolves early and silently.
describe("AgentManager — waitForAll", () => {
  let manager: AgentManager;

  afterEach(() => { void manager?.dispose(); });

  it("waits for agents that were still QUEUED when it was called", async () => {
    const resolvers = new Map<string, () => void>();
    vi.mocked(runAgent).mockImplementation((_ctx: any, _type: any, prompt: any) =>
      new Promise<any>(resolve => {
        resolvers.set(prompt as string, () => resolve({
          responseText: "done", session: mockSession(), aborted: false, steered: false,
        }));
      }),
    );

    manager = fixtureManager(undefined, 1);
    const ids = ["a", "b", "c"].map(p =>
      manager.spawn(mockPi, mockCtx, "X", p, { description: p, isBackground: true }),
    );
    // Only the first can be running; the other two are behind the pool.
    expect(manager.getRecord(ids[1])?.status).toBe("queued");

    let settled = false;
    const all = manager.waitForAll().then(() => { settled = true; });

    // Release ONLY the running one. A queued record has no `.promise` yet — it
    // is created when the queue starts it — so a single `Promise.allSettled`
    // pass sees just this one agent and would resolve here, with two agents
    // still unstarted. The retry loop is what makes that not happen, and
    // asserting after releasing everything would hide the difference entirely.
    await new Promise(r => setImmediate(r));
    resolvers.get("a")!();
    await new Promise(r => setImmediate(r));
    await new Promise(r => setImmediate(r));
    expect(settled, "waitForAll resolved while agents were still queued").toBe(false);

    for (const p of ["b", "c"]) {
      resolvers.get(p)!();
      await new Promise(r => setImmediate(r));
      await new Promise(r => setImmediate(r));
    }
    await all;

    expect(settled).toBe(true);
    for (const id of ids) {
      expect(manager.getRecord(id)?.status, id).toBe("completed");
    }
  });

  it("resolves immediately when nothing is pending", async () => {
    manager = fixtureManager();
    await expect(manager.waitForAll()).resolves.toBeUndefined();
  });

  it("waits for an attempt that is still acquiring its claim", async () => {
    // The startup gap: the record is "running" but no worker has launched yet,
    // because the claim is an awaited authority call. Waiting only on launched
    // workers would let a `/wait` return before the agent had run at all.
    const original = taskRuntime.TaskAuthority.prototype.claim;
    let releaseClaim!: () => void;
    vi.spyOn(taskRuntime.TaskAuthority.prototype, "claim").mockImplementationOnce(async function(...args) {
      const record = await original.apply(this, args);
      await new Promise<void>(resolve => { releaseClaim = resolve; });
      return record;
    });
    vi.mocked(runAgent).mockClear();
    resolvedRun();

    manager = fixtureManager();
    const id = manager.spawn(mockPi, mockCtx, "X", "acquiring", { description: "acquiring", isBackground: true });
    expect(manager.getRecord(id)?.status).toBe("running");

    let settled = false;
    const all = manager.waitForAll().then(() => { settled = true; });
    await new Promise(r => setImmediate(r));
    expect(settled, "waitForAll resolved while the claim was still being acquired").toBe(false);
    expect(runAgent).not.toHaveBeenCalled();

    releaseClaim();
    await all;
    expect(runAgent).toHaveBeenCalledTimes(1);
    expect(manager.getRecord(id)?.status).toBe("completed");
  });

  it("does not reject when an agent fails", async () => {
    // allSettled, not all — one failing agent must not leave the caller hanging
    // on a rejection it never asked for.
    vi.mocked(runAgent).mockRejectedValue(new Error("boom"));
    manager = fixtureManager();
    const id = manager.spawn(mockPi, mockCtx, "X", "p", { description: "p", isBackground: true });

    await expect(manager.waitForAll()).resolves.toBeUndefined();
    expect(manager.getRecord(id)?.status).toBe("error");
  });
});

describe("AgentManager — dispose awaits task settlement", () => {
  it("resolves only after a pending settlement hook finishes and the claim is released", async () => {
    resolvedRun();
    const release = vi.spyOn(taskRuntime.TaskAuthority.prototype, "release");
    let releaseGate!: () => void;
    let isHookEntered = false;
    const manager = fixtureManager();
    try {
      const id = manager.spawn(mockPi, mockCtx, "X", "p", {
        description: "p", cwd: "/", isBackground: true,
        onBeforeTaskSettlement: async () => {
          isHookEntered = true;
          await new Promise<void>(resolve => { releaseGate = resolve; });
        },
      });
      await vi.waitFor(() => expect(isHookEntered).toBe(true));
      expect(release).not.toHaveBeenCalled();

      let isDisposed = false;
      const disposed = manager.dispose(mockPi).then(() => { isDisposed = true; });
      await new Promise(r => setTimeout(r, 50));
      expect(isDisposed, "dispose resolved while the settlement hook was still running").toBe(false);
      expect(release).not.toHaveBeenCalled();

      releaseGate();
      await disposed;
      expect(isDisposed).toBe(true);
      expect(release).toHaveBeenCalledTimes(1);
      expect(manager.getRecord(id)).toBeUndefined();
    } finally { vi.restoreAllMocks(); }
  });
});

describe("AgentManager — background resume", () => {
  let manager: AgentManager;

  afterEach(() => {
    manager?.dispose();
  });

  // Spawn a background agent and let it settle so it holds a session to resume.
  async function spawnSettled(mgr: AgentManager): Promise<string> {
    vi.mocked(runAgent).mockResolvedValue({
      responseText: "first",
      session: mockSession(),
      aborted: false,
      steered: false,
    });
    const id = mgr.spawn(mockPi, mockCtx, "general-purpose", "task", {
      description: "task",
      isBackground: true,
    });
    await mgr.getRecord(id)!.promise;
    return id;
  }

  it("returns immediately with a running record + promise, then settles and fires onComplete", async () => {
    const onComplete = vi.fn();
    manager = fixtureManager(onComplete);
    const id = await spawnSettled(manager);
    onComplete.mockClear(); // drop the spawn's own completion

    // Deferred resumeAgent so we can observe the mid-flight state.
    let finish!: (v: { text: string; failure?: string }) => void;
    vi.mocked(resumeAgent).mockImplementation(
      () => new Promise((resolve) => { finish = resolve; }),
    );

    const record = await manager.resume(id, "keep going", undefined, { isBackground: true });
    // Returned immediately: still running, with a tracked promise, no notify yet.
    expect(record?.status).toBe("running");
    expect(record?.promise).toBeDefined();
    expect(onComplete).not.toHaveBeenCalled();

    finish({ text: "second" });
    await record!.promise;

    expect(manager.getRecord(id)!.status).toBe("completed");
    expect(manager.getRecord(id)!.result).toBe("second");
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("a failed final turn on a background resume maps to error and still notifies", async () => {
    const onComplete = vi.fn();
    manager = fixtureManager(onComplete);
    const id = await spawnSettled(manager);
    onComplete.mockClear();

    vi.mocked(resumeAgent).mockResolvedValue({
      text: "partial",
      failure: "provider exploded",
    } as any);

    const record = await manager.resume(id, "again", undefined, { isBackground: true });
    await record!.promise;

    expect(manager.getRecord(id)!.status).toBe("error");
    expect(manager.getRecord(id)!.error).toBe("provider exploded");
    expect(manager.getRecord(id)!.result).toBe("partial"); // #144: keep this-run text
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("forwards activity/usage callbacks to the resumed run", async () => {
    manager = fixtureManager();
    const id = await spawnSettled(manager);

    const onToolActivity = vi.fn();
    const onAssistantUsage = vi.fn();
    vi.mocked(resumeAgent).mockImplementation(async (_session, _prompt, opts: any) => {
      opts.onToolActivity?.({ type: "end", toolName: "grep" });
      opts.onAssistantUsage?.({ input: 5, output: 3, cacheWrite: 0, cost: 0 });
      return { text: "ok" };
    });

    const record = await manager.resume(id, "go", undefined, {
      isBackground: true,
      onToolActivity,
      onAssistantUsage,
    });
    await record!.promise;

    expect(onToolActivity).toHaveBeenCalledWith({ type: "end", toolName: "grep" });
    expect(onAssistantUsage).toHaveBeenCalledWith({ input: 5, output: 3, cacheWrite: 0, cost: 0 });
    // Internal record bookkeeping still runs alongside the forwarded callbacks.
    expect(manager.getRecord(id)!.toolUses).toBe(1);
    expect(manager.getRecord(id)!.lifetimeUsage).toEqual({ input: 5, output: 3, cacheWrite: 0, cost: 0 });
  });

  it("queues a background resume when the concurrency pool is full", async () => {
    manager = fixtureManager(undefined, 1); // maxConcurrent = 1
    const id = await spawnSettled(manager);

    // Occupy the single slot with a never-settling background spawn.
    vi.mocked(runAgent).mockImplementation(() => new Promise(() => {}));
    const blockerId = manager.spawn(mockPi, mockCtx, "general-purpose", "blocker", {
      description: "blocker",
      isBackground: true,
    });
    expect(manager.getRecord(blockerId)!.status).toBe("running");

    vi.mocked(resumeAgent).mockImplementation(() => new Promise(() => {}));
    vi.mocked(resumeAgent).mockClear(); // drop call history from earlier tests
    const record = await manager.resume(id, "later", undefined, { isBackground: true });

    expect(record?.status).toBe("queued");
    expect(resumeAgent).not.toHaveBeenCalled();
  });

  it("foreground resume is unchanged: awaits inline and does not fire onComplete", async () => {
    const onComplete = vi.fn();
    manager = fixtureManager(onComplete);
    const id = await spawnSettled(manager);
    onComplete.mockClear();

    vi.mocked(resumeAgent).mockResolvedValue({ text: "inline result" } as any);
    const record = await manager.resume(id, "sync");

    expect(record?.status).toBe("completed");
    expect(record?.result).toBe("inline result");
    // Foreground resume returns its result inline and never notified (historical).
    expect(onComplete).not.toHaveBeenCalled();
  });

  // A detached resume returns while the record is still "running", so nothing
  // stops a second resume of the same agent. Starting one would replace
  // record.abortController — leaving the live run unreachable from /agents stop
  // and abortAll() — and then reject from session.prompt(), whose settle path
  // would report a failure and abort the children of a run still in progress.
  it("refuses to background-resume an agent whose run is still in flight", async () => {
    const onComplete = vi.fn();
    manager = fixtureManager(onComplete);
    const id = await spawnSettled(manager);
    onComplete.mockClear();

    vi.mocked(resumeAgent).mockClear();
    vi.mocked(resumeAgent).mockImplementation(() => new Promise(() => {}));

    const first = await manager.resume(id, "go", undefined, { isBackground: true });
    expect(first?.status).toBe("running");
    const liveController = manager.getRecord(id)!.abortController;

    const second = await manager.resume(id, "go again", undefined, { isBackground: true });

    expect(second).toBeUndefined();
    expect(resumeAgent).toHaveBeenCalledTimes(1);
    // The in-flight run is untouched: same controller, still running, no
    // spurious completion notification.
    expect(manager.getRecord(id)!.abortController).toBe(liveController);
    expect(manager.getRecord(id)!.status).toBe("running");
    expect(onComplete).not.toHaveBeenCalled();
    // Still stoppable — the point of keeping the original controller.
    expect(manager.abort(id)).toBe(true);
    expect(liveController!.signal.aborted).toBe(true);
  });

  it("refuses to background-resume an agent that is still queued", async () => {
    manager = fixtureManager(undefined, 1); // maxConcurrent = 1
    const id = await spawnSettled(manager);

    vi.mocked(runAgent).mockImplementation(() => new Promise(() => {}));
    manager.spawn(mockPi, mockCtx, "general-purpose", "blocker", {
      description: "blocker",
      isBackground: true,
    });

    vi.mocked(resumeAgent).mockClear();
    vi.mocked(resumeAgent).mockImplementation(() => new Promise(() => {}));
    expect((await manager.resume(id, "later", undefined, { isBackground: true }))?.status).toBe("queued");

    expect(await manager.resume(id, "later again", undefined, { isBackground: true })).toBeUndefined();
    expect(resumeAgent).not.toHaveBeenCalled();
  });

  // onStarted is where the Agent tool hangs output-file streaming. It must fire
  // when the run actually begins — not when resume() returns — or a resume that
  // is stopped while queued leaves a live session subscription behind: abort()
  // drops a queued record without reaching settle(), which is what tears that
  // subscription down.
  it("fires onStarted when the run starts, not when a queued resume is registered", async () => {
    manager = fixtureManager(undefined, 1); // maxConcurrent = 1
    const id = await spawnSettled(manager);

    // Occupy the only slot with a run we can release on demand.
    let releaseBlocker!: (v: any) => void;
    vi.mocked(runAgent).mockImplementation(() => new Promise((resolve) => { releaseBlocker = resolve; }));
    manager.spawn(mockPi, mockCtx, "general-purpose", "blocker", {
      description: "blocker",
      isBackground: true,
    });

    vi.mocked(resumeAgent).mockImplementation(() => new Promise(() => {}));
    const onStarted = vi.fn();
    const record = await manager.resume(id, "later", undefined, { isBackground: true, onStarted });

    expect(record?.status).toBe("queued");
    expect(onStarted).not.toHaveBeenCalled();

    await vi.waitFor(() => expect(releaseBlocker).toBeTypeOf("function"));
    releaseBlocker({ responseText: "blocker done", session: mockSession(), aborted: false, steered: false });
    await manager.getRecord(record!.id)!.promise?.catch(() => {});
    await new Promise((r) => setTimeout(r, 0));

    expect(manager.getRecord(id)!.status).toBe("running");
    expect(onStarted).toHaveBeenCalledTimes(1);
  });

  it("never fires onStarted for a queued resume that is stopped before it drains", async () => {
    manager = fixtureManager(undefined, 1); // maxConcurrent = 1
    const id = await spawnSettled(manager);

    vi.mocked(runAgent).mockImplementation(() => new Promise(() => {}));
    manager.spawn(mockPi, mockCtx, "general-purpose", "blocker", {
      description: "blocker",
      isBackground: true,
    });

    vi.mocked(resumeAgent).mockImplementation(() => new Promise(() => {}));
    const onStarted = vi.fn();
    await manager.resume(id, "later", undefined, { isBackground: true, onStarted });

    expect(manager.abort(id)).toBe(true);
    expect(manager.getRecord(id)!.status).toBe("stopped");
    expect(onStarted).not.toHaveBeenCalled();
  });
});

// A `name` on the spawn adds a SECOND handle rather than replacing the
// type-derived one. That is the property the whole design rests on: if naming
// freed up `explore`, then `@explore fix it` would quietly start a second
// Explore alongside the running one instead of reaching it.
describe("AgentManager — names as additive aliases", () => {
  let manager: AgentManager;

  afterEach(() => { void manager?.dispose(); });

  const spawnNamed = (m: AgentManager, type: string, name?: string) =>
    m.spawn(mockPi, mockCtx, type, "go", {
      description: "go",
      ...(name !== undefined && { name }),
      isBackground: true,
    });

  it("assigns the type handle as well as the alias", async () => {
    resolvedRun();
    manager = fixtureManager();
    const record = manager.getRecord(spawnNamed(manager, "Explore", "auth-audit"))!;

    expect(record.handle).toBe("explore");
    expect(record.alias).toBe("auth-audit");
  });

  it("reaches the same agent by either name", async () => {
    resolvedRun();
    manager = fixtureManager();
    const id = spawnNamed(manager, "Explore", "auth-audit");

    expect(manager.resolveMention("auth-audit")).toMatchObject({ kind: "live", record: { id } });
    expect(manager.resolveMention("explore")).toMatchObject({ kind: "live", record: { id } });
  });

  it("slugs a name that isn't typeable rather than rejecting the spawn", async () => {
    resolvedRun();
    manager = fixtureManager();
    const record = manager.getRecord(spawnNamed(manager, "Explore", "Auth Audit!"))!;

    expect(record.alias).toBe("auth-audit");
  });

  it("numbers an alias that collides with its own type handle", async () => {
    // `name: "explore"` on an Explore would otherwise produce two identical
    // names on one record, and later a second agent could take one of them.
    resolvedRun();
    manager = fixtureManager();
    const record = manager.getRecord(spawnNamed(manager, "Explore", "explore"))!;

    expect(record.handle).toBe("explore");
    expect(record.alias).toBe("explore-2");
  });

  it("stops a later type handle from colliding with an existing alias", async () => {
    resolvedRun();
    manager = fixtureManager();
    spawnNamed(manager, "Plan", "explore"); // alias squats the Explore name
    const second = manager.getRecord(spawnNamed(manager, "Explore"))!;

    expect(second.handle).toBe("explore-2");
  });

  it("refuses to alias an agent to the reserved main handle", async () => {
    resolvedRun();
    manager = fixtureManager();
    const record = manager.getRecord(spawnNamed(manager, "Explore", "main"))!;

    expect(record.alias).toBe("main-2");
  });

  it("gives an unnamed agent no alias at all", async () => {
    resolvedRun();
    manager = fixtureManager();
    const record = manager.getRecord(spawnNamed(manager, "Explore"))!;

    expect(record.alias).toBeUndefined();
    expect(record.handle).toBe("explore");
  });

  it("never names a nested child, however it was spawned", async () => {
    // Nested agents are hidden from every top-level surface; a name would make
    // one addressable through a boundary only its owner may cross.
    resolvedRun();
    manager = fixtureManager();
    const id = manager.spawn(mockPi, mockCtx, "Explore", "go", {
      description: "go",
      name: "child",
      parentAgentId: "parent-1",
      isBackground: true,
    });

    const record = manager.getRecord(id)!;
    expect(record.alias).toBeUndefined();
    expect(record.handle).toBeUndefined();
    expect(manager.resolveMention("child")).toBeUndefined();
  });

  it("captures the session file so the agent can be resumed after eviction", async () => {
    vi.mocked(runAgent).mockImplementation(async (_ctx: any, _type: any, _prompt: any, options: any) => {
      options.onSessionCreated?.({
        dispose: vi.fn(),
        sessionManager: { getSessionFile: () => "/sessions/explore.jsonl" },
      });
      return { responseText: "done", session: mockSession(), aborted: false, steered: false } as any;
    });
    manager = fixtureManager();
    const id = spawnNamed(manager, "Explore");
    await manager.getRecord(id)!.promise;

    expect(manager.getRecord(id)!.sessionFile).toBe("/sessions/explore.jsonl");
  });

  it("records no session file for an in-memory session", async () => {
    vi.mocked(runAgent).mockImplementation(async (_ctx: any, _type: any, _prompt: any, options: any) => {
      options.onSessionCreated?.({ dispose: vi.fn(), sessionManager: { getSessionFile: () => undefined } });
      return { responseText: "done", session: mockSession(), aborted: false, steered: false } as any;
    });
    manager = fixtureManager();
    const id = spawnNamed(manager, "Explore");
    await manager.getRecord(id)!.promise;

    expect(manager.getRecord(id)!.sessionFile).toBeUndefined();
  });
});

describe("AgentManager — effective model and thinking write-back", () => {
  let manager: AgentManager;

  afterEach(() => {
    manager?.dispose?.();
    vi.restoreAllMocks();
  });

  /** Run a spawn whose session reports the given runtime model/level. */
  async function spawnWithSession(
    invocation: AgentRecord["invocation"],
    runtime: { model?: { provider: string; id: string; name?: string }; thinkingLevel?: string },
  ): Promise<AgentRecord> {
    vi.mocked(runAgent).mockImplementation(async (_ctx: any, _type: any, _prompt: any, options: any) => {
      options.onSessionCreated?.({ dispose: vi.fn(), ...runtime });
      return { responseText: "done", session: mockSession(), aborted: false, steered: false } as any;
    });
    manager = fixtureManager();
    const id = manager.spawn(mockPi, mockCtx, "Explore", "go", {
      description: "go",
      isBackground: true,
      invocation,
    });
    await manager.getRecord(id)!.promise;
    return manager.getRecord(id)!;
  }

  it("relabels the record with the model the session actually runs", async () => {
    const record = await spawnWithSession(
      { modelName: "pre-session", modelId: "pre/session", thinking: "high" },
      { model: { provider: "anthropic", id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6" }, thinkingLevel: "high" },
    );

    expect(record.invocation).toMatchObject({
      modelName: "sonnet 4.6",
      modelId: "anthropic/claude-sonnet-4-6",
      thinking: "high",
    });
  });

  it("keeps the requested level when pi clamps it to what the model supports", async () => {
    const record = await spawnWithSession(
      { thinking: "max" },
      { model: { provider: "anthropic", id: "claude-haiku-4-5" }, thinkingLevel: "high" },
    );

    expect(record.invocation!.thinking).toBe("high");
    expect(record.invocation!.requestedThinking).toBe("max");
  });

  it("records no request when the level was honored", async () => {
    const record = await spawnWithSession(
      { thinking: "high" },
      { model: { provider: "anthropic", id: "claude-haiku-4-5" }, thinkingLevel: "high" },
    );

    expect(record.invocation!.requestedThinking).toBeUndefined();
  });

  it("does not overwrite a request the agent file already overrode", async () => {
    // Frontmatter pinned `low` over a caller's `max`, then the model clamped it
    // again. The caller asked for `max` — that is what the surfaces must say,
    // not the intermediate value frontmatter chose.
    const record = await spawnWithSession(
      { thinking: "low", requestedThinking: "max" },
      { model: { provider: "anthropic", id: "claude-haiku-4-5" }, thinkingLevel: "minimal" },
    );

    expect(record.invocation!.thinking).toBe("minimal");
    expect(record.invocation!.requestedThinking).toBe("max");
  });

  it("gives a spawn that carried no invocation one to display", async () => {
    // Cross-extension RPC and `@handle` spawns pass none, and used to render no
    // metadata at all.
    const record = await spawnWithSession(
      undefined,
      { model: { provider: "openai-codex", id: "gpt-5.6-sol" }, thinkingLevel: "xhigh" },
    );

    expect(record.invocation).toEqual({
      modelName: "gpt-5.6-sol",
      modelId: "openai-codex/gpt-5.6-sol",
      thinking: "xhigh",
    });
  });

  it("keeps the requested level when the session reports no level of its own", async () => {
    // An older pi or a stubbed session degrades to "nothing to say about the
    // level", which must not read as "no level" on every surface.
    const record = await spawnWithSession(
      { thinking: "max" },
      { model: { provider: "anthropic", id: "claude-haiku-4-5" } },
    );

    expect(record.invocation!.thinking).toBe("max");
    expect(record.invocation!.requestedThinking).toBeUndefined();
    expect(record.invocation!.modelName).toBe("claude-haiku-4-5");
  });

  it("leaves the invocation alone when the session reports no model", async () => {
    const record = await spawnWithSession({ thinking: "max" }, {});

    expect(record.invocation).toEqual({ thinking: "max" });
  });
});
