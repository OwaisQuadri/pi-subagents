/**
 * worktree.ts — the legacy `worktreeIsolation` project setting.
 *
 * Every managed agent runs in its claimed task checkout, so nothing here creates,
 * commits or removes a worktree. The setting only decides whether the `Agent`
 * and nested tools still declare the ignored `isolation` parameter.
 */

/**
 * Project-wide switch (`worktreeIsolation` in subagents.json). Default `true`.
 * Read at tool registration: off drops the `isolation` parameter from the tool
 * schemas on the next session.
 */
let isWorktreeIsolationOn = true;

export function setWorktreeIsolationEnabled(isEnabled: boolean): void {
  isWorktreeIsolationOn = isEnabled;
}

export function isWorktreeIsolationEnabled(): boolean {
  return isWorktreeIsolationOn;
}
