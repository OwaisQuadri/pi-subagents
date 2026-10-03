import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { open } from "node:fs/promises";
import { join } from "node:path";
import { type AgentSession, type ExtensionAPI, getShellConfig } from "@earendil-works/pi-coding-agent";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AgentManager } from "../src/agent-manager.js";
import { resumeAgent, runAgent } from "../src/agent-runner.js";
import { TaskAuthority } from "../src/task-worktree.js";
import { createWorkflowHost } from "../src/workflow/host.js";
import type { WorkflowJournalEntry } from "../src/workflow/journal.js";
import { runWorkflow, type WorkflowControl, type WorkflowSpawnRequest } from "../src/workflow/runtime.js";
import { ctx } from "./helpers/boot-extension.js";
import { fixtureDirectory, taskHelper, taskHelperTitle } from "./helpers/task-fixture.js";

vi.mock("../src/agent-runner.js", () => ({ runAgent: vi.fn(), resumeAgent: vi.fn() }));
vi.setConfig({ testTimeout: 30_000 });
const binary = taskHelper();
const HEAD = 'export const meta = { name: "probe", description: "gate" };\n';
const request = (overrides: Partial<WorkflowSpawnRequest> = {}): WorkflowSpawnRequest => ({
  agentId: "wf-agent-0", index: 0, prompt: "edit", label: "fix", agentType: "general-purpose", ...overrides,
});

describe.skipIf(!binary)(taskHelperTitle("workflow task gates and retained ownership"), () => {
  let manager: AgentManager;
  let repository: string;
  let storage: string;
  let base: string;
  let pi: ExtensionAPI;
  let disposalError: RegExp | undefined;
  const releases: (() => void)[] = [];
  const git = (...args: string[]) => execFileSync("git", args, { cwd: repository, encoding: "utf8", stdio: "pipe" }).trim();
  const host = () => createWorkflowHost({ pi, ctx: ctx({ cwd: repository }), manager, taskSnapshot: manager.getTaskBinding() });
  const run = (body: string, extra: Partial<Parameters<typeof runWorkflow>[0]> = {}) => runWorkflow({ script: HEAD + body, host: host(), ...extra });
  const busy = async () => {
    const authority = new TaskAuthority({ binary, storage });
    try { await expect(authority.claim({ repository, task_id: "A", generation: 1 }, "write", "competitor")).rejects.toThrow("TaskBusy"); }
    finally { await authority.close(); }
  };

  beforeEach(async () => {
    disposalError = undefined;
    const directory = fixtureDirectory("gate");
    repository = join(directory, "repository"); storage = join(directory, "storage"); mkdirSync(repository);
    git("init"); git("config", "user.name", "Fixture"); git("config", "user.email", "fixture@example.invalid");
    writeFileSync(join(repository, "source.txt"), "parent"); git("add", "source.txt"); git("commit", "-m", "base"); base = git("rev-parse", "HEAD");
    pi = { exec: vi.fn(() => { throw new Error("unowned command"); }) } as unknown as ExtensionAPI;
    manager = new AgentManager(undefined, undefined, undefined, undefined, undefined, false, { binary, storage });
    await manager.bindTask(repository, "A", { base_oid: base });
    vi.mocked(runAgent).mockReset().mockImplementation(async (_ctx, _type, _prompt, options) => {
      writeFileSync(join(options.cwd!, "source.txt"), "child");
      const session = { dispose() {} } as AgentSession; options.onSessionCreated?.(session);
      return { responseText: "done", session, aborted: false, steered: false };
    });
    vi.mocked(resumeAgent).mockReset().mockResolvedValue({ text: "resumed" });
  });
  afterEach(async () => {
    for (const release of releases.splice(0)) release();
    try {
      if (disposalError) await expect(manager.dispose()).rejects.toThrow(disposalError);
      else await manager.dispose();
    } finally { vi.restoreAllMocks(); }
  });

  it("runs the gate inside the child's verified checkout and retains it", async () => {
    const result = await host().spawnAgent(request({ isolation: "worktree", gate: 'test "$(cat source.txt)" = child && printf "3 passing"' }));
    const record = manager.listAgents()[0];
    expect(result.ok).toBe(true); expect(result.gate).toEqual({ ok: true, output: "3 passing" });
    expect(result.cwd).toBe(record.taskSnapshot?.checkout); expect(result.cwd).not.toBe(repository);
    expect(existsSync(result.cwd!)).toBe(true); expect(record.worktree).toBeUndefined();
    expect(readFileSync(join(repository, "source.txt"), "utf8")).toBe("parent"); expect(pi.exec).not.toHaveBeenCalled();
    const allocation = vi.spyOn(Buffer, "alloc");
    const bounded = await host().spawnAgent(request({ gate: "printf '%.0sA' {1..16000}; printf stdout-end; printf '%.0sB' {1..16000} >&2; printf stderr-end >&2" }));
    expect(bounded.gate?.output).toContain("stdout-end"); expect(bounded.gate?.output).toContain("stderr-end");
    expect(bounded.gate?.output.length).toBeLessThan(26_000);
    expect(allocation.mock.calls.filter(call => call[0] === 12_800)).toHaveLength(2);
  });
  it("runs the gate through Pi's native shell resolution in the child's config root", async () => {
    const previousAgentDir = process.env.PI_CODING_AGENT_DIR;
    // An empty agent directory, so the user's global shellPath cannot stand in for the default.
    process.env.PI_CODING_AGENT_DIR = join(storage, "..", "agent");
    try {
      const runs = vi.spyOn(TaskAuthority.prototype, "run");
      const split = await host().spawnAgent(request({ gate: 'x="a b"; set -- $x; printf "%s words" "$#"; test "$#" -eq 2' }));
      expect(split.gate).toEqual({ ok: true, output: "2 words" });
      const { shell, args } = getShellConfig();
      expect(runs.mock.calls[0][2].argv).toEqual([shell, ...args, expect.stringContaining("set -- $x")]);
      mkdirSync(join(repository, ".pi"), { recursive: true });
      writeFileSync(join(repository, ".pi/settings.json"), JSON.stringify({ shellPath: "/bin/sh" }));
      const configured = await host().spawnAgent(request({ agentId: "wf-agent-1", index: 1, gate: "printf configured" }));
      expect(configured.gate).toEqual({ ok: true, output: "configured" });
      expect(runs.mock.calls[1][2].argv).toEqual(["/bin/sh", "-c", "printf configured"]);
    } finally {
      if (previousAgentDir === undefined) delete process.env.PI_CODING_AGENT_DIR; else process.env.PI_CODING_AGENT_DIR = previousAgentDir;
    }
  });
  it("fails with actual gate evidence without discarding the child checkout", async () => {
    const result = await run('return await agent("edit", { gate: "printf failure >&2; exit 7" });');
    expect(result.value).toBeNull(); expect(result.progress.at(-1)).toMatchObject({ state: "error", error: "failure" });
    expect(existsSync(manager.listAgents()[0].taskSnapshot!.checkout)).toBe(true);
  });
  it("names a silent failing command", async () => {
    const result = await run('return await agent("edit", { gate: "exit 7" });');
    expect(result.progress.at(-1)).toMatchObject({ error: "Gate command failed: exit 7" });
  });
  it("counts a timed out gate as failed", async () => {
    expect(() => createWorkflowHost({ pi, ctx: ctx({ cwd: repository }), manager, gateTimeoutMs: Infinity })).toThrow(/timeout/);
    const result = await createWorkflowHost({ pi, ctx: ctx({ cwd: repository }), manager, taskSnapshot: manager.getTaskBinding(), gateTimeoutMs: 40 }).spawnAgent(request({ gate: "sleep 999" }));
    expect(result.gate?.ok).toBe(false); expect(result.gate?.output).toContain("timed out");
    const killed = await host().spawnAgent(request({ gate: "kill -KILL $$" }));
    expect(killed.gate?.ok).toBe(false); expect(killed.gate?.output).toContain("did not settle successfully");
  });
  it("treats a gate that could not run as failed rather than falling back", async () => {
    const original = TaskAuthority.prototype.run;
    const runs = vi.spyOn(TaskAuthority.prototype, "run").mockImplementationOnce(async () => { throw new Error("fixture launch failed"); });
    const result = await run('return await agent("edit", { gate: "true" });');
    expect(result.value).toBeNull(); expect(result.progress.at(-1)).toMatchObject({ error: "fixture launch failed" });
    expect(runs).toHaveBeenCalledTimes(1); runs.mockImplementation(original); expect(pi.exec).not.toHaveBeenCalled();
  });
  it("gates a steered child", async () => {
    vi.mocked(runAgent).mockResolvedValueOnce({ responseText: "steered", session: { dispose() {} } as AgentSession, aborted: false, steered: true });
    const result = await host().spawnAgent(request({ gate: "printf verified" }));
    expect(result.ok).toBe(true); expect(result.gate).toEqual({ ok: true, output: "verified" });
  });
  it("skips the gate for a failed worker", async () => {
    vi.mocked(runAgent).mockResolvedValueOnce({ responseText: "", session: { dispose() {} } as AgentSession, aborted: false, steered: false, failure: "provider exploded" });
    const runs = vi.spyOn(TaskAuthority.prototype, "run");
    const result = await host().spawnAgent(request({ gate: "true" }));
    expect(result).toMatchObject({ ok: false, error: "provider exploded" }); expect(result.gate).toBeUndefined(); expect(runs).not.toHaveBeenCalled();
  });
  it("gates a child without a legacy isolation option exactly once", async () => {
    const runs = vi.spyOn(TaskAuthority.prototype, "run");
    const result = await run('return await agent("edit", { gate: "test $(cat source.txt) = child" });');
    expect(result.value).toBe("done"); expect(runs).toHaveBeenCalledTimes(1);
    expect(runs.mock.calls[0][2].cwd).toBe(manager.listAgents()[0].taskSnapshot?.checkout);
  });
  it("retains ungated work without an automatic commit or legacy branch", async () => {
    const result = await host().spawnAgent(request({ isolation: "worktree" }));
    const record = manager.listAgents()[0]; expect(result.ok).toBe(true); expect(record.worktreeResult).toBeUndefined();
    expect(readFileSync(join(record.taskSnapshot!.checkout, "source.txt"), "utf8")).toBe("child");
    expect(execFileSync("git", ["rev-parse", "HEAD"], { cwd: record.taskSnapshot!.checkout, encoding: "utf8" }).trim()).toBe(base);
  });

  it("captures A before rebind B; explicit independent IDs resolve from the original repository", async () => {
    const captured = host(); const a = manager.getTaskBinding()!;
    await manager.bindTask(repository, "B", { base_oid: base });
    const result = await captured.spawnAgent(request()); expect(result.ok).toBe(true); expect(manager.listAgents()[0].taskSnapshot).toEqual(a);
    const independent = await captured.spawnAgent(request({ agentId: "wf-agent-1", index: 1, task_id: "B", task_access: "write" }));
    expect(independent.ok).toBe(true); expect(manager.listAgents().find(record => record.taskSnapshot?.task_id === "B")?.taskSnapshot?.task_id).toBe("B");
    expect(manager.listAgents().find(record => record.taskSnapshot?.task_id === "B")?.taskSnapshot?.repository).toBe(repository);
    const unboundContext = ctx({ cwd: repository });
    const unbound = createWorkflowHost({ pi, ctx: unboundContext, manager });
    Object.assign(unboundContext, { cwd: a.checkout });
    expect((await unbound.spawnAgent(request())).ok).toBe(false);
    const explicit = await unbound.spawnAgent(request({ task_id: "B" }));
    expect(explicit.ok).toBe(true); expect(explicit.taskSnapshot?.repository).toBe(repository);
  });
  it("retry keeps an explicit child's task and selected pair after parent rebind", async () => {
    await manager.captureTaskSnapshot(repository, "B", { base_oid: base });
    const selected = { id: "first", provider: "fixture" };
    const context = ctx({ cwd: repository, model: selected, thinkingLevel: "medium" });
    const captured = createWorkflowHost({ pi, ctx: context, manager, taskSnapshot: manager.getTaskBinding() });
    let control!: WorkflowControl; let enteredWorker!: () => void;
    const entered = new Promise<void>(resolve => { enteredWorker = resolve; });
    vi.mocked(runAgent).mockImplementationOnce(async (_ctx, _type, _prompt, options) => {
      enteredWorker();
      await new Promise<void>(resolve => { releases.push(resolve); options.signal!.addEventListener("abort", () => resolve(), { once: true }); });
      return { responseText: "stopped", session: { dispose() {} } as AgentSession, aborted: false, steered: false };
    });
    const pending = run('return await agent("edit", { task_id: "B", task_access: "write" });', { host: captured, onControl: value => { control = value; } });
    await entered; expect(runAgent).toHaveBeenCalledTimes(1);
    const snapshot = manager.listAgents()[0].taskSnapshot;
    await manager.bindTask(repository, "C", { base_oid: base });
    Object.assign(context, { model: { id: "later", provider: "fixture" }, thinkingLevel: "high" });
    expect(control.retry(0)).toBe(true);
    const result = await pending; expect(result.value).toBe("done"); expect(runAgent).toHaveBeenCalledTimes(2);
    expect(manager.listAgents().every(record => record.taskSnapshot?.task_id === "B")).toBe(true);
    expect(manager.listAgents().every(record => record.taskSnapshot?.checkout === snapshot?.checkout)).toBe(true);
    expect(vi.mocked(runAgent).mock.calls[1][3]).toMatchObject({ model: selected, thinkingLevel: "medium" });
  });
  it("held gates reject same-task writers while independent writers run", async () => {
    await manager.captureTaskSnapshot(repository, "B", { base_oid: base });
    const captured = host(); let isEntered = false; let release!: () => void;
    const held = new Promise<void>(resolve => { release = resolve; }); releases.push(release);
    const original = TaskAuthority.prototype.run;
    vi.spyOn(TaskAuthority.prototype, "run").mockImplementationOnce(async function(...args) { isEntered = true; await held; return original.apply(this, args); });
    const pending = captured.spawnAgent(request({ gate: "true" })); await vi.waitFor(() => expect(isEntered).toBe(true)); await busy();
    const independent = await captured.spawnAgent(request({ agentId: "wf-agent-1", index: 1, task_id: "B" })); expect(independent.ok).toBe(true);
    release(); expect((await pending).gate?.ok).toBe(true);
  });
  it("failed gate resume reacquires a token and runs the retained gate exactly once", async () => {
    const tokens: string[] = []; const original = TaskAuthority.prototype.claim;
    vi.spyOn(TaskAuthority.prototype, "claim").mockImplementation(async function(...args) { const record = await original.apply(this, args); tokens.push(record.token); return record; });
    const runs = vi.spyOn(TaskAuthority.prototype, "run");
    const result = await run('await agent("edit", { label: "fix", gate: "test -f repaired" }); return await agent("repair", { resume: "fix" });');
    expect(result.status).toBe("completed"); expect(result.value).toBeNull(); expect(resumeAgent).toHaveBeenCalledTimes(1);
    expect(runs).toHaveBeenCalledTimes(2); expect(tokens).toHaveLength(2); expect(tokens[0]).not.toBe(tokens[1]);
    expect(manager.listAgents()).toHaveLength(1); expect(manager.listAgents()[0].taskSnapshot?.task_id).toBe("A");
  });
  it("skip during a gate cancels the owned command and waits for quiet settlement", async () => {
    const runs = vi.spyOn(TaskAuthority.prototype, "run"); let control!: WorkflowControl;
    const pending = run('return await agent("edit", { gate: "sleep 2" });', { onControl: value => { control = value; } });
    await vi.waitFor(() => expect(runs).toHaveBeenCalledTimes(1)); await busy(); expect(control.skip(0)).toBe(true);
    const result = await pending; expect(result.value).toBeNull(); expect(result.progress.at(-1)).toMatchObject({ state: "error", skipped: true });
    expect((await runs.mock.results[0].value).is_cancelled).toBe(true);
    const next = await host().spawnAgent(request()); expect(next.ok).toBe(true);
  });
  it("reports actual managed release uncertainty instead of quiet workflow completion", async () => {
    disposalError = /UnknownUse|RecoveryRequired/;
    let descriptor: Awaited<ReturnType<typeof open>> | undefined;
    vi.mocked(runAgent).mockImplementationOnce(async (_ctx, _type, _prompt, options) => {
      descriptor = await open(join(options.cwd!, "source.txt"), "r");
      return { responseText: "worker done", session: { dispose() {} } as AgentSession, aborted: false, steered: false };
    });
    try {
      const result = await run('return await agent("read");');
      expect(result.status).toBe("failed"); expect(result.error).toMatch(/UnknownUse|RecoveryRequired/);
      expect(manager.listAgents()[0].taskSettlementError).toMatch(/UnknownUse|RecoveryRequired/);
    } finally { await descriptor?.close(); }
  });
  it("unawaited launch during claim acquisition cannot finish before ownership settles", async () => {
    let release!: () => void; let isEntered = false; let isSettled = false;
    const held = new Promise<void>(resolve => { release = resolve; }); releases.push(release);
    const original = TaskAuthority.prototype.claim;
    vi.spyOn(TaskAuthority.prototype, "claim").mockImplementationOnce(async function(...args) {
      const record = await original.apply(this, args); isEntered = true; await held; return record;
    });
    const pending = run('agent("dropped"); return "early";');
    void pending.then(() => { isSettled = true; });
    await vi.waitFor(() => expect(isEntered).toBe(true)); await busy();
    await new Promise(resolve => setTimeout(resolve, 50)); expect(isSettled).toBe(false);
    release(); const result = await pending;
    expect(result.status).toBe("failed"); expect(result.error).toContain("unawaited"); expect(runAgent).not.toHaveBeenCalled();
    expect((await host().spawnAgent(request())).ok).toBe(true);

    await manager.captureTaskSnapshot(repository, "B", { base_oid: base });
    let releaseResume!: () => void; let isResumeAborted = false; let enteredResume!: () => void;
    const entered = new Promise<void>(resolve => { enteredResume = resolve; }); releases.push(enteredResume);
    const heldResume = new Promise<void>(resolve => { releaseResume = resolve; }); releases.push(releaseResume);
    const worker = vi.mocked(runAgent).getMockImplementation()!;
    vi.mocked(runAgent).mockImplementation(async (...args) => {
      if (args[2] === "barrier") await entered;
      return await worker(...args);
    });
    vi.mocked(resumeAgent).mockImplementationOnce(async (_session, _prompt, options) => {
      options?.signal?.addEventListener("abort", () => { isResumeAborted = true; releaseResume(); }, { once: true });
      enteredResume(); await heldResume; return { text: "resumed" };
    });
    const duplicate = run('await agent("seed", { label: "fix" }); agent("dropped", { resume: "fix" }); await agent("barrier", { task_id: "B" }); await agent("duplicate", { resume: "fix" }); return null;');
    expect((await duplicate).status).toBe("failed"); expect(isResumeAborted).toBe(true); expect(resumeAgent).toHaveBeenCalledTimes(1);
  });
  it("refuses managed replay after uncommitted bytes change at the same HEAD", async () => {
    const entries: WorkflowJournalEntry[] = [];
    vi.mocked(runAgent).mockImplementation(async (_ctx, _type, _prompt, options) => ({ responseText: readFileSync(join(options.cwd!, "source.txt"), "utf8"), session: { dispose() {} } as AgentSession, aborted: false, steered: false }));
    const first = await run('return await agent("read", { task_access: "read-stable" });', { journal: { append: entry => entries.push(entry) } }); expect(first.value).toBe("parent");
    const checkout = manager.getTaskBinding()!.checkout; writeFileSync(join(checkout, "source.txt"), "modified");
    expect(execFileSync("git", ["rev-parse", "HEAD"], { cwd: checkout, encoding: "utf8" }).trim()).toBe(base);
    const second = await run('return await agent("read", { task_access: "read-stable" });', { journal: { entries } });
    expect(second.value).toBe("modified"); expect(second.replayedCount).toBe(0); expect(runAgent).toHaveBeenCalledTimes(2);
  });
});
