import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AgentSession, ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import * as codingAgent from "@earendil-works/pi-coding-agent";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as agentRunner from "../src/agent-runner.js";
import * as environment from "../src/env.js";
import { createNestedSubagentTools } from "../src/nested-tools.js";
import { createWorkflowHost } from "../src/workflow/host.js";
import { compileJsonSchema } from "../src/workflow/json-schema.js";
import * as worktree from "../src/worktree.js";

vi.mock("../src/agent-runner.js", async () => ({
  ...(await vi.importActual<typeof agentRunner>("../src/agent-runner.js")),
  runAgent: vi.fn(), resumeAgent: vi.fn(),
}));
vi.mock("../src/worktree.js", async () => ({
  ...(await vi.importActual<typeof worktree>("../src/worktree.js")),
  createWorktree: vi.fn(), cleanupWorktree: vi.fn(async () => ({ hasChanges: false })), pruneWorktrees: vi.fn(async () => {}),
}));

import { AgentManager } from "../src/agent-manager.js";
import { resumeAgent, runAgent } from "../src/agent-runner.js";
import { runInChildSessionContext } from "../src/child-context.js";
import subagentsExtension from "../src/index.js";
import type { RunActivity } from "../src/types.js";
import { createWorktree } from "../src/worktree.js";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

const session = { dispose: vi.fn() } as unknown as AgentSession;
const result = { responseText: "done", session, aborted: false, steered: false };
const pi = {} as ExtensionAPI;
const ctx = { cwd: "/tmp", sessionManager: { getSessionId: () => "root" } } as ExtensionContext;
const childCtx = { ...ctx, sessionManager: { getSessionId: () => "child-session" } } as ExtensionContext;

function assertPairs(events: RunActivity[], count: number) {
  expect(events).toHaveLength(count * 2);
  const starts = events.filter(event => event.transition === "started");
  expect(starts).toHaveLength(count);
  expect(new Set(starts.map(event => event.runId)).size).toBe(count);
  for (const start of starts) {
    expect(start.version).toBe(1);
    const pair = events.filter(event => event.runId === start.runId);
    expect(pair).toHaveLength(2);
    expect(pair[0]).toEqual(start);
    expect(pair[1].transition).not.toBe("started");
    expect(pair[1]).toMatchObject({ version: 1, rootSessionId: start.rootSessionId, agentId: start.agentId });
    expect(pair[1].status).toBeDefined();
  }
}

describe("owner run activity", () => {
  let manager: AgentManager;
  let events: RunActivity[];
  let starts: ReturnType<typeof vi.fn>;
  let completes: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    events = [];
    starts = vi.fn();
    completes = vi.fn();
    manager = new AgentManager((record, activity, isPresentation = true) => {
      if (activity) events.push(activity);
      if (isPresentation) completes(record);
    }, 1, (record, activity, isPresentation = true) => {
      if (activity) events.push(activity);
      if (isPresentation) starts(record);
    }, undefined, undefined, true);
    vi.mocked(runAgent).mockReset().mockResolvedValue(result);
    vi.mocked(resumeAgent).mockReset().mockResolvedValue({ text: "resumed" });
  });

  afterEach(async () => {
    await manager.dispose();
    vi.clearAllMocks();
  });

  it("does not start queued work until admission, and never starts cancelled queued work", async () => {
    const first = deferred<typeof result>();
    vi.mocked(runAgent).mockReturnValueOnce(first.promise);
    const a = manager.spawn(pi, ctx, "Explore", "a", { description: "a", isBackground: true });
    const b = manager.spawn(pi, ctx, "Explore", "b", { description: "b", isBackground: true });
    const c = manager.spawn(pi, ctx, "Explore", "c", { description: "c", isBackground: true });
    expect(events.map(event => event.agentId)).toEqual([a]);
    expect(manager.getRecord(b)?.status).toBe("queued");
    manager.abort(c);
    expect(events).toHaveLength(1);
    first.resolve(result);
    await manager.waitForAll();
    assertPairs(events, 2);
    expect(events.map(event => [event.agentId, event.transition])).toEqual([
      [a, "started"], [a, "completed"], [b, "started"], [b, "completed"],
    ]);
    expect(starts).toHaveBeenCalledTimes(2);
    expect(completes).toHaveBeenCalledTimes(2);
    expect(events[0]).not.toHaveProperty("workflowId");
    expect(events[0]).not.toHaveProperty("parentAgentId");
  });

  it.each([false, true])("does not report activity for pre-aborted spawns (queued=%s)", async (isQueued) => {
    const blocker = deferred<typeof result>();
    if (isQueued) {
      vi.mocked(runAgent).mockReturnValueOnce(blocker.promise);
      manager.spawn(pi, ctx, "Explore", "blocker", { description: "blocker", isBackground: true });
    }
    const parent = new AbortController();
    parent.abort();
    const onSpawned = vi.fn();
    const id = manager.spawn(pi, ctx, "Explore", "cancelled", {
      description: "cancelled", isBackground: true, signal: parent.signal, onSpawned,
    });
    await manager.awaitStartup(id);
    expect(manager.getRecord(id)?.status).toBe("stopped");
    expect(manager.getRecord(id)?.completedAt).toEqual(expect.any(Number));
    expect(events.filter(event => event.agentId === id)).toEqual([]);
    expect(onSpawned).toHaveBeenCalledTimes(isQueued ? 0 : 1);
    expect(runAgent).toHaveBeenCalledTimes(isQueued ? 1 : 0);
    const next = manager.spawn(pi, ctx, "Explore", "next", { description: "next", isBackground: true });
    blocker.resolve(result);
    await manager.waitForAll();
    expect(manager.getRecord(next)?.status).toBe("completed");
    assertPairs(events, isQueued ? 2 : 1);
  });

  it("keeps the legitimate start/stop pair when a spawn start observer cancels synchronously", async () => {
    const parent = new AbortController();
    starts.mockImplementationOnce(() => parent.abort());
    const id = manager.spawn(pi, ctx, "Explore", "cancelled", {
      description: "cancelled", isBackground: true, signal: parent.signal,
    });
    await manager.awaitStartup(id);
    expect(manager.getRecord(id)?.status).toBe("stopped");
    expect(runAgent).not.toHaveBeenCalled();
    assertPairs(events, 1);
    expect(events.map(event => event.transition)).toEqual(["started", "stopped"]);
  });

  it.each([false, true])("drains despite throwing activity observers (runner rejection=%s)", async (isRejected) => {
    starts.mockImplementation(() => { throw new Error("start observer failed"); });
    completes.mockImplementation(() => { throw new Error("terminal observer failed"); });
    const first = deferred<typeof result>();
    vi.mocked(runAgent).mockReturnValueOnce(first.promise);
    const a = manager.spawn(pi, ctx, "Explore", "a", { description: "a", isBackground: true });
    const aRecord = manager.getRecord(a)!;
    const b = manager.spawn(pi, ctx, "Explore", "b", { description: "b", isBackground: true });
    await expect(manager.awaitStartup(a)).resolves.toBeUndefined();
    expect(runAgent).toHaveBeenCalledOnce();
    expect(manager.getRecord(b)?.status).toBe("queued");
    if (isRejected) first.reject(new Error("runner failed"));
    else first.resolve(result);
    await expect(aRecord.promise).resolves.toBe(isRejected ? "" : "done");
    expect(runAgent).toHaveBeenCalledTimes(2);
    await manager.getRecord(b)!.promise;
    assertPairs(events, 2);
    expect(events.map(event => [event.agentId, event.transition])).toEqual([
      [a, "started"], [a, isRejected ? "failed" : "completed"], [b, "started"], [b, "completed"],
    ]);
    expect(aRecord.status).toBe(isRejected ? "error" : "completed");
    expect(manager.getRecord(b)?.status).toBe("completed");
    expect(starts).toHaveBeenCalledTimes(2);
    expect(completes).toHaveBeenCalledTimes(2);
    const c = manager.spawn(pi, ctx, "Explore", "c", { description: "c", isBackground: true });
    expect(runAgent).toHaveBeenCalledTimes(3);
    await manager.getRecord(c)!.promise;
    assertPairs(events, 3);
  });

  it("drains queued work after startup failure when the completion observer throws", async () => {
    completes.mockImplementation(() => { throw new Error("terminal observer failed"); });
    const first = deferred<typeof result>();
    vi.mocked(runAgent).mockReturnValueOnce(first.promise);
    vi.mocked(createWorktree).mockResolvedValueOnce(null);
    const a = manager.spawn(pi, ctx, "Explore", "a", { description: "a", isBackground: true });
    const b = manager.spawn(pi, ctx, "Explore", "b", { description: "b", isBackground: true, isolation: "worktree" });
    const c = manager.spawn(pi, ctx, "Explore", "c", { description: "c", isBackground: true });
    expect(manager.getRecord(b)?.status).toBe("queued");
    expect(manager.getRecord(c)?.status).toBe("queued");
    first.resolve(result);
    await manager.getRecord(a)!.promise;
    await vi.waitFor(() => expect(manager.getRecord(c)?.status).toBe("completed"));
    expect(manager.getRecord(b)?.status).toBe("error");
    expect(runAgent).toHaveBeenCalledTimes(2);
    expect(events.some(event => event.agentId === b)).toBe(false);
    assertPairs(events, 2);
    expect(completes).toHaveBeenCalledTimes(3);
  });

  it("drains after a rejected runner when only the terminal observer throws", async () => {
    completes.mockImplementation(() => { throw new Error("terminal observer failed"); });
    const first = deferred<typeof result>();
    vi.mocked(runAgent).mockReturnValueOnce(first.promise);
    const a = manager.spawn(pi, ctx, "Explore", "a", { description: "a", isBackground: true });
    const b = manager.spawn(pi, ctx, "Explore", "b", { description: "b", isBackground: true });
    first.reject(new Error("runner failed"));
    await expect(manager.getRecord(a)!.promise).resolves.toBe("");
    expect(runAgent).toHaveBeenCalledTimes(2);
    await manager.getRecord(b)!.promise;
    assertPairs(events, 2);
    expect(events[1]).toMatchObject({ transition: "failed", status: "error" });
    expect(manager.getRecord(b)?.status).toBe("completed");
  });

  it("forwards the resolved root through a separate manager dispatch", async () => {
    const otherEvents: RunActivity[] = [];
    const otherManager = new AgentManager((_record, activity) => {
      if (activity) otherEvents.push(activity);
    }, 1, (_record, activity) => {
      if (activity) otherEvents.push(activity);
    }, undefined, undefined, true);
    try {
      const parent = manager.spawn(pi, ctx, "Explore", "parent", { description: "parent" });
      const parentRecord = manager.getRecord(parent)!;
      const child = otherManager.spawn(pi, childCtx, "Explore", "child", {
        description: "child", parentAgentId: parent, rootSessionId: parentRecord.rootSessionId,
      });
      await Promise.all([parentRecord.promise, otherManager.getRecord(child)!.promise]);
      expect(parentRecord.rootSessionId).toBe("root");
      expect(otherManager.getRecord(child)?.rootSessionId).toBe("root");
      assertPairs(events, 1);
      assertPairs(otherEvents, 1);
      expect([...events, ...otherEvents].map(event => event.rootSessionId)).toEqual(["root", "root", "root", "root"]);
      expect(otherEvents.map(event => event.parentAgentId)).toEqual([parent, parent]);
    } finally {
      await otherManager.dispose();
    }
  });

  it("covers foreground queue admission and drain", async () => {
    manager.setMaxConcurrentForeground(1);
    const first = deferred<typeof result>();
    vi.mocked(runAgent).mockReturnValueOnce(first.promise);
    const a = manager.spawnAndWait(pi, ctx, "Explore", "a", { description: "a" });
    const b = manager.spawnAndWait(pi, ctx, "Explore", "b", { description: "b" });
    expect(events).toHaveLength(1);
    first.resolve(result);
    await Promise.all([a, b]);
    assertPairs(events, 2);
    expect(completes).toHaveBeenCalledTimes(2);
  });

  it("keeps root identity for nested and workflow-owned executions", async () => {
    const parentRun = deferred<typeof result>();
    vi.mocked(runAgent).mockReturnValueOnce(parentRun.promise);
    const parent = manager.spawn(pi, ctx, "Explore", "parent", { description: "parent", isBackground: true });
    const nested = manager.spawn(pi, childCtx, "Explore", "nested", { description: "nested", parentAgentId: parent });
    const workflow = manager.spawn(pi, childCtx, "Explore", "workflow", { description: "workflow", workflowId: "wf-real", rootSessionId: "root" });
    await Promise.all([manager.getRecord(nested)!.promise, manager.getRecord(workflow)!.promise]);
    parentRun.resolve(result);
    await manager.waitForAll();
    assertPairs(events, 3);
    expect(events.every(event => event.rootSessionId === "root")).toBe(true);
    expect(events.filter(event => event.agentId === nested).map(event => event.parentAgentId)).toEqual([parent, parent]);
    expect(events.filter(event => event.agentId === workflow).map(event => event.workflowId)).toEqual(["wf-real", "wf-real"]);
  });

  it("assigns new identities to foreground and queued background resumes without adding foreground presentation", async () => {
    const id = manager.spawn(pi, ctx, "Explore", "spawn", { description: "resume", isBackground: true });
    await manager.getRecord(id)!.promise;
    await manager.resume(id, "foreground");
    const blocker = deferred<typeof result>();
    vi.mocked(runAgent).mockReturnValueOnce(blocker.promise);
    manager.spawn(pi, ctx, "Explore", "blocker", { description: "blocker", isBackground: true });
    await manager.resume(id, "background", undefined, { isBackground: true });
    expect(events.filter(event => event.agentId === id)).toHaveLength(4);
    expect(manager.getRecord(id)?.status).toBe("queued");
    blocker.resolve(result);
    await manager.waitForAll();
    assertPairs(events, 4);
    expect(events.filter(event => event.agentId === id && event.transition === "started")).toHaveLength(3);
    expect(starts).toHaveBeenCalledTimes(3);
    expect(completes).toHaveBeenCalledTimes(3);
  });

  it.each([
    ["resolved failure", { ...result, failure: "provider failed" }, "failed", "error"],
    ["hard abort", { ...result, aborted: true }, "stopped", "aborted"],
    ["steered", { ...result, steered: true }, "completed", "steered"],
  ] as const)("closes %s exactly once", async (_name, outcome, transition, status) => {
    vi.mocked(runAgent).mockResolvedValueOnce(outcome);
    const id = manager.spawn(pi, ctx, "Explore", "run", { description: "run", isBackground: true });
    await manager.getRecord(id)!.promise;
    assertPairs(events, 1);
    expect(events[1]).toMatchObject({ transition, status });
    expect(completes).toHaveBeenCalledOnce();
  });

  it("closes runner rejection exactly once", async () => {
    vi.mocked(runAgent).mockRejectedValueOnce(new Error("runner failed"));
    const id = manager.spawn(pi, ctx, "Explore", "run", { description: "run", isBackground: true });
    await manager.getRecord(id)!.promise;
    assertPairs(events, 1);
    expect(events[1]).toMatchObject({ transition: "failed", status: "error" });
  });

  it("does not invent execution events for failed or stopped worktree preparation", async () => {
    vi.mocked(createWorktree).mockResolvedValueOnce(null);
    const failed = manager.spawn(pi, ctx, "Explore", "run", { description: "run", isolation: "worktree" });
    await expect(manager.awaitStartup(failed)).rejects.toThrow("Cannot run");
    const preparing = deferred<Awaited<ReturnType<typeof createWorktree>>>();
    vi.mocked(createWorktree).mockReturnValueOnce(preparing.promise);
    const stopped = manager.spawn(pi, ctx, "Explore", "run", { description: "run", isolation: "worktree" });
    manager.abort(stopped);
    preparing.resolve({ path: "/tmp", branch: "test", baseSha: "sha", workPath: "/tmp" });
    await manager.awaitStartup(stopped);
    expect(events).toEqual([]);
    expect(runAgent).not.toHaveBeenCalled();
  });

  it("stop is terminal immediately and later settlement does not duplicate activity or summaries", async () => {
    const run = deferred<typeof result>();
    vi.mocked(runAgent).mockReturnValueOnce(run.promise);
    const id = manager.spawn(pi, ctx, "Explore", "run", { description: "run", isBackground: true });
    expect(manager.abort(id)).toBe(true);
    expect(manager.abort(id)).toBe(false);
    assertPairs(events, 1);
    expect(events[1]).toMatchObject({ transition: "stopped", status: "stopped" });
    expect(completes).not.toHaveBeenCalled();
    run.resolve(result);
    await manager.getRecord(id)!.promise;
    assertPairs(events, 1);
    expect(completes).toHaveBeenCalledOnce();
  });

  it("does not launch an actual prompt for a pre-aborted foreground resume", async () => {
    const actual = await vi.importActual<typeof agentRunner>("../src/agent-runner.js");
    const prompt = vi.fn<AgentSession["prompt"]>().mockResolvedValue(undefined);
    const instrumented = {
      messages: [], subscribe: vi.fn(() => () => {}), prompt,
      abort: vi.fn<AgentSession["abort"]>().mockResolvedValue(undefined), dispose: vi.fn(),
    } as unknown as AgentSession;
    vi.mocked(runAgent).mockResolvedValueOnce({ ...result, session: instrumented });
    const id = manager.spawn(pi, ctx, "Explore", "spawn", { description: "resume" });
    await manager.getRecord(id)!.promise;
    manager.getRecord(id)!.error = "old error";
    vi.mocked(resumeAgent).mockImplementationOnce(actual.resumeAgent);
    const parent = new AbortController();
    parent.abort();
    const record = await manager.resume(id, "cancelled", parent.signal);
    expect(prompt).not.toHaveBeenCalled();
    expect(resumeAgent).not.toHaveBeenCalled();
    expect(record?.status).toBe("stopped");
    expect(record?.result).toBeUndefined();
    expect(record?.error).toBeUndefined();
    expect(record?.completedAt).toEqual(expect.any(Number));
    assertPairs(events, 1);
    expect(starts).toHaveBeenCalledOnce();
    expect(completes).toHaveBeenCalledOnce();
  });

  it.each([false, true])("does not launch an actual prompt after synchronous start cancellation (background=%s)", async (isBackground) => {
    const actual = await vi.importActual<typeof agentRunner>("../src/agent-runner.js");
    const prompt = vi.fn<AgentSession["prompt"]>().mockResolvedValue(undefined);
    const instrumented = {
      messages: [], subscribe: vi.fn(() => () => {}), prompt,
      abort: vi.fn<AgentSession["abort"]>().mockResolvedValue(undefined), dispose: vi.fn(),
    } as unknown as AgentSession;
    vi.mocked(runAgent).mockResolvedValueOnce({ ...result, session: instrumented });
    const id = manager.spawn(pi, ctx, "Explore", "spawn", { description: "resume" });
    await manager.getRecord(id)!.promise;
    const parent = new AbortController();
    manager = Object.assign(manager, {
      onStart: (_record: unknown, activity: RunActivity) => {
        events.push(activity);
        parent.abort();
      },
    });
    vi.mocked(resumeAgent).mockImplementationOnce(actual.resumeAgent);
    await manager.resume(id, "cancelled", parent.signal, { isBackground });
    await manager.getRecord(id)!.promise;
    expect(prompt).not.toHaveBeenCalled();
    expect(resumeAgent).not.toHaveBeenCalled();
    expect(manager.getRecord(id)?.status).toBe("stopped");
    assertPairs(events, 2);
    const next = manager.spawn(pi, ctx, "Explore", "next", { description: "next", isBackground: true });
    await manager.getRecord(next)!.promise;
    expect(manager.getRecord(next)?.status).toBe("completed");
    assertPairs(events, 3);
  });

  it.each(["foreground", "background", "spawn"] as const)("detaches running %s listeners before runner settlement", async (kind) => {
    for (const action of ["signal", "stop", "abortAll", "dispose"] as const) {
      const parent = new AbortController();
      const added = vi.spyOn(parent.signal, "addEventListener");
      const removed = vi.spyOn(parent.signal, "removeEventListener");
      const running = deferred<typeof result>();
      const resumed = deferred<{ text: string }>();
      let id: string;
      let pending: Promise<unknown>;
      if (kind === "spawn") {
        vi.mocked(runAgent).mockReturnValueOnce(running.promise);
        id = manager.spawn(pi, ctx, "Explore", "run", { description: "run", signal: parent.signal });
        pending = manager.getRecord(id)!.promise!;
      } else {
        id = manager.spawn(pi, ctx, "Explore", "run", { description: "run" });
        await manager.getRecord(id)!.promise;
        vi.mocked(resumeAgent).mockReturnValueOnce(resumed.promise);
        pending = manager.resume(id, "resume", parent.signal, { isBackground: kind === "background" });
      }
      const record = manager.getRecord(id)!;
      expect(added).toHaveBeenCalled();
      if (action === "signal") parent.abort();
      else if (action === "stop") manager.abort(id);
      else if (action === "abortAll") manager.abortAll();
      else await manager.dispose();
      for (const registration of added.mock.calls) {
        expect(removed).toHaveBeenCalledWith("abort", registration[1]);
      }
      expect(record.status).toBe("stopped");
      const removalCount = removed.mock.calls.length;
      running.resolve(result);
      resumed.resolve({ text: "late" });
      await pending;
      await record.promise;
      expect(removed).toHaveBeenCalledTimes(removalCount);
    }
  });

  it.each([false, true])("closes stopped resumes once (background=%s)", async (isBackground) => {
    const id = manager.spawn(pi, ctx, "Explore", "run", { description: "run" });
    await manager.getRecord(id)!.promise;
    const resumed = deferred<{ text: string }>();
    vi.mocked(resumeAgent).mockReturnValueOnce(resumed.promise);
    const parentSignal = new AbortController();
    const resume = manager.resume(id, "resume", parentSignal.signal, { isBackground });
    parentSignal.abort();
    expect(manager.getRecord(id)?.status).toBe("stopped");
    assertPairs(events, 2);
    resumed.resolve({ text: "late" });
    await resume;
    await manager.getRecord(id)!.promise;
    assertPairs(events, 2);
    expect(manager.getRecord(id)?.status).toBe("stopped");
  });

  it.each([false, true])("does not let an old background resume signal stop a later run (queued=%s)", async (isQueued) => {
    const id = manager.spawn(pi, ctx, "Explore", "spawn", { description: "resume", isBackground: true });
    await manager.getRecord(id)!.promise;
    const oldSignal = new AbortController();
    const blocker = deferred<typeof result>();
    if (isQueued) {
      vi.mocked(runAgent).mockReturnValueOnce(blocker.promise);
      manager.spawn(pi, ctx, "Explore", "blocker", { description: "blocker", isBackground: true });
    }
    await manager.resume(id, "first", oldSignal.signal, { isBackground: true });
    if (isQueued) expect(manager.getRecord(id)?.status).toBe("queued");
    if (isQueued) {
      blocker.resolve(result);
      await manager.waitForAll();
    } else await manager.getRecord(id)!.promise;
    expect(manager.getRecord(id)?.status).toBe("completed");

    const later = deferred<{ text: string }>();
    vi.mocked(resumeAgent).mockReturnValueOnce(later.promise);
    await manager.resume(id, "second", undefined, { isBackground: true });
    const lastStart = events.at(-1)!;
    expect(lastStart).toMatchObject({ agentId: id, transition: "started" });
    expect(manager.getRecord(id)?.status).toBe("running");
    oldSignal.abort();
    expect(manager.getRecord(id)?.status).toBe("running");
    expect(events.filter(event => event.runId === lastStart.runId)).toEqual([lastStart]);
    later.resolve({ text: "later" });
    await manager.getRecord(id)!.promise;
    expect(manager.getRecord(id)?.status).toBe("completed");
    assertPairs(events, isQueued ? 4 : 3);
  });

  it("does not let an old queued spawn signal stop a later resume", async () => {
    const blocker = deferred<typeof result>();
    vi.mocked(runAgent).mockReturnValueOnce(blocker.promise);
    manager.spawn(pi, ctx, "Explore", "blocker", { description: "blocker", isBackground: true });
    const oldSignal = new AbortController();
    const id = manager.spawn(pi, ctx, "Explore", "spawn", {
      description: "resume", isBackground: true, signal: oldSignal.signal,
    });
    expect(manager.getRecord(id)?.status).toBe("queued");
    blocker.resolve(result);
    await manager.waitForAll();
    expect(manager.getRecord(id)?.status).toBe("completed");
    const later = deferred<{ text: string }>();
    vi.mocked(resumeAgent).mockReturnValueOnce(later.promise);
    await manager.resume(id, "resume", undefined, { isBackground: true });
    const lastStart = events.at(-1)!;
    expect(lastStart).toMatchObject({ agentId: id, transition: "started" });
    expect(manager.getRecord(id)?.status).toBe("running");
    oldSignal.abort();
    expect(manager.getRecord(id)?.status).toBe("running");
    expect(events.filter(event => event.runId === lastStart.runId)).toEqual([lastStart]);
    later.resolve({ text: "later" });
    await manager.getRecord(id)!.promise;
    expect(manager.getRecord(id)?.status).toBe("completed");
    assertPairs(events, 3);
  });

  it.each(["signal", "stop", "abortAll", "dispose"] as const)("detaches queued listeners on %s", async (action) => {
    const id = manager.spawn(pi, ctx, "Explore", "spawn", { description: "resume", isBackground: true });
    await manager.getRecord(id)!.promise;
    const blocker = deferred<typeof result>();
    vi.mocked(runAgent).mockReturnValueOnce(blocker.promise);
    const blockerId = manager.spawn(pi, ctx, "Explore", "blocker", { description: "blocker", isBackground: true });
    const oldSignal = new AbortController();
    const added = vi.spyOn(oldSignal.signal, "addEventListener");
    const removed = vi.spyOn(oldSignal.signal, "removeEventListener");
    await manager.resume(id, "queued", oldSignal.signal, { isBackground: true });
    expect(manager.getRecord(id)?.status).toBe("queued");
    expect(added).toHaveBeenCalledOnce();
    if (action === "signal") oldSignal.abort();
    else if (action === "stop") manager.abort(id);
    else if (action === "abortAll") manager.abortAll();
    else await manager.dispose();
    expect(removed).toHaveBeenCalledExactlyOnceWith("abort", added.mock.calls[0][1]);
    expect(resumeAgent).not.toHaveBeenCalled();
    blocker.resolve(result);
    await manager.getRecord(blockerId)?.promise;
  });

  it.each([false, true])("does not start a pre-aborted background resume (queued=%s)", async (isQueued) => {
    const id = manager.spawn(pi, ctx, "Explore", "spawn", { description: "resume", isBackground: true });
    await manager.getRecord(id)!.promise;
    const blocker = deferred<typeof result>();
    if (isQueued) {
      vi.mocked(runAgent).mockReturnValueOnce(blocker.promise);
      manager.spawn(pi, ctx, "Explore", "blocker", { description: "blocker", isBackground: true });
    }
    const oldSignal = new AbortController();
    oldSignal.abort();
    await manager.resume(id, "cancelled", oldSignal.signal, { isBackground: true });
    expect(manager.getRecord(id)?.status).toBe("stopped");
    expect(resumeAgent).not.toHaveBeenCalled();
    blocker.resolve(result);
    await manager.waitForAll();
    assertPairs(events, isQueued ? 2 : 1);
  });

  it.each([false, true])("cleans up the queued signal through worktree preparation (failure=%s)", async (isFailed) => {
    const blocker = deferred<typeof result>();
    vi.mocked(runAgent).mockReturnValueOnce(blocker.promise);
    const blockerId = manager.spawn(pi, ctx, "Explore", "blocker", { description: "blocker", isBackground: true });
    const preparing = deferred<Awaited<ReturnType<typeof createWorktree>>>();
    vi.mocked(createWorktree).mockReturnValueOnce(preparing.promise);
    const parentSignal = new AbortController();
    const added = vi.spyOn(parentSignal.signal, "addEventListener");
    const removed = vi.spyOn(parentSignal.signal, "removeEventListener");
    const id = manager.spawn(pi, ctx, "Explore", "queued", {
      description: "queued", isBackground: true, isolation: "worktree", signal: parentSignal.signal,
    });
    blocker.resolve(result);
    await manager.getRecord(blockerId)!.promise;
    expect(manager.getRecord(id)?.status).toBe("running");
    expect(removed).not.toHaveBeenCalled();
    if (isFailed) {
      preparing.resolve(null);
      await expect(manager.awaitStartup(id)).rejects.toThrow("Cannot run");
      expect(manager.getRecord(id)?.status).toBe("error");
    } else {
      parentSignal.abort();
      expect(manager.getRecord(id)?.status).toBe("stopped");
      preparing.resolve({ path: "/tmp", branch: "test", baseSha: "sha", workPath: "/tmp" });
      await manager.awaitStartup(id);
    }
    expect(removed).toHaveBeenCalledExactlyOnceWith("abort", added.mock.calls[0][1]);
    expect(runAgent).toHaveBeenCalledOnce();
    assertPairs(events, 1);
  });

  it("cancels queued resumes on parent abort without reporting another execution", async () => {
    const id = manager.spawn(pi, ctx, "Explore", "run", { description: "run", isBackground: true });
    await manager.getRecord(id)!.promise;
    const blocker = deferred<typeof result>();
    vi.mocked(runAgent).mockReturnValueOnce(blocker.promise);
    manager.spawn(pi, ctx, "Explore", "blocker", { description: "blocker", isBackground: true });
    const parentSignal = new AbortController();
    await manager.resume(id, "resume", parentSignal.signal, { isBackground: true });
    parentSignal.abort();
    expect(manager.getRecord(id)?.status).toBe("stopped");
    blocker.resolve(result);
    await manager.waitForAll();
    assertPairs(events, 2);
    expect(resumeAgent).not.toHaveBeenCalled();
  });

  it.each([false, true])("failed resume closes once (background=%s)", async (isBackground) => {
    const id = manager.spawn(pi, ctx, "Explore", "run", { description: "run" });
    await manager.getRecord(id)!.promise;
    vi.mocked(resumeAgent).mockRejectedValueOnce(new Error("resume failed"));
    await manager.resume(id, "resume", undefined, { isBackground });
    await manager.getRecord(id)!.promise;
    assertPairs(events, 2);
    expect(events[3]).toMatchObject({ transition: "failed", status: "error" });
  });

  it("captures dispatch root identity before queued work starts", async () => {
    const run = deferred<typeof result>();
    vi.mocked(runAgent).mockReturnValueOnce(run.promise);
    manager.spawn(pi, ctx, "Explore", "blocker", { description: "blocker", isBackground: true });
    let sessionId = "dispatch-root";
    const dispatchCtx = { ...ctx, sessionManager: { getSessionId: () => sessionId } } as ExtensionContext;
    const id = manager.spawn(pi, dispatchCtx, "Explore", "queued", { description: "queued", isBackground: true });
    sessionId = "next-session";
    run.resolve(result);
    await manager.waitForAll();
    assertPairs(events, 2);
    expect(events.filter(event => event.agentId === id).map(event => event.rootSessionId)).toEqual(["dispatch-root", "dispatch-root"]);
  });

  it("abortAll closes each active execution once and leaves queued work unstarted", async () => {
    const first = deferred<typeof result>();
    const second = deferred<typeof result>();
    vi.mocked(runAgent).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const a = manager.spawn(pi, ctx, "Explore", "a", { description: "a", isBackground: true });
    const b = manager.spawn(pi, childCtx, "Explore", "b", { description: "b", parentAgentId: a });
    manager.spawn(pi, ctx, "Explore", "queue", { description: "queue", isBackground: true });
    expect(manager.abortAll()).toBe(3);
    expect(manager.abortAll()).toBe(0);
    assertPairs(events, 2);
    first.resolve(result);
    second.resolve(result);
    await Promise.all([manager.getRecord(a)!.promise, manager.getRecord(b)!.promise]);
    assertPairs(events, 2);
    expect(completes).toHaveBeenCalledTimes(2);
  });

  it("refuses overlapping resumes even after stop until the old execution settles", async () => {
    const run = deferred<typeof result>();
    vi.mocked(runAgent).mockReturnValueOnce(run.promise);
    const id = manager.spawn(pi, ctx, "Explore", "run", { description: "run" });
    manager.getRecord(id)!.session = session;
    expect(await manager.resume(id, "overlap")).toBeUndefined();
    manager.abort(id);
    expect(await manager.resume(id, "overlap", undefined, { isBackground: true })).toBeUndefined();
    run.resolve(result);
    await manager.getRecord(id)!.promise;
    assertPairs(events, 1);
    expect(resumeAgent).not.toHaveBeenCalled();
  });

  it("shutdown closes active runs, never launches the queue, and tolerates late settlement", async () => {
    const run = deferred<typeof result>();
    vi.mocked(runAgent).mockReturnValueOnce(run.promise);
    const id = manager.spawn(pi, ctx, "Explore", "run", { description: "run", isBackground: true });
    const pending = manager.getRecord(id)!.promise;
    manager.spawn(pi, ctx, "Explore", "queued", { description: "queued", isBackground: true });
    await manager.dispose();
    assertPairs(events, 1);
    expect(events[1]).toMatchObject({ transition: "stopped", status: "stopped" });
    run.resolve(result);
    await pending;
    assertPairs(events, 1);
    expect(runAgent).toHaveBeenCalledOnce();
  });
});

describe("persisted root identity through owner dispatch", () => {
  it("reopens native transcripts and retains the root through separate-manager nesting and workflow resume", async () => {
    const directory = mkdtempSync(join(tmpdir(), "pi-persisted-root-"));
    const rootEvents: RunActivity[] = [];
    const childEvents: RunActivity[] = [];
    const rootManager = new AgentManager((_record, activity) => {
      if (activity) rootEvents.push(activity);
    }, 1, (_record, activity) => {
      if (activity) rootEvents.push(activity);
    }, undefined, undefined, true);
    const childManager = new AgentManager((_record, activity) => {
      if (activity) childEvents.push(activity);
    }, 1, (_record, activity) => {
      if (activity) childEvents.push(activity);
    }, undefined, undefined, true);
    vi.mocked(runAgent).mockReset().mockResolvedValue(result);
    vi.mocked(resumeAgent).mockReset().mockResolvedValue({ text: "resumed" });
    try {
      const reopened = ["root", "child"].map(name => {
        const created = codingAgent.SessionManager.create(directory, join(directory, name));
        created.appendMessage({ role: "user", content: `persist ${name}`, timestamp: Date.now() });
        created.appendMessage({
          role: "assistant", content: [{ type: "text", text: `saved ${name}` }],
          api: "anthropic-messages", provider: "anthropic", model: "fixture",
          usage: {
            input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0,
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
          },
          stopReason: "stop", timestamp: Date.now(),
        });
        const file = created.getSessionFile()!;
        expect(existsSync(file)).toBe(true);
        const persistedHeader = JSON.parse(readFileSync(file, "utf8").split("\n")[0]);
        const opened = codingAgent.SessionManager.open(file);
        expect(opened.isPersisted()).toBe(true);
        expect(opened.getSessionId()).toBe(persistedHeader.id);
        expect(opened.getSessionId()).toBe(created.getSessionId());
        expect(opened.getSessionFile()).toBe(file);
        expect(opened.buildSessionContext().messages).toMatchObject([
          { role: "user", content: `persist ${name}` },
          { role: "assistant", content: [{ type: "text", text: `saved ${name}` }] },
        ]);
        return opened;
      });
      const [rootSession, childSession] = reopened;
      const rootId = rootSession.getSessionId();
      expect(childSession.getSessionId()).not.toBe(rootId);
      const rootContext = { ...ctx, cwd: directory, sessionManager: rootSession } as ExtensionContext;
      const childContext = { ...ctx, cwd: directory, sessionManager: childSession } as ExtensionContext;
      const parent = rootManager.spawn(pi, rootContext, "Explore", "parent", { description: "parent" });
      await rootManager.getRecord(parent)!.promise;
      const [nestedTool] = createNestedSubagentTools({
        manager: {
          spawn: childManager.spawn.bind(childManager),
          spawnAndWait: childManager.spawnAndWait.bind(childManager),
          awaitStartup: childManager.awaitStartup.bind(childManager),
          resume: childManager.resume.bind(childManager),
          getRecord: id => rootManager.getRecord(id) ?? childManager.getRecord(id),
        },
        pi, parentAgentId: parent, depth: 1, maxSubagentDepth: 2,
        allowedSubagents: "all", configCwd: directory,
      });
      const nestedResult = await nestedTool.execute("nested-call", {
        subagent_type: "Explore", description: "nested", prompt: "nested",
      }, undefined, undefined, childContext);
      expect(nestedResult.isError).toBe(false);
      expect(runAgent).toHaveBeenLastCalledWith(childContext, "Explore", "nested", expect.objectContaining({ nested: true }));
      const host = createWorkflowHost({
        pi, ctx: childContext, manager: childManager, rootSessionId: rootId, workflowId: "persisted-workflow",
      });
      await expect(host.spawnAgent({
        agentId: "workflow-child", index: 0, agentType: "Explore", prompt: "workflow", label: "workflow",
      })).resolves.toMatchObject({ ok: true, text: "done" });
      await expect(host.resumeAgent("workflow-child", "continue")).resolves.toMatchObject({ ok: true, text: "resumed" });
      assertPairs(rootEvents, 1);
      assertPairs(childEvents, 3);
      expect([...rootEvents, ...childEvents].map(event => event.rootSessionId)).toEqual(Array(8).fill(rootId));
      const nestedEvents = childEvents.filter(event => event.parentAgentId === parent);
      expect(nestedEvents.map(event => event.transition)).toEqual(["started", "completed"]);
      const workflowEvents = childEvents.filter(event => event.workflowId === "persisted-workflow");
      assertPairs(workflowEvents, 2);
      expect(workflowEvents.map(event => event.agentId)).toEqual(Array(4).fill(workflowEvents[0].agentId));
      expect(workflowEvents[0].runId).not.toBe(workflowEvents[2].runId);
    } finally {
      await rootManager.dispose();
      await childManager.dispose();
      vi.clearAllMocks();
      rmSync(directory, { recursive: true, force: true });
    }
  });
});

describe("actual runner prompt cancellation boundaries", () => {
  let actual: typeof agentRunner;
  let instrumented: AgentSession;
  let prompt: ReturnType<typeof vi.fn<AgentSession["prompt"]>>;
  let unsubscribes: Array<ReturnType<typeof vi.fn>>;
  let createSession: ReturnType<typeof vi.spyOn<typeof codingAgent, "createAgentSession">>;
  const runnerCtx = { ...ctx, getSystemPrompt: () => "parent", modelRegistry: {} } as ExtensionContext;

  beforeEach(async () => {
    actual = await vi.importActual<typeof agentRunner>("../src/agent-runner.js");
    prompt = vi.fn<AgentSession["prompt"]>().mockResolvedValue(undefined);
    unsubscribes = [];
    instrumented = {
      messages: [], prompt, abort: vi.fn<AgentSession["abort"]>().mockResolvedValue(undefined),
      subscribe: vi.fn(() => {
        const unsubscribe = vi.fn();
        unsubscribes.push(unsubscribe);
        return unsubscribe;
      }),
      setSessionName: vi.fn(), bindExtensions: vi.fn().mockResolvedValue(undefined), dispose: vi.fn(),
    } as unknown as AgentSession;
    vi.spyOn(environment, "detectEnv").mockResolvedValue({ isGitRepo: false, branch: "", platform: process.platform });
    vi.spyOn(codingAgent.SettingsManager, "create").mockReturnValue(codingAgent.SettingsManager.inMemory());
    vi.spyOn(codingAgent.SessionManager, "create").mockImplementation(cwd => codingAgent.SessionManager.inMemory(cwd));
    vi.spyOn(codingAgent.DefaultResourceLoader.prototype, "reload").mockResolvedValue(undefined);
    createSession = vi.spyOn(codingAgent, "createAgentSession").mockResolvedValue({
      session: instrumented,
    } as Awaited<ReturnType<typeof codingAgent.createAgentSession>>);
  });

  afterEach(() => vi.restoreAllMocks());

  it("does not launch a prompt when the parent aborts during actual runAgent session construction", async () => {
    const entered = deferred<void>();
    const gate = deferred<void>();
    createSession.mockImplementationOnce(async () => {
      entered.resolve();
      await gate.promise;
      return { session: instrumented } as Awaited<ReturnType<typeof codingAgent.createAgentSession>>;
    });
    const events: RunActivity[] = [];
    const manager = new AgentManager((_record, activity) => {
      if (activity) events.push(activity);
    }, 1, (_record, activity) => {
      if (activity) events.push(activity);
    }, undefined, undefined, true);
    vi.mocked(runAgent).mockImplementationOnce(actual.runAgent);
    const parent = new AbortController();
    try {
      const id = manager.spawn(pi, runnerCtx, "Explore", "cancelled", {
        description: "cancelled", isolated: true, signal: parent.signal,
      });
      await entered.promise;
      parent.abort();
      gate.resolve();
      await manager.getRecord(id)!.promise;
      expect(prompt).not.toHaveBeenCalled();
      expect(manager.getRecord(id)?.status).toBe("stopped");
      assertPairs(events, 1);
      expect(unsubscribes).toHaveLength(2);
      for (const unsubscribe of unsubscribes) expect(unsubscribe).toHaveBeenCalledOnce();
    } finally {
      gate.resolve();
      await manager.dispose();
    }
    expect(instrumented.dispose).toHaveBeenCalledOnce();
  });

  it("skips an actual runAgent initial prompt and structured retry for an already-aborted signal", async () => {
    const parent = new AbortController();
    parent.abort();
    const added = vi.spyOn(parent.signal, "addEventListener");
    const removed = vi.spyOn(parent.signal, "removeEventListener");
    const outcome = await actual.runAgent(runnerCtx, "Explore", "cancelled", {
      pi, isolated: true, signal: parent.signal, structuredOutput: compileJsonSchema({ type: "object" }),
    });
    expect(createSession).toHaveBeenCalledOnce();
    expect(prompt).not.toHaveBeenCalled();
    expect(outcome.session).toBe(instrumented);
    expect(outcome.responseText).toBe("");
    expect(outcome.structuredRetried).toBeUndefined();
    expect(unsubscribes).toHaveLength(2);
    for (const unsubscribe of unsubscribes) expect(unsubscribe).toHaveBeenCalledOnce();
    for (const registration of added.mock.calls) expect(removed).toHaveBeenCalledWith("abort", registration[1]);
    expect(instrumented.dispose).not.toHaveBeenCalled();
  });

  it("skips an actual resumeAgent prompt for an already-aborted signal and detaches all subscriptions", async () => {
    const parent = new AbortController();
    parent.abort();
    const added = vi.spyOn(parent.signal, "addEventListener");
    const removed = vi.spyOn(parent.signal, "removeEventListener");
    const outcome = await actual.resumeAgent(instrumented, "cancelled", {
      signal: parent.signal, onToolActivity: vi.fn(),
    });
    expect(prompt).not.toHaveBeenCalled();
    expect(outcome).toEqual({ text: "", failure: undefined });
    expect(unsubscribes).toHaveLength(2);
    for (const unsubscribe of unsubscribes) expect(unsubscribe).toHaveBeenCalledOnce();
    for (const registration of added.mock.calls) expect(removed).toHaveBeenCalledWith("abort", registration[1]);
    expect(instrumented.dispose).not.toHaveBeenCalled();
  });

  it("does not launch an actual structured retry after cancellation during the initial prompt", async () => {
    const parent = new AbortController();
    prompt.mockImplementationOnce(async () => { parent.abort(); });
    const outcome = await actual.runAgent(runnerCtx, "Explore", "run", {
      pi, isolated: true, signal: parent.signal, structuredOutput: compileJsonSchema({ type: "object" }),
    });
    expect(prompt).toHaveBeenCalledExactlyOnceWith("run");
    expect(outcome.structuredRetried).toBeUndefined();
    for (const unsubscribe of unsubscribes) expect(unsubscribe).toHaveBeenCalledOnce();
  });
});

describe("root extension bus and presentation", () => {
  let directory: string;
  let originalCwd: string;
  let originalHome: string | undefined;
  let originalAgentDir: string | undefined;
  let lifecycle: Map<string, (...args: unknown[]) => unknown>;
  let api: ExtensionAPI;
  let emit: ReturnType<typeof vi.fn>;
  let appendEntry: ReturnType<typeof vi.fn>;
  let sendMessage: ReturnType<typeof vi.fn>;
  let manager: AgentManager;

  beforeEach(async () => {
    directory = mkdtempSync(join(tmpdir(), "pi-run-lifecycle-"));
    originalCwd = process.cwd();
    originalHome = process.env.HOME;
    originalAgentDir = process.env.PI_CODING_AGENT_DIR;
    process.env.HOME = directory;
    process.env.PI_CODING_AGENT_DIR = directory;
    mkdirSync(join(directory, ".pi"));
    writeFileSync(join(directory, ".pi", "subagents.json"), JSON.stringify({ schedulingEnabled: false, outputTranscript: false }));
    process.chdir(directory);
    lifecycle = new Map();
    emit = vi.fn();
    appendEntry = vi.fn();
    sendMessage = vi.fn();
    api = {
      events: { emit, on: vi.fn(() => vi.fn()) },
      on: vi.fn((name, handler) => lifecycle.set(name, handler)),
      registerMessageRenderer: vi.fn(), registerEntryRenderer: vi.fn(), registerFlag: vi.fn(), getFlag: vi.fn(),
      registerTool: vi.fn(), registerCommand: vi.fn(), appendEntry, sendMessage,
    } as unknown as ExtensionAPI;
    subagentsExtension(api);
    await lifecycle.get("session_start")!({}, { ...ctx, cwd: directory, hasUI: false });
    vi.mocked(runAgent).mockImplementation((_ctx, _type, _prompt, options) => {
      manager = options.nestedRuntime!.manager;
      return Promise.resolve(result);
    });
  });

  afterEach(async () => {
    await lifecycle.get("session_shutdown")?.();
    process.chdir(originalCwd);
    if (originalHome === undefined) delete process.env.HOME;
    else process.env.HOME = originalHome;
    if (originalAgentDir === undefined) delete process.env.PI_CODING_AGENT_DIR;
    else process.env.PI_CODING_AGENT_DIR = originalAgentDir;
    rmSync(directory, { recursive: true, force: true });
    vi.clearAllMocks();
  });

  it("emits owned activity before filtering, with unchanged top-level events and exactly one summary", async () => {
    const registry = Reflect.get(globalThis, Symbol.for("pi-subagents:manager")) as { spawn: AgentManager["spawn"] };
    const id = registry.spawn(api, ctx, "Explore", "root", { description: "root", isBackground: true });
    await manager.getRecord(id)!.promise;
    const nested = manager.spawn(api, childCtx, "Explore", "nested", { description: "nested", parentAgentId: id });
    const workflow = manager.spawn(api, ctx, "Explore", "workflow", { description: "workflow", workflowId: "wf-real" });
    await Promise.all([manager.getRecord(nested)!.promise, manager.getRecord(workflow)!.promise]);
    const events = emit.mock.calls.filter(call => call[0] === "subagents:run-activity").map(call => call[1] as RunActivity);
    assertPairs(events, 3);
    expect(events.every(event => event.rootSessionId === "root")).toBe(true);
    expect(emit.mock.calls.filter(call => call[0] === "subagents:started")).toEqual([
      ["subagents:started", { id, type: "Explore", description: "root" }],
    ]);
    expect(emit.mock.calls.filter(call => call[0] === "subagents:completed")).toHaveLength(1);
    expect(appendEntry).toHaveBeenCalledOnce();
    expect(appendEntry.mock.calls[0][0]).toBe("subagents:record");
    await new Promise(resolve => setTimeout(resolve, 250));
    expect(sendMessage).toHaveBeenCalledOnce();
    const channels = emit.mock.calls.map(call => call[0]);
    expect(channels.indexOf("subagents:run-activity")).toBeLessThan(channels.indexOf("subagents:started"));
  });

  it("preserves failed top-level notification behavior", async () => {
    vi.mocked(runAgent).mockImplementation((_ctx, _type, _prompt, options) => {
      manager = options.nestedRuntime!.manager;
      return Promise.reject(new Error("failed"));
    });
    const registry = Reflect.get(globalThis, Symbol.for("pi-subagents:manager")) as { spawn: AgentManager["spawn"] };
    const id = registry.spawn(api, ctx, "Explore", "root", { description: "root", isBackground: true });
    await manager.getRecord(id)!.promise;
    expect(emit.mock.calls.filter(call => call[0] === "subagents:failed")).toHaveLength(1);
    expect(emit.mock.calls.filter(call => call[0] === "subagents:completed")).toHaveLength(0);
    expect(appendEntry).toHaveBeenCalledOnce();
    const events = emit.mock.calls.filter(call => call[0] === "subagents:run-activity").map(call => call[1] as RunActivity);
    assertPairs(events, 1);
    expect(events[1]).toMatchObject({ transition: "failed", status: "error" });
    await new Promise(resolve => setTimeout(resolve, 250));
    expect(sendMessage).toHaveBeenCalledOnce();
  });

  it("foreground resume emits activity without adding top-level events or summaries", async () => {
    const registry = Reflect.get(globalThis, Symbol.for("pi-subagents:manager")) as { spawn: AgentManager["spawn"] };
    const id = registry.spawn(api, ctx, "Explore", "root", { description: "root" });
    await manager.getRecord(id)!.promise;
    vi.mocked(resumeAgent).mockResolvedValueOnce({ text: "resumed" });
    await manager.resume(id, "resume");
    const events = emit.mock.calls.filter(call => call[0] === "subagents:run-activity").map(call => call[1] as RunActivity);
    assertPairs(events, 2);
    expect(emit.mock.calls.filter(call => call[0] === "subagents:started")).toHaveLength(1);
    expect(emit.mock.calls.filter(call => call[0] === "subagents:completed")).toHaveLength(1);
    expect(appendEntry).toHaveBeenCalledOnce();
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("shutdown emits root activity while presentation waits for late settlement", async () => {
    const run = deferred<typeof result>();
    vi.mocked(runAgent).mockImplementation((_ctx, _type, _prompt, options) => {
      manager = options.nestedRuntime!.manager;
      return run.promise;
    });
    const registry = Reflect.get(globalThis, Symbol.for("pi-subagents:manager")) as { spawn: AgentManager["spawn"] };
    const id = registry.spawn(api, ctx, "Explore", "root", { description: "root", isBackground: true });
    const pending = manager.getRecord(id)!.promise;
    await lifecycle.get("session_shutdown")!();
    const activityCalls = () => emit.mock.calls.filter(call => call[0] === "subagents:run-activity").map(call => call[1] as RunActivity);
    assertPairs(activityCalls(), 1);
    expect(activityCalls()[1]).toMatchObject({ rootSessionId: "root", transition: "stopped", status: "stopped" });
    expect(appendEntry).not.toHaveBeenCalled();
    run.resolve(result);
    await pending;
    assertPairs(activityCalls(), 1);
    expect(appendEntry).toHaveBeenCalledOnce();
    expect(emit.mock.calls.filter(call => call[0] === "subagents:failed")).toHaveLength(1);
  });

  it("does not activate another manager or emit invitation activity from child extensions", async () => {
    const childApi = { ...api, on: vi.fn(), events: { emit: vi.fn(), on: vi.fn() } } as unknown as ExtensionAPI;
    await runInChildSessionContext(async () => { subagentsExtension(childApi); });
    expect(childApi.on).not.toHaveBeenCalled();
    expect(childApi.events.emit).not.toHaveBeenCalled();
  });
});
