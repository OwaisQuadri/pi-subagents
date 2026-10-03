import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fauxToolCall } from "@earendil-works/pi-ai";
import type { AgentSession } from "@earendil-works/pi-coding-agent";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AgentManager } from "../src/agent-manager.js";
import type * as runnerModule from "../src/agent-runner.js";
import { resumeAgent, runAgent } from "../src/agent-runner.js";
import extension from "../src/index.js";
import { createNestedSubagentTools } from "../src/nested-tools.js";
import { SubagentScheduler } from "../src/schedule.js";
import { ScheduleStore } from "../src/schedule-store.js";
import type * as taskModule from "../src/task-worktree.js";
import { TaskAuthority, TaskClaim, type TaskSnapshot } from "../src/task-worktree.js";
import * as workflowTasks from "../src/workflow/task.js";
import { ctx, makePi, textOf } from "./helpers/boot-extension.js";
import { agentCall, agentToolResults, routeBySession, runPrintMode } from "./helpers/print-mode-runner.js";
import { fixtureDirectory, taskHelper, taskHelperTitle } from "./helpers/task-fixture.js";

const fixture = vi.hoisted(() => ({ binary: "", storage: "" }));
vi.mock("../src/task-worktree.js", async importOriginal => {
  const actual = await importOriginal<typeof taskModule>();
  return { ...actual, TaskAuthority: class extends actual.TaskAuthority {
    constructor() { super(fixture); }
  } };
});
vi.mock("../src/agent-runner.js", async importOriginal => ({
  ...await importOriginal<typeof runnerModule>(), runAgent: vi.fn(), resumeAgent: vi.fn(),
}));
vi.setConfig({ testTimeout: 30_000 });
let repository: string;
let base: string;
let boot: ReturnType<typeof makePi>;
let context: ReturnType<typeof ctx>;
let previousCwd: string;
let previousHome: string | undefined;
let previousAgentDir: string | undefined;
let shutdownError: string | undefined;
const managers: AgentManager[] = [];
const schedulers: SubagentScheduler[] = [];
const key = Symbol.for("pi-subagents:manager");
const git = (args: string[]) => execFileSync("git", args, { cwd: repository, encoding: "utf8" }).trim();
const invoke = (params: Record<string, unknown>) => boot.tools.get("Agent").execute("call", {
  prompt: "prompt", description: "native fixture", subagent_type: "general-purpose", run_in_background: false, ...params,
}, undefined, undefined, context);
const command = (args: string) => boot.commands.get("agents").handler(args, context);

beforeEach(() => {
  shutdownError = undefined;
  previousCwd = process.cwd(); previousHome = process.env.HOME; previousAgentDir = process.env.PI_CODING_AGENT_DIR;
  fixture.binary = taskHelper();
  const directory = fixtureDirectory("native");
  repository = join(directory, "repository"); fixture.storage = join(directory, "storage");
  mkdirSync(repository); git(["init", "-q"]); git(["config", "user.name", "Fixture"]); git(["config", "user.email", "fixture@example.invalid"]);
  writeFileSync(join(repository, "source.txt"), "base A"); git(["add", "source.txt"]); git(["commit", "-qm", "A"]); base = git(["rev-parse", "HEAD"]);
  process.env.HOME = directory; process.env.PI_CODING_AGENT_DIR = join(directory, "home"); process.chdir(repository);
  delete (globalThis as Record<symbol, unknown>)[key];
  vi.mocked(runAgent).mockReset().mockImplementation(async (_ctx, _type, _prompt, options) => {
    const session = { messages: [{ role: "user", content: "prompt" }, { role: "assistant", content: "output" }], subscribe: () => () => {}, dispose() {}, sessionManager: { getSessionFile: () => undefined } } as unknown as AgentSession;
    options.onSessionCreated?.(session);
    return { responseText: "native output", session, aborted: false, steered: false };
  });
  vi.mocked(resumeAgent).mockReset().mockResolvedValue({ text: "resumed output" });
  boot = makePi(); context = ctx({ cwd: repository }); extension(boot.pi);
});

afterEach(async () => {
  for (const scheduler of schedulers.splice(0)) scheduler.stop();
  if (shutdownError) await expect(boot.lifecycle.get("session_shutdown")?.({}, context)).rejects.toThrow(shutdownError);
  else await boot.lifecycle.get("session_shutdown")?.({}, context);
  for (const manager of managers.splice(0)) await manager.dispose();
  vi.restoreAllMocks(); process.chdir(previousCwd);
  if (previousHome === undefined) delete process.env.HOME; else process.env.HOME = previousHome;
  if (previousAgentDir === undefined) delete process.env.PI_CODING_AGENT_DIR; else process.env.PI_CODING_AGENT_DIR = previousAgentDir;
});

async function initialize(id = "task-A") {
  const authority = new TaskAuthority();
  try { return await authority.ensure(repository, id, base); } finally { await authority.close(); }
}

function managerFixture() {
  const manager = new AgentManager(undefined, undefined, undefined, undefined, undefined, false, fixture);
  managers.push(manager); return manager;
}

describe("native task identity", () => {
  it("registers twice without eager helper/Git I/O within the warm factory budget", async () => {
    const claim = vi.spyOn(TaskAuthority.prototype, "claim");
    const ensure = vi.spyOn(TaskAuthority.prototype, "ensure");
    const times: number[] = [];
    for (let repetition = 0; repetition < 2; repetition++) {
      const next = makePi(); const start = performance.now(); extension(next.pi); times.push(performance.now() - start);
      await next.lifecycle.get("session_shutdown")({}, context);
    }
    expect(claim).not.toHaveBeenCalled(); expect(ensure).not.toHaveBeenCalled();
    process.stdout.write(`native registration warm milliseconds ${times.join(",")}; target 50\n`);
    expect(Math.max(...times)).toBeLessThanOrEqual(50);
  });
});

describe.skipIf(!taskHelper())(taskHelperTitle("native task identity with the task helper"), () => {
  it("rejects missing and malformed fields without launching a child or admitting forged snapshots", async () => {
    await expect(invoke({})).rejects.toThrow(/task_id|bind/);
    await expect(invoke({ task_id: "" })).rejects.toThrow(/task_id/);
    await expect(invoke({ task_id: "task-A", task_access: null })).rejects.toThrow(/task_access/);
    const snapshot = await managerFixture().bindTask(repository, "forged-task", { base_oid: base });
    const registry = (globalThis as Record<symbol, unknown>)[key] as { spawn: (...args: unknown[]) => string };
    expect(() => registry.spawn(boot.pi, context, "general-purpose", "prompt", { description: "forged", taskSnapshot: snapshot, token: "forged" })).toThrow(/task_id|bind/);
    expect(runAgent).not.toHaveBeenCalled();
  });

  it.each([false, true])("passes explicit native task fields to mandatory manager (background=%s)", async isBackground => {
    const task = await initialize();
    const result = await invoke({ task_id: "task-A", task_access: "write", run_in_background: isBackground });
    const registry = (globalThis as Record<symbol, unknown>)[key] as { waitForAll: () => Promise<void> };
    await registry.waitForAll();
    expect(textOf(result)).toContain(isBackground ? "background" : "native output");
    const options = vi.mocked(runAgent).mock.lastCall![3];
    expect(options.cwd).toBe(task.checkout); expect(options.configCwd).toBe(repository);
    expect(options.taskClaimHolder).toBeDefined();
    const output = boot.pi.appendEntry.mock.calls.find((call: unknown[]) => call[0] === "subagents:record")[1];
    expect(output.taskSnapshot.base_oid).toBe(base); expect(output.cwd).toBe(task.checkout);
    expect(JSON.stringify(output.taskSnapshot)).not.toContain("token");
  });

  it("native RPC strips forged capabilities while retaining validated public task fields", async () => {
    const task = await initialize();
    await boot.lifecycle.get("session_start")({}, context);
    const handler = boot.pi.events.on.mock.calls.find((call: unknown[]) => call[0] === "subagents:rpc:spawn")[1];
    await handler({ requestId: "rpc", type: "general-purpose", prompt: "RPC", options: { description: "RPC", task_id: "task-A", task_access: "write", taskSnapshot: { task_id: "forged" }, configCwd: "/etc", token: "forged" } });
    expect(boot.pi.events.emit).toHaveBeenCalledWith("subagents:rpc:spawn:reply:rpc", { success: true, data: { id: expect.any(String) } });
    const registry = (globalThis as Record<symbol, unknown>)[key] as { waitForAll: () => Promise<void> };
    await registry.waitForAll();
    expect(vi.mocked(runAgent).mock.lastCall![3].cwd).toBe(task.checkout);
    expect(vi.mocked(runAgent).mock.lastCall![3].configCwd).toBe(repository);
    await handler({ requestId: "bad", type: "general-purpose", prompt: "RPC", options: { task_id: "task-A", task_access: "invalid" } });
    expect(boot.pi.events.emit).toHaveBeenCalledWith("subagents:rpc:spawn:reply:bad", { success: false, error: expect.stringContaining("task_access") });
    expect(runAgent).toHaveBeenCalledTimes(1);
  });

  it("native tombstone mention reopens its recorded file/task after binding changes", async () => {
    const task = await initialize();
    const file = join(repository, "session.jsonl"); writeFileSync(file, "fixture session");
    vi.mocked(runAgent).mockImplementationOnce(async (_ctx, _type, _prompt, options) => {
      const session = { messages: [], subscribe: () => () => {}, dispose() {}, sessionManager: { getSessionFile: () => file } } as unknown as AgentSession;
      options.onSessionCreated?.(session); return { responseText: "persisted", session, aborted: false, steered: false };
    });
    const spawn = vi.spyOn(AgentManager.prototype, "spawn");
    await invoke({ task_id: "task-A" });
    const manager = spawn.mock.contexts[0]; const record = manager.listAgents()[0];
    record.completedAt = Date.now() - 11 * 60_000;
    (manager as unknown as { cleanup(): void }).cleanup();
    await command(`task bind task-B --base ${base}`);
    await boot.lifecycle.get("input")({ source: "interactive", text: "@general-purpose continue" }, context);
    await manager.waitForAll();
    const options = vi.mocked(runAgent).mock.lastCall![3];
    expect(options.resumeSessionFile).toBe(file); expect(options.cwd).toBe(task.checkout);
    expect(manager.listAgents()[0].taskSnapshot?.base_oid).toBe(base);
    expect(manager.getTaskBinding()?.task_id).toBe("task-B");
  });

  it("output initial and streamed entries preserve actual checkout and token-free snapshot", async () => {
    const task = await initialize(); await invoke({ task_id: "task-A" });
    const spawn = boot.pi.appendEntry.mock.calls.find((call: unknown[]) => call[0] === "subagents:record")[1];
    const record = ((globalThis as Record<symbol, unknown>)[key] as { getRecord(id: string): { outputFile: string } }).getRecord(spawn.id);
    const entries = readFileSync(record.outputFile, "utf8").trim().split("\n").map(line => JSON.parse(line));
    expect(entries).toHaveLength(2);
    for (const entry of entries) {
      expect(entry.cwd).toBe(task.checkout); expect(entry.taskSnapshot.task_id).toBe("task-A");
      expect(entry.taskSnapshot.base_oid).toBe(base); expect(JSON.stringify(entry)).not.toContain("token");
    }
  });

  it.each([false, true])("native resume output keeps snapshot A after binding B (background=%s)", async isBackground => {
    const task = await initialize(); await invoke({ task_id: "task-A" });
    const spawned = boot.pi.appendEntry.mock.calls.find((call: unknown[]) => call[0] === "subagents:record")[1];
    const registry = (globalThis as Record<symbol, unknown>)[key] as { getRecord(id: string): { outputFile: string }; waitForAll(): Promise<void> };
    const originalOutput = registry.getRecord(spawned.id).outputFile;
    await command(`task bind task-B --base ${base}`);
    vi.mocked(resumeAgent).mockImplementationOnce(async session => {
      const messages = session.messages as unknown as { role: string; content: string }[];
      messages.push({ role: "user", content: "again" }, { role: "assistant", content: "resumed" });
      return { text: "resumed" };
    });
    await invoke({ resume: spawned.id, run_in_background: isBackground }); await registry.waitForAll();
    expect(registry.getRecord(spawned.id).outputFile).toBe(originalOutput);
    const entries = readFileSync(originalOutput, "utf8").trim().split("\n").map(line => JSON.parse(line));
    expect(entries).toHaveLength(4);
    expect(entries[2].message.content).toBe("again"); expect(entries[3].message.content).toBe("resumed");
    expect(entries[3].taskSnapshot.task_id).toBe("task-A"); expect(entries[3].cwd).toBe(task.checkout);
  });

  it("shutdown waits for the actual worker promise rather than stopped display status", async () => {
    await initialize(); let release!: () => void;
    const settled = new Promise<void>(resolve => { release = resolve; });
    vi.mocked(runAgent).mockImplementationOnce(async () => {
      await settled; return { responseText: "late", session: { dispose() {} } as AgentSession, aborted: false, steered: false };
    });
    await invoke({ task_id: "task-A", run_in_background: true });
    let isShutdown = false;
    const shutdown = boot.lifecycle.get("session_shutdown")({}, context).then(() => { isShutdown = true; });
    try { await new Promise(resolve => setTimeout(resolve, 50)); expect(isShutdown).toBe(false); }
    finally { release(); await shutdown; }
    expect(isShutdown).toBe(true);
  });

  it("session switch waits for zero-record workflow capture and prevents a late child", async () => {
    await initialize();
    const snapshot = await managerFixture().captureTaskSnapshot(repository, "task-A", { configCwd: repository });
    let release!: () => void;
    const held = new Promise<void>(resolve => { release = resolve; });
    let entered!: () => void;
    const captureEntered = new Promise<void>(resolve => { entered = resolve; });
    const original = AgentManager.prototype.captureTaskSnapshot;
    const capture = vi.spyOn(AgentManager.prototype, "captureTaskSnapshot").mockImplementation(async function (...args) {
      entered(); await held; return original.apply(this, args);
    });
    const created = vi.spyOn(workflowTasks, "createWorkflowTask");
    await boot.tools.get("SubagentWorkflow").execute("switch-capture", {
      script: 'export const meta = { name: "switch-capture", description: "capture barrier" }; return await agent("late", { task_id: "task-A" });',
    }, undefined, undefined, context);
    await captureEntered;
    const task = created.mock.results[0].value;
    const manager = capture.mock.contexts[0];
    manager.setTaskBinding(snapshot);
    expect(manager.listAgents()).toHaveLength(0);
    let isSwitched = false;
    const switching = boot.lifecycle.get("session_before_switch")({}, context).then(() => { isSwitched = true; });
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(isSwitched).toBe(false);
      expect(task.abortController.signal.aborted).toBe(true);
      expect(manager.getTaskBinding()?.task_id).toBe("task-A");
    } finally { release(); await switching; await task.settlement; }
    expect(task.status).toBe("killed");
    expect(manager.getTaskBinding()).toBeUndefined();
    await boot.lifecycle.get("session_start")({}, ctx({ cwd: repository }));
    expect(runAgent).not.toHaveBeenCalled();
  });

  it("session switch settles a paused workflow before its first child with no manager records", async () => {
    await command(`task bind task-A --base ${base}`);
    const created = vi.spyOn(workflowTasks, "createWorkflowTask");
    await boot.tools.get("SubagentWorkflow").execute("switch-paused", {
      script: 'export const meta = { name: "switch-paused", description: "pause barrier" }; await new Promise(() => {}); return await agent("late");',
    }, undefined, undefined, context);
    const task = created.mock.results[0].value;
    await vi.waitFor(() => expect(task.control).toBeDefined());
    expect(workflowTasks.pauseWorkflowTask(task)).toBe(true);
    const spawn = vi.spyOn(AgentManager.prototype, "spawn");
    await boot.lifecycle.get("session_before_switch")({}, context);
    expect(task.abortController.signal.aborted).toBe(true);
    expect(task.status).toBe("killed");
    expect(task.control).toBeUndefined();
    expect(spawn).not.toHaveBeenCalled(); expect(runAgent).not.toHaveBeenCalled();
    const card = boot.tools.get("SubagentWorkflow").renderResult({ content: [{ type: "text", text: "started" }], details: { taskId: task.id } }, {}, { fg: (_color: string, text: string) => text, bold: (text: string) => text }, {}).text;
    expect(card).toContain("switch-paused");
  });

  it("session switch waits for held workflow claim release and surfaces uncertain settlement", async () => {
    await command(`task bind task-A --base ${base}`);
    const created = vi.spyOn(workflowTasks, "createWorkflowTask");
    let release!: () => void; let entered!: () => void;
    const held = new Promise<void>(resolve => { release = resolve; });
    const releaseEntered = new Promise<void>(resolve => { entered = resolve; });
    const original = TaskClaim.prototype.release;
    vi.spyOn(TaskClaim.prototype, "release").mockImplementationOnce(async function () {
      entered(); await held; await original.call(this); throw new Error("RecoveryRequired fixture settlement uncertainty");
    });
    const spawn = vi.spyOn(AgentManager.prototype, "spawn");
    await boot.tools.get("SubagentWorkflow").execute("switch-release", {
      script: 'export const meta = { name: "switch-release", description: "release barrier" }; return await agent("child");',
    }, undefined, undefined, context);
    await releaseEntered;
    const task = created.mock.results[0].value;
    let isSwitched = false;
    const switching = boot.lifecycle.get("session_before_switch")({}, context).then(() => { isSwitched = true; });
    try { await new Promise(resolve => setTimeout(resolve, 50)); expect(isSwitched).toBe(false); }
    finally { release(); await expect(switching).rejects.toThrow("RecoveryRequired fixture settlement uncertainty"); }
    expect(task.status).toBe("failed");
    expect(task.error).toContain("RecoveryRequired fixture settlement uncertainty");
    expect(task.control).toBeUndefined();
    expect(runAgent).toHaveBeenCalledTimes(1);
    const holder = vi.mocked(runAgent).mock.lastCall![3].taskClaimHolder!;
    const manager = spawn.mock.contexts[0];
    const record = manager.listAgents()[0];
    expect(holder.current).toBeUndefined();
    expect(holder.recovery?.snapshot).toEqual(record.taskSnapshot);
    manager.clearCompleted();
    expect(manager.getRecord(record.id)).toBe(record);
    expect(manager.getTaskBinding()?.task_id).toBe("task-A");
    // Reported once: the next switch has nothing new to surface and clears in-memory state.
    await boot.lifecycle.get("session_before_switch")({}, context);
    expect(manager.getRecord(record.id)).toBeUndefined();
    expect(manager.getTaskBinding()).toBeUndefined();
    await expect(boot.lifecycle.get("session_shutdown")({}, context)).resolves.toBeUndefined();
  });

  it("binding lookup never refreshes base or creates on an arbitrary helper error; explicit finish preserves", async () => {
    await command("task bind absent"); expect(context.ui.notify).toHaveBeenLastCalledWith(expect.stringContaining("No allocation fallback"), "error");
    await command("task bind task-A --base HEAD"); expect(context.ui.notify).toHaveBeenLastCalledWith(expect.stringContaining("full base_oid"), "error");
    await command(`task bind task-A --base ${base}`);
    writeFileSync(join(repository, "source.txt"), "B"); git(["commit", "-qam", "B"]);
    await command("task bind task-A");
    await command("task status"); expect(context.ui.notify).toHaveBeenLastCalledWith(expect.stringContaining(base), "info");
    const preservation = join(dirname(repository), "preserved");
    await command(`task finish ${preservation}`);
    expect(readFileSync(join(preservation, "checkout", "source.txt"), "utf8")).toBe("base A");
    await expect(invoke({})).rejects.toThrow(/task_id|bind/);
  });

  it("a finish that settles after a newer bind leaves the newer binding in place", async () => {
    await command(`task bind task-A --base ${base}`);
    await initialize("task-B");
    const original = AgentManager.prototype.finishTask;
    let release!: () => void;
    const held = new Promise<void>(resolve => { release = resolve; });
    vi.spyOn(AgentManager.prototype, "finishTask").mockImplementationOnce(async function (this: AgentManager, ...args) {
      await held;
      return original.apply(this, args);
    });
    const finishing = command(`task finish ${join(dirname(repository), "preserved-A")}`);
    await command("task bind task-B");
    release(); await finishing;
    await command("task status");
    expect(context.ui.notify).toHaveBeenLastCalledWith(expect.stringContaining("Task task-B"), "info");
    const saved = boot.pi.appendEntry.mock.calls.filter((call: unknown[]) => call[0] === "subagents:task-binding").map((call: unknown[]) => (call[1] as { snapshot: { task_id: string } | null }).snapshot?.task_id ?? null);
    expect(saved).toEqual(["task-A", "task-B"]);
  });

  it("shows the task checkout under ~ rather than the home path in bind and status notices", async () => {
    await command(`task bind task-A --base ${base}`);
    await command("task status");
    const notices = vi.mocked(context.ui.notify).mock.calls.slice(-2).map(([message]) => String(message));
    for (const notice of notices) {
      expect(notice).toMatch(/ at ~\/storage\/[^;]+\/checkout; base /);
      expect(notice).not.toContain(process.env.HOME!);
    }
  });

  it("binds, persists, restores only typed explicit entries and clears on unbind/switch", async () => {
    await command(`task bind task-A --base ${base}`);
    expect(context.ui.notify).toHaveBeenLastCalledWith(expect.stringContaining("task-A"), "info");
    const saved = boot.pi.appendEntry.mock.calls.find((call: unknown[]) => call[0] === "subagents:task-binding")[1];
    expect(saved.snapshot.base_oid).toBe(base);
    await command("task unbind"); await expect(invoke({})).rejects.toThrow(/task_id|bind/);
    context.sessionManager.getBranch.mockReturnValue([{ type: "custom", customType: "subagents:task-binding", data: saved }]);
    await boot.lifecycle.get("session_start")({}, context);
    writeFileSync(join(repository, "source.txt"), "base B"); git(["commit", "-qam", "B"]);
    await invoke({}); expect(vi.mocked(runAgent).mock.lastCall![3].cwd).toBe(saved.snapshot.checkout);
    await boot.lifecycle.get("session_before_switch")({}, context);
    await expect(invoke({})).rejects.toThrow(/task_id|bind/);
    context.sessionManager.getBranch.mockReturnValue([{ type: "message", customType: "subagents:task-binding", data: saved }]);
    await boot.lifecycle.get("session_start")({}, context); await expect(invoke({})).rejects.toThrow(/task_id|bind/);
  });

  it("captures schedule A without mutating binding B and fires/restores the recorded snapshot", async () => {
    const manager = managerFixture(); const a = await manager.bindTask(repository, "task-A", { base_oid: base });
    const b = await manager.bindTask(repository, "task-B", { base_oid: base });
    const storePath = join(repository, "jobs.json"); const store = new ScheduleStore(storePath);
    const scheduler = new SubagentScheduler(); schedulers.push(scheduler); scheduler.start(boot.pi, context, manager, store);
    const job = await scheduler.addJob({ name: "A", description: "A", schedule: "1h", subagent_type: "general-purpose", prompt: "A", task_id: "task-A" });
    expect(manager.getTaskBinding()).toEqual(b); expect(job.taskSnapshot).toEqual(a);
    scheduler.stop(); const restored = new ScheduleStore(storePath); scheduler.start(boot.pi, context, manager, restored);
    (scheduler as unknown as { executeJob(id: string): void }).executeJob(job.id);
    await manager.waitForAll(); expect(vi.mocked(runAgent).mock.lastCall![3].cwd).toBe(a.checkout);
    expect(manager.getTaskBinding()).toEqual(b);
    const serialized = JSON.parse(readFileSync(storePath, "utf8")); serialized.jobs[0].taskSnapshot.token = "forged";
    writeFileSync(storePath, JSON.stringify(serialized));
    expect(() => new ScheduleStore(storePath)).toThrow(/snapshot/);
  });

  it.each([false, true])("real scripted SDK native foreground/background=%s executes in the recorded checkout", async isBackground => {
    const previousPath = process.env.PATH;
    process.env.PATH = `${dirname(fixture.binary)}:${previousPath}`;
    const actual = await vi.importActual<typeof taskModule>("../src/task-worktree.js");
    await boot.lifecycle.get("session_shutdown")({}, context);
    const run = await runPrintMode({
      cwd: repository, prompt: "native SDK fixture", live: false, isolateGlobals: false,
      beforeRun: async () => {
        const authority = new actual.TaskAuthority();
        try { await authority.ensure(repository, "task-sdk", base); } finally { await authority.close(); }
      },
      respond: routeBySession({
        parentInitial: agentCall({ prompt: "run native SDK", description: "native SDK", task_id: "task-sdk", run_in_background: isBackground }),
        parentFinal: "parent done",
        subagent: sdkContext => sdkContext.messages.some(message => message.role === "toolResult") ? "SDK child done" : fauxToolCall("bash", { command: "pwd; git rev-parse HEAD" }),
      }),
    });
    try {
      expect(agentToolResults(run.parentSession)[0]).toContain(isBackground ? "background" : "SDK child done");
      const spawned = run.parentSession.sessionManager.getEntries().find(entry => entry.type === "custom" && entry.customType === "subagents:record");
      const data = (spawned as { data: { taskSnapshot: TaskSnapshot } }).data;
      expect(data.taskSnapshot.base_oid).toBe(base);
      expect(data.taskSnapshot.repository).toBe(repository);
      expect(data.taskSnapshot.checkout).not.toBe(repository);
    } finally { await run.dispose(); process.env.PATH = previousPath; }
  });

  it("nested explicit child IDs claim from the original parent repository, not its checkout", async () => {
    const manager = managerFixture(); const a = await manager.bindTask(repository, "task-A", { base_oid: base });
    await initialize("task-child");
    const tools = createNestedSubagentTools({ manager, pi: boot.pi, parentAgentId: "parent", depth: 1, maxSubagentDepth: 2, allowedSubagents: "all", configCwd: repository, taskSnapshot: a });
    const result = await tools[0].execute("nested", { prompt: "nested", description: "nested", subagent_type: "general-purpose", task_id: "task-child" }, undefined, undefined, ctx({ cwd: a.checkout }));
    expect(textOf(result)).toContain("native output");
    expect(vi.mocked(runAgent).mock.lastCall![3].worktreeBase).toBe(repository);
    expect(vi.mocked(runAgent).mock.lastCall![3].configCwd).toBe(repository);
    const authority = new TaskAuthority();
    const claim = await authority.claim({ repository, task_id: "task-A", generation: 1 }, "write", "parent-held");
    try {
      const collision = await tools[0].execute("collision", { prompt: "nested", description: "nested", subagent_type: "general-purpose" }, undefined, undefined, ctx({ cwd: a.checkout }));
      expect(textOf(collision)).toContain('A nested writer needs its own distinct task_id: this agent already holds task "task-A"'); expect(runAgent).toHaveBeenCalledTimes(1);
    } finally { await authority.release({ repository, task_id: "task-A", generation: 1 }, claim.token); await authority.close(); }
  });
});
