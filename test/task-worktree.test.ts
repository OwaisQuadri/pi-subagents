import { execFileSync } from "node:child_process";
import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { homeRelativePath, TASK_AUTHORITY_CONTROL_DEADLINE_MS, TASK_AUTHORITY_RUN_GRACE_MS, TaskAuthority, TaskClaim, type TaskIdentity } from "../src/task-worktree.js";
import { fixtureDirectory, taskHelper, taskHelperTitle } from "./helpers/task-fixture.js";

const binary = taskHelper();

function fixture() {
  const directory = fixtureDirectory("authority");
  const repository = join(directory, "repository");
  const storage = join(directory, "storage");
  mkdirSync(repository);
  const git = (args: string[]) => execFileSync("git", args, { cwd: repository, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  git(["init"]);
  git(["config", "user.name", "Fixture"]);
  git(["config", "user.email", "fixture@example.invalid"]);
  writeFileSync(join(repository, "source.txt"), "base A");
  git(["add", "source.txt"]);
  git(["commit", "-m", "fixture A"]);
  return { repository, git, base: git(["rev-parse", "HEAD"]), authority: () => new TaskAuthority({ binary, storage }) };
}

function identity(repository: string, task_id = "explicit-task"): TaskIdentity {
  return { repository, task_id, generation: 1 };
}

function scriptedAuthority(source: string): TaskAuthority {
  const directory = fixtureDirectory("protocol");
  const script = join(directory, "helper.mjs");
  writeFileSync(script, `#!/usr/bin/env node\n${source}`);
  chmodSync(script, 0o700);
  return new TaskAuthority({ binary: script, storage: join(directory, "storage") });
}

/** A helper that announces itself, then never answers and ignores EOF. */
const SILENT_HELPER = `
console.log(JSON.stringify({version:1,event:"ready",pid:process.pid}));
process.stdin.resume();
setInterval(() => {}, 1000);`;

function settledState(promise: Promise<unknown>): { state: string } {
  const outcome = { state: "pending" };
  promise.then(() => { outcome.state = "resolved"; }, (error: Error) => { outcome.state = error.message; });
  return outcome;
}

async function pendingRequests(authority: TaskAuthority, count: number): Promise<void> {
  while ((authority as unknown as { pending: Map<string, unknown> }).pending.size < count) await new Promise(resolve => setImmediate(resolve));
}

function helperPid(authority: TaskAuthority): number {
  return (authority as unknown as { child: { pid: number } }).child.pid;
}

describe("home-relative checkout display", () => {
  const saved = process.env.HOME;
  const restore = () => { if (saved === undefined) delete process.env.HOME; else process.env.HOME = saved; };

  it("shortens a path under HOME even when HOME ends with a slash", () => {
    process.env.HOME = "/home/fixture/";
    try {
      expect(homeRelativePath("/home/fixture/tasks/checkout")).toBe("~/tasks/checkout");
      expect(homeRelativePath("/home/fixture-other/checkout")).toBe("/home/fixture-other/checkout");
      expect(homeRelativePath("/home/fixture")).toBe("/home/fixture");
    } finally { restore(); }
  });

  it("shortens a path under the account home when HOME is unset", () => {
    delete process.env.HOME;
    try {
      const home = homedir();
      expect(homeRelativePath(`${home}/tasks/checkout`)).toBe("~/tasks/checkout");
    } finally { restore(); }
  });
});

describe("task authority protocol boundaries", () => {
  it("does no registration-time authority I/O", async () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      const authority = new TaskAuthority({ binary: "/missing/task-authority", storage: "/missing/task-authority-storage" });
      await authority.close();
    }
    expect(performance.now() - start).toBeLessThan(50);
  });

  it("rejects ready from a different process identity before sending a request", async () => {
    const authority = scriptedAuthority(`
console.log(JSON.stringify({version:1,event:"ready",pid:process.pid+1}));
process.stdin.once("data", data => console.log(JSON.stringify({version:1,event:"response",id:JSON.parse(data.toString()).id,is_ok:true,result:{}})));`);
    try {
      await expect(authority.ensure(process.cwd(), "task", "a".repeat(40))).rejects.toThrow("Invalid task authority ready");
    } finally { await authority.close().catch(() => {}); }
  });

  it("rejects unknown response IDs and invalid versions", async () => {
    for (const response of [{version:1,event:"response",id:"unrelated",is_ok:true,result:{}}, {version:2,event:"response",id:"unrelated",is_ok:true,result:{}}]) {
      const authority = scriptedAuthority(`console.log(JSON.stringify({version:1,event:"ready",pid:process.pid})); process.stdin.once("data", () => console.log(${JSON.stringify(JSON.stringify(response))}));`);
      try {
        await expect(authority.ensure(process.cwd(), "task", "a".repeat(40))).rejects.toThrow(response.version === 1 ? "Uncorrelated task authority response" : "Unsupported task authority protocol version");
      } finally { await authority.close().catch(() => {}); }
    }
  });

  it("rejects malformed error envelopes instead of treating them as allocation permission", async () => {
    const authority = scriptedAuthority(`
console.log(JSON.stringify({version:1,event:"ready",pid:process.pid}));
process.stdin.once("data", data => {
  const request = JSON.parse(data.toString());
  console.log(JSON.stringify({version:1,event:"response",id:request.id,is_ok:false,error:{code:"Unexpected",message:"failure"}}));
});`);
    try {
      await expect(authority.ensure(process.cwd(), "task", "a".repeat(40))).rejects.toThrow("Invalid task authority error");
    } finally { await authority.close().catch(() => {}); }
  });

  it("disconnect rejects pending run requests and close rejects later writes", async () => {
    const authority = scriptedAuthority(`
console.log(JSON.stringify({version:1,event:"ready",pid:process.pid}));
process.stdin.once("data", () => process.exit(3));`);
    try {
      await expect(authority.run(identity(process.cwd()), "token", { argv: ["fixture"], cwd: process.cwd(), env: {} })).rejects.toThrow("Task authority disconnected (3)");
      await authority.close();
      await expect(authority.verify(identity(process.cwd()), "token")).rejects.toThrow("Task authority disconnected (3)");
    } finally { await authority.close(); }
  });

  it("cancel acknowledgment does not resolve the original run", async () => {
    const authority = scriptedAuthority(`
import { createInterface } from "node:readline";
console.log(JSON.stringify({version:1,event:"ready",pid:process.pid}));
let run;
const send = (id,result) => console.log(JSON.stringify({version:1,event:"response",id,is_ok:true,result}));
createInterface({input:process.stdin}).on("line", line => {
  const request = JSON.parse(line);
  if(request.operation === "run") run = request;
  if(request.operation === "cancel") {
    send(request.id,{run_id:run.id,is_cancel_requested:true});
    setTimeout(() => send(run.id,{exit_code:null,stdout:process.cwd()+"/stdout",stderr:process.cwd()+"/stderr",is_cancelled:true,is_timed_out:false,is_disconnected:false}),300);
  }
});`);
    const controller = new AbortController();
    let isSettled = false;
    try {
      const run = authority.run(identity(process.cwd()), "fixture-token", { argv: ["fixture"], cwd: process.cwd(), env: {} }, controller.signal);
      void run.then(() => { isSettled = true; });
      await new Promise(resolve => setTimeout(resolve, 100));
      controller.abort();
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(isSettled).toBe(false);
      expect((await run).is_cancelled).toBe(true);
      expect(isSettled).toBe(true);
    } finally { await authority.close(); }
  });

  it("bounds a silent helper's control request and close as uncertain errors without killing it", async () => {
    const authority = scriptedAuthority(SILENT_HELPER);
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    try {
      const claim = settledState(authority.claim(identity(process.cwd()), "write", "silent"));
      await pendingRequests(authority, 1);
      await vi.advanceTimersByTimeAsync(TASK_AUTHORITY_CONTROL_DEADLINE_MS - 1);
      expect(claim.state).toBe("pending");
      await vi.advanceTimersByTimeAsync(1);
      expect(claim.state).toMatch(/claim did not respond within 120000 ms; settlement is uncertain/);
      await expect(authority.verify(identity(process.cwd()), "token")).rejects.toThrow(/claim did not respond/);
      const closed = settledState(authority.close());
      await vi.advanceTimersByTimeAsync(TASK_AUTHORITY_CONTROL_DEADLINE_MS);
      expect(closed.state).toMatch(/did not exit within 120000 ms after EOF; settlement is uncertain/);
      expect(() => process.kill(helperPid(authority), 0)).not.toThrow();
    } finally {
      vi.useRealTimers();
      process.kill(helperPid(authority));
    }
  });

  it("bounds a run by timeout_ms plus grace and leaves a run without timeout_ms unbounded", async () => {
    const bounded = scriptedAuthority(SILENT_HELPER);
    const unbounded = scriptedAuthority(SILENT_HELPER);
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    try {
      const timed = settledState(bounded.run(identity(process.cwd()), "token", { argv: ["fixture"], cwd: process.cwd(), env: {}, timeout_ms: 100 }));
      const open = settledState(unbounded.run(identity(process.cwd()), "token", { argv: ["fixture"], cwd: process.cwd(), env: {} }));
      await pendingRequests(bounded, 1);
      await pendingRequests(unbounded, 1);
      await vi.advanceTimersByTimeAsync(100 + TASK_AUTHORITY_RUN_GRACE_MS - 1);
      expect(timed.state).toBe("pending");
      await vi.advanceTimersByTimeAsync(1);
      expect(timed.state).toMatch(/run did not respond within 120100 ms; settlement is uncertain/);
      await vi.advanceTimersByTimeAsync(10 * TASK_AUTHORITY_CONTROL_DEADLINE_MS);
      expect(open.state).toBe("pending");
    } finally {
      vi.useRealTimers();
      process.kill(helperPid(bounded));
      process.kill(helperPid(unbounded));
    }
  });
});

describe.skipIf(!binary)(taskHelperTitle("task authority transport with accepted Rust helper"), () => {
  it("retains directory, base, edits, and evidence across handoff despite changed parent HEAD", async () => {
    const f = fixture();
    const first = f.authority();
    const second = f.authority();
    try {
      const allocated = await first.ensure(f.repository, "explicit-task", f.base);
      expect(allocated.base_oid).toBe(f.base);
      const claim = await first.claim(identity(f.repository), "write", "worker-one");
      const run = await first.run(identity(f.repository), claim.token, {
        argv: ["/bin/sh", "-c", "printf 'edited handoff' > source.txt; pwd; printf artifact > artifact.txt; cat artifact.txt"], cwd: claim.checkout, env: {},
      });
      expect(run.exit_code).toBe(0);
      expect(readFileSync(run.stdout, "utf8")).toBe(`${claim.checkout}\nartifact`);
      expect(run.stdout.startsWith(`${claim.evidence}/`)).toBe(true);
      await first.release(identity(f.repository), claim.token);
      writeFileSync(join(f.repository, "source.txt"), "base B");
      f.git(["commit", "-am", "fixture B"]);
      const resumed = await second.claim(identity(f.repository), "write", "worker-two");
      expect(resumed.checkout).toBe(allocated.checkout);
      expect(resumed.base_oid).toBe(f.base);
      expect(resumed.generation).toBe(allocated.generation);
      expect(readFileSync(join(resumed.checkout, "source.txt"), "utf8")).toBe("edited handoff");
      expect(readFileSync(join(resumed.checkout, "artifact.txt"), "utf8")).toBe("artifact");
      await second.release(identity(f.repository), resumed.token);
    } finally { await first.close(); await second.close(); }
  }, 30_000);

  it("EOF waits for a quiet original run result rather than abandoning its promise", async () => {
    const f = fixture();
    const a = f.authority();
    const b = f.authority();
    try {
      await a.ensure(f.repository, "explicit-task", f.base);
      const claim = await a.claim(identity(f.repository), "write", "disconnect");
      const run = a.run(identity(f.repository), claim.token, { argv: ["/bin/sh", "-c", "echo ready; sleep 30"], cwd: claim.checkout, env: {} });
      let isSettled = false;
      void run.then(() => { isSettled = true; });
      await new Promise(resolve => setTimeout(resolve, 200));
      await a.close();
      expect(isSettled).toBe(true);
      const result = await run;
      expect(result.is_disconnected).toBe(true);
      const retry = await b.claim(identity(f.repository), "write", "after-disconnect");
      expect(retry.checkout).toBe(claim.checkout);
      await b.release(identity(f.repository), retry.token);
    } finally { await a.close(); await b.close(); }
  }, 30_000);

  it("claim release waits for actual command settlement", async () => {
    const f = fixture();
    const a = f.authority();
    try {
      await a.ensure(f.repository, "explicit-task", f.base);
      const record = await a.claim(identity(f.repository), "write", "release-barrier");
      const claim = new TaskClaim(a, {
        ...identity(f.repository), repository_id: record.repository_id, base_oid: record.base_oid,
        checkout: record.checkout, access: record.access, configCwd: f.repository,
      }, record.token);
      const run = claim.run({ argv: ["/bin/sh", "-c", "echo ready; sleep 30"], cwd: record.checkout, env: {}, timeout_ms: 300 });
      let isReleased = false;
      let releaseError: unknown;
      const release = claim.release().then(() => { isReleased = true; }, error => { releaseError = error; });
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(isReleased).toBe(false);
      expect((await run).is_timed_out).toBe(true);
      await release;
      expect(releaseError).toBeUndefined();
      expect(isReleased).toBe(true);
      await expect(claim.run({ argv: ["fixture"], cwd: record.checkout, env: {} })).rejects.toThrow("Task claim already released");
    } finally { await a.close(); }
  }, 30_000);

  it("returns TaskBusy for same-task writers while independent tasks can claim", async () => {
    const f = fixture();
    const a = f.authority();
    const b = f.authority();
    try {
      await a.ensure(f.repository, "explicit-task", f.base);
      await b.ensure(f.repository, "other-task", f.base);
      const writer = await a.claim(identity(f.repository), "write", "one");
      await expect(b.claim(identity(f.repository), "write", "two")).rejects.toMatchObject({ code: "TaskBusy" });
      const independent = await b.claim(identity(f.repository, "other-task"), "write", "two");
      expect(independent.checkout).not.toBe(writer.checkout);
      await a.release(identity(f.repository), writer.token);
      await b.release(identity(f.repository, "other-task"), independent.token);
    } finally { await a.close(); await b.close(); }
  }, 30_000);

  it("shared stable readers freeze writers and cannot run shell commands", async () => {
    const f = fixture();
    const a = f.authority();
    const b = f.authority();
    const c = f.authority();
    try {
      await a.ensure(f.repository, "explicit-task", f.base);
      const one = await a.claim(identity(f.repository), "read-stable", "reader-one");
      const two = await b.claim(identity(f.repository), "read-stable", "reader-two");
      expect(two.checkout).toBe(one.checkout);
      await expect(c.claim(identity(f.repository), "write", "writer")).rejects.toMatchObject({ code: "TaskBusy" });
      await expect(a.run(identity(f.repository), one.token, { argv: ["/bin/sh", "-c", "touch forbidden"], cwd: one.checkout, env: {} })).rejects.toMatchObject({ code: "TaskBusy" });
      await a.release(identity(f.repository), one.token);
      await b.release(identity(f.repository), two.token);
    } finally { await a.close(); await b.close(); await c.close(); }
  }, 30_000);

  it("awaits original run settlement on cancellation and exposes ordinary request TaskBusy", async () => {
    const f = fixture();
    const a = f.authority();
    try {
      await a.ensure(f.repository, "explicit-task", f.base);
      const claim = await a.claim(identity(f.repository), "write", "cancel");
      const controller = new AbortController();
      const run = a.run(identity(f.repository), claim.token, { argv: ["/bin/sh", "-c", "echo ready; sleep 30"], cwd: claim.checkout, env: {}, timeout_ms: 800 }, controller.signal);
      await new Promise(resolve => setTimeout(resolve, 200));
      await expect(a.verify(identity(f.repository), claim.token)).rejects.toMatchObject({ code: "TaskBusy" });
      controller.abort();
      const result = await run;
      expect(result.is_cancelled).toBe(true);
      expect(readFileSync(result.stdout, "utf8")).toBe("ready\n");
      await a.release(identity(f.repository), claim.token);
      const retry = await a.claim(identity(f.repository), "write", "retry");
      expect(retry.checkout).toBe(claim.checkout);
      await a.release(identity(f.repository), retry.token);
    } finally { await a.close(); }
  }, 30_000);

  it("returns a finished run when a late cancel loses the race, and release still succeeds", async () => {
    const f = fixture();
    const a = f.authority();
    try {
      await a.ensure(f.repository, "explicit-task", f.base);
      const record = await a.claim(identity(f.repository), "write", "late-cancel");
      const claim = new TaskClaim(a, {
        ...identity(f.repository), repository_id: record.repository_id, base_oid: record.base_oid,
        checkout: record.checkout, access: record.access, configCwd: f.repository,
      }, record.token);
      const controller = new AbortController();
      // Abort from the stdout chunk that carries the run's own response, after the
      // authority has matched it, so the cancel reaches a helper with no active run.
      (a as unknown as { child: { stdout: NodeJS.ReadableStream } }).child.stdout.on("data", (data: Buffer) => {
        if (data.toString().includes('"is_cancelled"')) controller.abort();
      });
      const result = await claim.run({ argv: ["/bin/sh", "-c", "echo finished"], cwd: record.checkout, env: {} }, controller.signal);
      expect(controller.signal.aborted).toBe(true);
      expect(result).toMatchObject({ exit_code: 0, is_cancelled: false });
      expect(readFileSync(result.stdout, "utf8")).toBe("finished\n");
      await expect(claim.release()).resolves.toBeUndefined();
    } finally { await a.close(); }
  }, 30_000);
});
