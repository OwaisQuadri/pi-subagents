import { createEventBus, SettingsManager } from "@earendil-works/pi-coding-agent";
import { describe, expect, it } from "vitest";
import {
  installMemoryCompactionPolicy,
  MEMORY_COMPACTION_POLICY_EVENT,
  type MemoryCompactionPolicy,
} from "../src/native-memory-compaction.js";

function policy(overrides: Partial<MemoryCompactionPolicy> = {}): MemoryCompactionPolicy {
  return {
    isEnabled: true,
    contextWindow: 100,
    threshold: 40,
    isApplied: false,
    ...overrides,
  };
}

describe("observational-memory compaction policy", () => {
  it("translates the inclusive memory threshold to Pi's strict native boundary", () => {
    const eventBus = createEventBus();
    const settingsManager = SettingsManager.inMemory({ compaction: { enabled: false, reserveTokens: 20, keepRecentTokens: 12 } });
    installMemoryCompactionPolicy(eventBus, settingsManager, "0.85.1");
    const update = policy();

    eventBus.emit(MEMORY_COMPACTION_POLICY_EVENT, update);

    expect(update.isApplied).toBe(true);
    expect(settingsManager.getCompactionSettings()).toEqual({ enabled: true, reserveTokens: 61, keepRecentTokens: 12 });
  });

  it("keeps the pending tool-result allowance when it exceeds the original tail", () => {
    const eventBus = createEventBus();
    const settingsManager = SettingsManager.inMemory({ compaction: { enabled: false, reserveTokens: 20, keepRecentTokens: 64 } });
    installMemoryCompactionPolicy(eventBus, settingsManager, "0.85.1");

    eventBus.emit(MEMORY_COMPACTION_POLICY_EVENT, policy({ keepRecentTokens: 9_001 }));

    expect(settingsManager.getCompactionSettings()).toEqual({ enabled: true, reserveTokens: 61, keepRecentTokens: 9_001 });
  });

  it("restores the original settings when memory releases ownership", () => {
    const eventBus = createEventBus();
    const settingsManager = SettingsManager.inMemory({ compaction: { enabled: false, reserveTokens: 20, keepRecentTokens: 12 } });
    installMemoryCompactionPolicy(eventBus, settingsManager, "0.85.1");

    eventBus.emit(MEMORY_COMPACTION_POLICY_EVENT, policy());
    const release = policy({ isEnabled: false, contextWindow: 0, threshold: 0 });
    eventBus.emit(MEMORY_COMPACTION_POLICY_EVENT, release);

    expect(release.isApplied).toBe(true);
    expect(settingsManager.getCompactionSettings()).toEqual({ enabled: false, reserveTokens: 20, keepRecentTokens: 12 });
  });

  it("updates the reserve when the selected model changes", () => {
    const eventBus = createEventBus();
    const settingsManager = SettingsManager.inMemory({ compaction: { enabled: true, reserveTokens: 20, keepRecentTokens: 12 } });
    installMemoryCompactionPolicy(eventBus, settingsManager, "0.85.1");

    eventBus.emit(MEMORY_COMPACTION_POLICY_EVENT, policy());
    eventBus.emit(MEMORY_COMPACTION_POLICY_EVENT, policy({ contextWindow: 200, threshold: 75 }));

    expect(settingsManager.getCompactionSettings()).toEqual({ enabled: true, reserveTokens: 126, keepRecentTokens: 12 });
  });

  it("rejects runtimes without between-turn automatic compaction", () => {
    const eventBus = createEventBus();
    const settingsManager = SettingsManager.inMemory({ compaction: { enabled: false, reserveTokens: 20, keepRecentTokens: 12 } });
    installMemoryCompactionPolicy(eventBus, settingsManager, "0.84.2");
    const update = policy();

    eventBus.emit(MEMORY_COMPACTION_POLICY_EVENT, update);

    expect(update.isApplied).toBe(false);
    expect(update.error).toContain("does not support");
    expect(settingsManager.getCompactionSettings()).toEqual({ enabled: false, reserveTokens: 20, keepRecentTokens: 12 });
  });

  it("keeps concurrent child settings independent", () => {
    const firstBus = createEventBus();
    const secondBus = createEventBus();
    const firstSettings = SettingsManager.inMemory({ compaction: { enabled: false, reserveTokens: 20, keepRecentTokens: 12 } });
    const secondSettings = SettingsManager.inMemory({ compaction: { enabled: false, reserveTokens: 30, keepRecentTokens: 16 } });
    installMemoryCompactionPolicy(firstBus, firstSettings, "0.85.1");
    installMemoryCompactionPolicy(secondBus, secondSettings, "0.85.1");

    firstBus.emit(MEMORY_COMPACTION_POLICY_EVENT, policy({ contextWindow: 100, threshold: 40 }));
    secondBus.emit(MEMORY_COMPACTION_POLICY_EVENT, policy({ contextWindow: 200, threshold: 75 }));

    expect(firstSettings.getCompactionSettings()).toEqual({ enabled: true, reserveTokens: 61, keepRecentTokens: 12 });
    expect(secondSettings.getCompactionSettings()).toEqual({ enabled: true, reserveTokens: 126, keepRecentTokens: 16 });
  });
});
