import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createAgentSession,
  createEventBus,
  DefaultResourceLoader,
  defineTool,
  type ExtensionAPI,
  ModelRuntime,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { expect, it, vi } from "vitest";
import { createAskUserQuestionTool } from "../../src/ask-user-question.js";
import { registerFauxProvider } from "../helpers/pi-ai.js";

it("keeps the custom user client active over a child extension before and after re-registration", async () => {
  const cwd = mkdtempSync(join(tmpdir(), "question-tools-"));
  const agentDir = join(cwd, "agent");
  const faux = registerFauxProvider({
    provider: "question-tools-faux",
    models: [{ id: "question-tools-model", contextWindow: 200_000 }],
  });
  const events = createEventBus();
  const params = { question: "Which source file?", details: "Keep the answer unchanged." };
  const answer = "  src/agent-runner.ts\nKeep this line.  ";
  const response = {
    content: [{ type: "text", text: `User answered: ${answer}` }],
    details: {
      status: "answered",
      question: params.question,
      context: params.details,
      mode: "text",
      answers: [{ type: "text", label: answer, value: answer }],
      message: undefined,
    },
  };
  const ping = vi.fn((payload: unknown) => {
    const { requestId } = payload as { requestId: string };
    events.emit(`ask-user-question:rpc:ping:reply:${requestId}`, { success: true, data: { version: 1 } });
  });
  const ask = vi.fn((payload: unknown) => {
    const { requestId } = payload as { requestId: string };
    events.emit(`ask-user-question:rpc:ask:reply:${requestId}`, { success: true, data: response });
  });
  events.on("ask-user-question:rpc:ping", ping);
  events.on("ask-user-question:rpc:ask", ask);
  const decoyExecute = vi.fn(async () => ({
    content: [{ type: "text" as const, text: "CHILD EXTENSION DECOY" }],
    details: { source: "child-extension" },
  }));
  const decoy = defineTool({
    name: "ask_user_question",
    label: "Child question decoy",
    description: "Return the child extension decoy.",
    parameters: Type.Object({ question: Type.String() }),
    execute: decoyExecute,
  });
  const childApis: ExtensionAPI[] = [];
  const childHasUI: boolean[] = [];
  let session: Awaited<ReturnType<typeof createAgentSession>>["session"] | undefined;
  try {
    const settingsManager = SettingsManager.inMemory({
      packages: [],
      compaction: { enabled: false },
      retry: { enabled: false },
      enableAnalytics: false,
      enableInstallTelemetry: false,
    });
    const modelRuntime = await ModelRuntime.create({
      authPath: join(agentDir, "auth.json"),
      modelsPath: join(agentDir, "models.json"),
      modelsStorePath: join(agentDir, "models-store.json"),
      allowModelNetwork: false,
      refreshOnCreate: false,
    });
    const stream = vi.spyOn(modelRuntime, "streamSimple");
    const loader = new DefaultResourceLoader({
      cwd,
      agentDir,
      settingsManager,
      noExtensions: true,
      noSkills: true,
      noPromptTemplates: true,
      noThemes: true,
      noContextFiles: true,
      systemPrompt: "Test question tool registration without model requests.",
      extensionFactories: [pi => {
        childApis.push(pi);
        pi.registerTool(decoy);
        pi.on("session_start", (_event, ctx) => { childHasUI.push(ctx.hasUI); });
      }],
    });
    await loader.reload();
    expect(loader.getExtensions().errors).toEqual([]);
    expect(loader.getExtensions().extensions).toHaveLength(1);
    expect(loader.getExtensions().extensions[0].tools.get(decoy.name)?.definition).toBe(decoy);
    const customTool = createAskUserQuestionTool({ events } as unknown as ExtensionAPI);
    ({ session } = await createAgentSession({
      cwd,
      agentDir,
      model: faux.getModel(),
      modelRuntime,
      settingsManager,
      sessionManager: SessionManager.inMemory(cwd),
      resourceLoader: loader,
      tools: [customTool.name],
      customTools: [customTool],
    }));
    await session.bindExtensions({ mode: "print" });
    expect(childHasUI).toEqual([false]);
    expect(childApis).toHaveLength(1);

    for (const phase of ["initial", "refreshed"]) {
      if (phase === "refreshed") {
        const previousActiveTool = session.agent.state.tools[0];
        childApis[0].registerTool({ ...decoy, label: "Re-registered child decoy" });
        expect(loader.getExtensions().extensions[0].tools.get(decoy.name)?.definition.label)
          .toBe("Re-registered child decoy");
        expect(session.agent.state.tools[0]).not.toBe(previousActiveTool);
      }
      expect(session.getActiveToolNames()).toEqual([customTool.name]);
      expect(session.agent.state.tools).toHaveLength(1);
      expect(session.getAllTools().filter(tool => tool.name === customTool.name)).toHaveLength(1);
      expect(session.getToolDefinition(customTool.name)).toBe(customTool);
      const activeTool = session.agent.state.tools[0];
      const result = await activeTool.execute(`question-${phase}`, params, undefined);

      expect(result).toStrictEqual(response);
      expect(decoyExecute).not.toHaveBeenCalled();
      expect(ask).toHaveBeenCalledTimes(phase === "initial" ? 1 : 2);
      expect(ping).toHaveBeenCalledTimes(phase === "initial" ? 1 : 2);
      expect(ask).toHaveBeenLastCalledWith({
        requestId: expect.any(String), params, signal: expect.any(AbortSignal),
      });
    }
    expect(stream).not.toHaveBeenCalled();
    expect(session.messages).toEqual([]);
  } finally {
    session?.dispose();
    events.clear();
    faux.unregister();
    rmSync(cwd, { recursive: true, force: true });
  }
}, 30_000);
