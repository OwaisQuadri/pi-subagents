import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as piAi from "@earendil-works/pi-ai";
import { fauxAssistantMessage } from "@earendil-works/pi-ai";
import { SessionManager } from "@earendil-works/pi-coding-agent";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Real pi-mono session construction; a cold first run under full-suite CPU
// contention can exceed vitest's 5s default.
vi.setConfig({ testTimeout: 30_000 });

// Hoisted so the (lifted) mock factory can reach it. Everything except the
// capture is the real module — the point is to construct a REAL session.
const { sessions } = vi.hoisted(() => ({ sessions: [] as any[] }));

vi.mock("@earendil-works/pi-coding-agent", async () => {
  const actual = await vi.importActual<any>("@earendil-works/pi-coding-agent");
  return {
    ...actual,
    createAgentSession: async (opts: any) => {
      const created = await actual.createAgentSession(opts);
      sessions.push(created.session);
      return created;
    },
  };
});

import { runMentionClone } from "../../src/mention-clone.js";
import { fauxModelBackend } from "../helpers/faux-model-backend.js";
import { registerFauxProvider, responderContext } from "../helpers/pi-ai.js";

describe("mention clone tool reachability against real pi-mono", () => {
  let cwd: string;
  let faux: ReturnType<typeof registerFauxProvider>;

  beforeEach(() => {
    sessions.length = 0;
    cwd = mkdtempSync(join(tmpdir(), "subagents-mention-clone-"));
    vi.stubEnv("PI_CODING_AGENT_DIR", join(cwd, "agent"));
    faux = registerFauxProvider({ provider: "faux", models: [{ id: "faux-1", contextWindow: 200_000 }] });
  });
  afterEach(() => {
    faux.unregister();
    vi.unstubAllEnvs();
    rmSync(cwd, { recursive: true, force: true });
  });

  it.each([false, true])("preserves history with summaries=%s and exposes only Agent", async (isSummarized) => {
    const model = faux.getModel();
    const backend = fauxModelBackend(model);
    const parentSession = SessionManager.inMemory(cwd);
    if ("getCurrentTools" in piAi) {
      parentSession.appendMessage({
        role: "system", content: "PARENT TRANSCRIPT PROMPT",
        toolsAdded: [{ name: "bash", description: "Parent tool", parameters: { type: "object" } }],
        timestamp: 0,
      } as any);
    }
    const originalId = parentSession.appendMessage({ role: "user", content: "PARENT CONVERSATION", timestamp: 1 });
    if (isSummarized) {
      parentSession.branchWithSummary(originalId, "PARENT BRANCH SUMMARY");
      parentSession.appendCompaction("PARENT COMPACTION SUMMARY", originalId, 1000);
    }
    const ctx: any = {
      cwd,
      model,
      getSystemPrompt: () => "PARENT",
      modelRegistry: { ...backend.modelRegistry, runtime: backend.modelRuntime },
      sessionManager: parentSession,
    };

    const requests: any[] = [];
    faux.setResponses([async (context) => {
      requests.push(context);
      return fauxAssistantMessage("done");
    }]);
    const agentTool = {
      name: "Agent", label: "Agent", description: "Start an agent",
      parameters: { type: "object", properties: {} }, execute: vi.fn(),
    } as any;
    const result = await runMentionClone({ ctx, type: "Explore", message: "go", agentTool });
    expect(result.error).toBe("the conversation clone did not start it");
    expect(requests, JSON.stringify(sessions[0]?.agent.state.messages)).toHaveLength(1);
    const request = requests[0];
    const effective = responderContext(request);
    expect(effective.systemPrompt).toContain("PARENT");
    expect(effective.tools?.map((tool) => tool.name)).toEqual(["Agent"]);
    const declaredTools = request.messages.flatMap((entry: any) => entry.role === "system" ? entry.toolsAdded ?? [] : []);
    expect(declaredTools.every((tool: any) => tool.name === "Agent")).toBe(true);
    expect(sessions[0].sessionManager.getSessionId()).not.toBe(parentSession.getSessionId());

    expect(sessions).toHaveLength(1);
    expect(sessions[0].getActiveToolNames()).toEqual(["Agent"]);
    expect(request.messages.some((entry: any) => entry.role === "user" && entry.content === "PARENT CONVERSATION")).toBe(true);
    if (isSummarized) {
      const userMessages = request.messages.filter((entry: any) => entry.role === "user");
      expect(JSON.stringify(userMessages)).toContain("PARENT BRANCH SUMMARY");
      expect(JSON.stringify(userMessages)).toContain("PARENT COMPACTION SUMMARY");
    }
  });
});
