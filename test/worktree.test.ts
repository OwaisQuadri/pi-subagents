import { afterEach, describe, expect, it } from "vitest";
import { isWorktreeIsolationEnabled, setWorktreeIsolationEnabled } from "../src/worktree.js";

/**
 * The project switch itself (`worktreeIsolation`, #184). Its consumers — both
 * tool schemas and the invocation resolver — mock this module, so without this
 * block the real singleton is never executed and its default is never exercised.
 */
describe("worktree isolation switch", () => {
  afterEach(() => setWorktreeIsolationEnabled(true));

  it("defaults to enabled", () => {
    expect(isWorktreeIsolationEnabled()).toBe(true);
  });

  it("round-trips both ways", () => {
    setWorktreeIsolationEnabled(false);
    expect(isWorktreeIsolationEnabled()).toBe(false);
    setWorktreeIsolationEnabled(true);
    expect(isWorktreeIsolationEnabled()).toBe(true);
  });
});
