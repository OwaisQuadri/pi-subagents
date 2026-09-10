import { type EventBus, type SettingsManager, VERSION } from "@earendil-works/pi-coding-agent";

export const MEMORY_COMPACTION_POLICY_EVENT = "om:compaction-policy";

export interface MemoryCompactionPolicy {
  isEnabled: boolean;
  contextWindow: number;
  threshold: number;
  isApplied: boolean;
  keepRecentTokens?: number;
  error?: string;
}

type CompactionSettings = ReturnType<SettingsManager["getCompactionSettings"]>;

function isSupportedVersion(version: string): boolean {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!match) return false;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  return major > 0 || (major === 0 && (minor > 85 || (minor === 85 && patch >= 1)));
}

function isValidThreshold(contextWindow: number, threshold: number): boolean {
  return Number.isSafeInteger(contextWindow)
    && Number.isSafeInteger(threshold)
    && contextWindow > 0
    && threshold > 0
    && threshold <= contextWindow;
}

function isMemoryCompactionPolicy(data: unknown): data is MemoryCompactionPolicy {
  if (typeof data !== "object" || data === null) return false;
  const policy = data as Partial<MemoryCompactionPolicy>;
  return typeof policy.isEnabled === "boolean"
    && typeof policy.contextWindow === "number"
    && typeof policy.threshold === "number"
    && typeof policy.isApplied === "boolean"
    && (policy.keepRecentTokens === undefined || (Number.isSafeInteger(policy.keepRecentTokens) && policy.keepRecentTokens >= 0));
}

/**
 * Installs one child-local observational-memory policy receiver.
 *
 * @param eventBus - The child event bus that carries synchronous extension messages.
 * @param settingsManager - The child settings manager whose in-memory compaction values are overridden.
 * @param version - The Pi runtime version used to verify between-turn compaction support.
 * @returns A release function that restores the initial compaction settings.
 * @throws Never throws; invalid policies receive an error acknowledgement instead.
 */
export function installMemoryCompactionPolicy(
  eventBus: EventBus,
  settingsManager: SettingsManager,
  version = VERSION,
): () => void {
  let originalSettings: CompactionSettings | undefined;

  const restore = () => {
    if (!originalSettings) return;
    settingsManager.applyOverrides({ compaction: originalSettings });
    originalSettings = undefined;
  };

  const unsubscribe = eventBus.on(MEMORY_COMPACTION_POLICY_EVENT, (data) => {
    if (!isMemoryCompactionPolicy(data)) return;

    if (!data.isEnabled) {
      restore();
      data.isApplied = true;
      return;
    }

    if (!isSupportedVersion(version)) {
      data.error = `Pi ${version} does not support between-turn automatic compaction`;
      return;
    }

    if (!isValidThreshold(data.contextWindow, data.threshold)) {
      data.error = "Observational-memory compaction policy requires integer threshold within the context window";
      return;
    }

    originalSettings ??= settingsManager.getCompactionSettings();
    settingsManager.applyOverrides({
      compaction: {
        enabled: true,
        reserveTokens: data.contextWindow - data.threshold + 1,
        keepRecentTokens: Math.max(originalSettings.keepRecentTokens, data.keepRecentTokens ?? 0),
      },
    });
    data.isApplied = true;
  });

  return () => {
    unsubscribe();
    restore();
  };
}
