import { open } from "node:fs/promises";
import { type ExtensionAPI, type ExtensionContext, getAgentDir, SettingsManager } from "@earendil-works/pi-coding-agent";
import type { AgentManager, OnBeforeTaskSettlement } from "../agent-manager.js";
import { getAgentConfig, resolveSpawnType } from "../agent-types.js";
import { resolveModel } from "../model-resolver.js";
import { checkModelScope } from "../model-scope.js";
import { type TaskClaim, type TaskSnapshot, taskShellArgv, validateTaskAccess, validateTaskId, validateTaskSnapshot } from "../task-worktree.js";
import type { AgentRecord, ThinkingLevel } from "../types.js";
import { getLifetimeTotal } from "../usage.js";
import type { WorkflowGateResult, WorkflowHost, WorkflowSpawnRequest, WorkflowSpawnResult } from "./runtime.js";
import { resolveWorkflowSource } from "./saved.js";

export const DEFAULT_GATE_TIMEOUT_MS = 10 * 60_000;
export interface WorkflowHostOptions {
  pi: ExtensionAPI;
  ctx: ExtensionContext;
  manager: AgentManager;
  taskSnapshot?: TaskSnapshot;
  signal?: AbortSignal;
  rootSessionId?: string;
  workflowId?: string;
  gateTimeoutMs?: number;
}
function isSucceeded(record: AgentRecord): boolean { return record.status === "completed" || record.status === "steered"; }
function resolvedInfo(record: AgentRecord | undefined) {
  const invocation = record?.invocation;
  if (invocation?.modelName === undefined) return undefined;
  return { modelName: invocation.modelName, modelId: invocation.modelId, thinking: invocation.thinking,
    requestedThinking: invocation.requestedThinking, requestedModel: invocation.requestedModel };
}
function toSpawnResult(record: AgentRecord, gate?: WorkflowGateResult): WorkflowSpawnResult {
  const tokens = getLifetimeTotal(record.lifetimeUsage);
  const outputTokens = record.lifetimeUsage?.output ?? 0;
  const common = {
    ...(tokens > 0 ? { tokens } : {}), ...(outputTokens > 0 ? { outputTokens } : {}),
    ...(record.toolUses > 0 ? { toolCalls: record.toolUses } : {}),
    ...(record.taskSnapshot !== undefined ? { cwd: record.taskSnapshot.checkout, taskSnapshot: record.taskSnapshot } : {}),
  };
  // A stop while a finished child's gate runs keeps the child's own status (only
  // running records stop) but cancels its verification: that is still a skip.
  if (gate !== undefined && !gate.ok && record.abortController?.signal.aborted) return { ...common, ok: false, skipped: true, error: gate.output };
  if (isSucceeded(record)) return { ...common, ok: true, text: record.structuredJson ?? record.result ?? "",
    ...(record.structuredRetried ? { structuredRetried: true } : {}), ...(gate !== undefined ? { gate } : {}) };
  if (record.status === "stopped") return { ...common, ok: false, skipped: true, error: record.error ?? "Stopped." };
  return { ...common, ok: false, error: record.error ?? `Agent ${record.status}.` };
}
async function evidenceTail(path: string): Promise<string> {
  const file = await open(path, "r");
  try {
    const { size } = await file.stat(); const buffer = Buffer.alloc(12_800);
    const { bytesRead } = await file.read(buffer, 0, buffer.length, Math.max(0, size - buffer.length));
    const lines = buffer.subarray(0, bytesRead).toString("utf8").trim().split("\n");
    return lines.slice(-500).join("\n") + (size > bytesRead || lines.length > 500 ? "\n[bounded tail; earlier bytes/lines omitted]" : "");
  } finally { await file.close(); }
}
export function createWorkflowHost(deps: WorkflowHostOptions): WorkflowHost {
  const { pi, ctx, manager } = deps;
  const gateTimeoutMs = deps.gateTimeoutMs ?? DEFAULT_GATE_TIMEOUT_MS;
  if (!Number.isSafeInteger(gateTimeoutMs) || gateTimeoutMs <= 0 || gateTimeoutMs > DEFAULT_GATE_TIMEOUT_MS) throw new Error("Gate timeout must be a positive integer no greater than ten minutes");
  const captured = deps.taskSnapshot === undefined ? undefined : validateTaskSnapshot(deps.taskSnapshot);
  const repository = captured?.repository ?? ctx.cwd;
  const configCwd = captured?.configCwd ?? ctx.cwd;
  const records = new Map<string, string>();
  const snapshots = new Map<string, TaskSnapshot>();
  const commands = new Map<string, string>();
  const selections = new Map<string, { model: ExtensionContext["model"]; thinking?: ThinkingLevel }>();
  const controllers = new Map<string, AbortController>();
  const pending = new Set<Promise<WorkflowSpawnResult>>();
  const settlementErrors: string[] = [];
  const warnedScopeMessages = new Set<string>();
  async function executeGate(command: string, claim: TaskClaim, record: AgentRecord): Promise<WorkflowGateResult> {
    const shellPath = SettingsManager.create(claim.snapshot.configCwd, getAgentDir()).getShellPath();
    const result = await claim.run({ argv: taskShellArgv(shellPath, command), cwd: claim.snapshot.checkout, env: {},
      timeout_ms: gateTimeoutMs }, record.abortController?.signal);
    const output = (await Promise.all([evidenceTail(result.stdout), evidenceTail(result.stderr)])).filter(Boolean).join("\n");
    if (result.is_timed_out) return { ok: false, output: output || `Gate command timed out: ${command}` };
    if (result.is_cancelled) return { ok: false, output: output || `Gate command cancelled: ${command}` };
    if (result.is_disconnected || result.exit_code === null) return { ok: false, output: output || `Gate command did not settle successfully: ${command}` };
    return { ok: result.exit_code === 0, output };
  }
  function track(agentId: string, operation: (signal: AbortSignal) => Promise<WorkflowSpawnResult>): Promise<WorkflowSpawnResult> {
    const controller = new AbortController(); controllers.set(agentId, controller);
    const onAbort = () => controller.abort(); deps.signal?.addEventListener("abort", onAbort, { once: true });
    if (deps.signal?.aborted) controller.abort();
    const promise = operation(controller.signal).finally(() => {
      deps.signal?.removeEventListener("abort", onAbort);
      if (controllers.get(agentId) === controller) controllers.delete(agentId);
      pending.delete(promise);
    });
    pending.add(promise); return promise;
  }
  function gateHook(command: string | undefined, report: (gate: WorkflowGateResult) => void): OnBeforeTaskSettlement {
    return async (claim, record) => {
      if (command === undefined || !isSucceeded(record)) return;
      try { report(await executeGate(command, claim, record)); }
      catch (error) { report({ ok: false, output: error instanceof Error ? error.message : String(error) }); }
    };
  }
  async function spawn(request: WorkflowSpawnRequest, signal: AbortSignal): Promise<WorkflowSpawnResult> {
    const dispatch = resolveSpawnType(request.agentType); if (!dispatch.ok) return { ok: false, error: dispatch.message };
    let model = ctx.model; const config = getAgentConfig(dispatch.type);
    if (request.model !== undefined) {
      const resolved = resolveModel(request.model, ctx.modelRegistry);
      if (typeof resolved === "string") return { ok: false, error: resolved }; model = resolved;
    }
    const scopeVerdict = checkModelScope({ model, cwd: captured?.configCwd ?? ctx.cwd, modelRegistry: ctx.modelRegistry,
      callerSupplied: request.model !== undefined, agentLabel: config?.displayName ?? dispatch.type, modelInput: request.model });
    if (scopeVerdict.kind === "error") return { ok: false, error: scopeVerdict.message };
    if (scopeVerdict.kind === "warn" && !warnedScopeMessages.has(scopeVerdict.message)) {
      warnedScopeMessages.add(scopeVerdict.message); ctx.ui.notify(scopeVerdict.message, "warning");
    }
    let gate: WorkflowGateResult | undefined; let spawnedId: string | undefined; let isSessionReady = false;
    const reportResolved = () => {
      if (!isSessionReady || spawnedId === undefined) return;
      const info = resolvedInfo(manager.getRecord(spawnedId)); if (info !== undefined) request.onResolved?.(info);
    };
    try {
      if (Object.hasOwn(request, "taskSnapshot")) throw new Error("Workflow taskSnapshot is an internal capability");
      const task_id = request.task_id === undefined ? captured?.task_id : validateTaskId(request.task_id);
      if (task_id === undefined) throw new Error("Workflow requires an explicit task_id or captured binding; use /agents task bind");
      const access = request.task_access === undefined ? captured?.access ?? "write" : validateTaskAccess(request.task_access);
      const prior = snapshots.get(request.agentId);
      if (prior && (task_id !== prior.task_id || access !== prior.access)) throw new Error("Retry task fields differ from the original child snapshot");
      const snapshot = prior ?? (task_id === captured?.task_id ? validateTaskSnapshot({ ...captured, access })
        : await manager.captureTaskSnapshot(repository, task_id, { access, configCwd }));
      snapshots.set(request.agentId, snapshot); if (request.gate !== undefined) commands.set(request.agentId, request.gate);
      const selection = selections.get(request.agentId) ?? { model, thinking: request.effort as ThinkingLevel | undefined ?? ctx.thinkingLevel ?? pi.getThinkingLevel?.() };
      selections.set(request.agentId, selection);
      const { record } = await manager.spawnAndWait(pi, ctx, dispatch.type, request.prompt, {
        description: request.label, taskSnapshot: snapshot, task_id, task_access: access,
        ...(deps.workflowId !== undefined ? { workflowId: deps.workflowId } : {}),
        ...(selection.model !== undefined ? { model: selection.model } : {}), ...(selection.thinking !== undefined ? { thinkingLevel: selection.thinking } : {}),
        invocation: { ...(request.effort !== undefined ? { thinking: request.effort as ThinkingLevel } : {}) },
        onSessionCreated: () => { isSessionReady = true; reportResolved(); },
        ...(request.schema !== undefined ? { structuredOutput: request.schema } : {}),
        signal,
        ...(deps.rootSessionId !== undefined ? { rootSessionId: deps.rootSessionId } : {}),
        ...(request.gate === undefined ? {} : { onBeforeTaskSettlement: gateHook(request.gate, value => { gate = value; }) }),
      }, id => { spawnedId = id; records.set(request.agentId, id); request.onResolved?.({ recordId: id }); reportResolved(); });
      return toSpawnResult(record, gate);
    } catch (error) {
      const record = spawnedId === undefined ? undefined : manager.getRecord(spawnedId);
      if (record?.taskSettlementError) settlementErrors.push(record.taskSettlementError);
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
  return {
    journalContext(input) {
      const snapshot = input.task_id === undefined || input.task_id === captured?.task_id ? captured : undefined;
      return { identity: snapshot === undefined ? undefined : { ...snapshot, access: input.task_access ?? snapshot.access } };
    },
    spawnAgent(request) { return track(request.agentId, signal => spawn(request, signal)); },
    abortAgent(agentId) { controllers.get(agentId)?.abort(); const id = records.get(agentId); if (id !== undefined) manager.abort(id); },
    async settle() {
      const attempts = await Promise.allSettled(pending);
      const errors = [...settlementErrors, ...attempts.filter(attempt => attempt.status === "rejected").map(attempt => String(attempt.reason))];
      if (errors.length) throw new Error(`Workflow task settlement failed: ${errors.join("; ")}`);
    },
    resumeAgent(agentId, prompt, onResolved) {
      return track(agentId, async signal => {
        const id = records.get(agentId); if (id === undefined) return { ok: false, error: `Cannot resume "${agentId}" — it never started.` };
        let gate: WorkflowGateResult | undefined;
        try {
          const record = await manager.resume(id, prompt, signal, { onBeforeTaskSettlement: gateHook(commands.get(agentId), value => { gate = value; }) });
          if (record === undefined) return { ok: false, error: `Agent ${id} has no idle session left to resume.` };
          onResolved?.({ recordId: id }); const info = resolvedInfo(record); if (info !== undefined) onResolved?.(info);
          return toSpawnResult(record, gate);
        } catch (error) {
          const record = manager.getRecord(id); if (record?.taskSettlementError) settlementErrors.push(record.taskSettlementError);
          return { ok: false, error: error instanceof Error ? error.message : String(error) };
        }
      });
    },
    loadWorkflow(ref) { return resolveWorkflowSource(ref, captured?.configCwd ?? ctx.cwd); },
    async runGate(command) { return { ok: false, output: `Gate was not executed while the child task claim was held: ${command}` }; },
  };
}
