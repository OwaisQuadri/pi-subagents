import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Context } from "@earendil-works/pi-ai";
import { fauxToolCall } from "@earendil-works/pi-ai";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TaskSnapshot } from "../src/task-worktree.js";
import { setWorktreeIsolationEnabled } from "../src/worktree.js";
import { agentCall, type FauxReply, type PrintModeRun, runPrintMode } from "./helpers/print-mode-runner.js";
import { taskHelper, taskHelperTitle } from "./helpers/task-fixture.js";

const TASK_BINARY = taskHelper();

vi.setConfig({ testTimeout: 30_000 });
const MARKER_FILE = "agent-work.txt";
const CHILD_MARKER = "CHILD-EDITED-ITS-TREE";
const CHILD_PROMPT = "Create the marker file.";

function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd, stdio: "pipe", timeout: 10_000 }).toString().trim();
}

function initGitRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), "wt-iso-e2e-"));
  git(dir, "init"); git(dir, "config", "user.email", "fixture@example.invalid"); git(dir, "config", "user.name", "Fixture");
  writeFileSync(join(dir, "README.md"), "# Test repo");
  git(dir, "add", "README.md"); git(dir, "commit", "-m", "initial");
  return dir;
}

function firstUserText(context: Context): string {
  const content = context.messages.find(message => message.role === "user")?.content;
  if (typeof content === "string") return content;
  return ((content ?? []) as Array<{ text?: string }>).map(block => block.text ?? "").join("");
}

function agentResultText(session: Context): string {
  return session.messages.filter(message => message.role === "toolResult" && (message as { toolName?: string }).toolName === "Agent")
    .flatMap(message => ((message.content ?? []) as Array<{ text?: string }>).map(block => block.text ?? "")).join("\n");
}

function respondSpawning(context: Context): FauxReply {
  if (firstUserText(context).includes(CHILD_PROMPT)) {
    if (!context.messages.some(message => message.role === "toolResult" && (message as { toolName?: string }).toolName === "bash")) {
      return fauxToolCall("bash", { command: `echo isolated > ${MARKER_FILE}` });
    }
    return CHILD_MARKER;
  }
  if (context.messages.some(message => message.role === "toolResult" && (message as { toolName?: string }).toolName === "Agent")) return `parent saw: ${agentResultText(context)}`;
  return agentCall({ run_in_background: false, description: "task work", prompt: CHILD_PROMPT, isolation: "worktree" });
}

function snapshot(run: PrintModeRun): TaskSnapshot {
  const entry = run.parentSession.sessionManager.getEntries().find(entry => entry.type === "custom" && entry.customType === "subagents:record");
  expect(entry).toBeDefined();
  return (entry as { data: { taskSnapshot: TaskSnapshot } }).data.taskSnapshot;
}

describe.skipIf(!TASK_BINARY)(taskHelperTitle("mandatory task isolation e2e (real Git, helper and scripted SDK)"), () => {
  let run: PrintModeRun | undefined;
  const repos: string[] = [];
  afterEach(async () => {
    await run?.dispose(); run = undefined;
    setWorktreeIsolationEnabled(true);
    for (const repo of repos.splice(0)) { git(repo, "worktree", "prune"); rmSync(repo, { recursive: true, force: true }); }
  });

  it("retains edits in the task checkout without automatic commit or removal", async () => {
    const repo = initGitRepo(); repos.push(repo);
    const base = git(repo, "rev-parse", "HEAD");
    run = await runPrintMode({
      prompt: "Delegate the work.", cwd: repo, respond: respondSpawning, live: false,
      taskFixture: { binary: TASK_BINARY, task_ids: ["retained-writing-task"] },
    });
    const task = snapshot(run);
    expect(agentResultText(run.parentSession)).toContain(CHILD_MARKER);
    expect(existsSync(join(repo, MARKER_FILE))).toBe(false);
    expect(task.task_id).toBe("retained-writing-task"); expect(task.base_oid).toBe(base);
    expect(readFileSync(join(task.checkout, MARKER_FILE), "utf8")).toBe("isolated\n");
    expect(git(task.checkout, "rev-parse", "HEAD")).toBe(base);
    expect(git(task.checkout, "status", "--short")).toContain(`?? ${MARKER_FILE}`);
    expect(git(repo, "worktree", "list", "--porcelain")).toContain(task.checkout);
    expect(git(repo, "branch", "--list", "pi-agent-*")).toBe("");
    expect(agentResultText(run.parentSession)).not.toContain("Changes saved to branch");
  });

  it("worktreeIsolation false cannot bypass the mandatory task checkout", async () => {
    const repo = initGitRepo(); repos.push(repo);
    mkdirSync(join(repo, ".pi"), { recursive: true });
    writeFileSync(join(repo, ".pi", "subagents.json"), JSON.stringify({ worktreeIsolation: false }));
    run = await runPrintMode({
      prompt: "Delegate the work.", cwd: repo, respond: respondSpawning, live: false,
      taskFixture: { binary: TASK_BINARY, task_ids: ["required-writing-task"] },
    });
    const task = snapshot(run);
    expect(agentResultText(run.parentSession)).toContain(CHILD_MARKER);
    expect(existsSync(join(repo, MARKER_FILE))).toBe(false);
    expect(task.checkout).not.toBe(repo);
    expect(readFileSync(join(task.checkout, MARKER_FILE), "utf8")).toBe("isolated\n");
    expect(git(repo, "worktree", "list", "--porcelain")).toContain(task.checkout);
    expect(git(repo, "branch", "--list", "pi-agent-*")).toBe("");
    expect(agentResultText(run.parentSession)).not.toContain("Changes saved to branch");
  });
});
