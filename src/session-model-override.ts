import type { Model, ModelThinkingLevel } from "@earendil-works/pi-ai";
import { type ModelRegistry, resolveModel } from "./model-resolver.js";

const THINKING_LEVELS = new Set<ModelThinkingLevel>(["off", "minimal", "low", "medium", "high", "xhigh", "max"]);

export interface SessionModelOverrideResult {
  success: boolean;
  error?: string;
}

type ModelValidator = (model: Model<any>, modelInput: string) => SessionModelOverrideResult;

interface ActiveOverride {
  model: Model<any>;
  thinkingLevel: ModelThinkingLevel;
  excludedAgentTypes: Set<string>;
}

interface SpawnModelOptions {
  model?: Model<any>;
  thinkingLevel?: ModelThinkingLevel;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class SessionModelOverride {
  private active: ActiveOverride | undefined;

  update(
    request: unknown,
    modelRegistry: ModelRegistry | undefined,
    validateModel?: ModelValidator,
  ): SessionModelOverrideResult {
    if (!isRecord(request)) return { success: false, error: "Invalid session model override request." };

    const keys = Object.keys(request);
    if (request.clear === true) {
      if (keys.length !== 1) return { success: false, error: "Invalid session model override request." };
      this.active = undefined;
      return { success: true };
    }

    if (!keys.every(key => key === "model" || key === "thinkingLevel" || key === "excludedAgentTypes")) {
      return { success: false, error: "Invalid session model override request." };
    }
    if (typeof request.model !== "string" || !THINKING_LEVELS.has(request.thinkingLevel as ModelThinkingLevel)) {
      return { success: false, error: "Invalid session model override request." };
    }
    if (
      request.excludedAgentTypes !== undefined
      && (!Array.isArray(request.excludedAgentTypes) || request.excludedAgentTypes.some(type => typeof type !== "string" || !type))
    ) {
      return { success: false, error: "Invalid session model override request." };
    }
    if (!modelRegistry) {
      return { success: false, error: "Model override provided but ctx.modelRegistry is unavailable" };
    }

    const model = resolveModel(request.model, modelRegistry);
    if (typeof model === "string") return { success: false, error: model };

    const validation = validateModel?.(model, request.model);
    if (validation && !validation.success) return validation;

    this.active = {
      model,
      thinkingLevel: request.thinkingLevel as ModelThinkingLevel,
      excludedAgentTypes: new Set((request.excludedAgentTypes ?? []).map(type => type.toLowerCase())),
    };
    return { success: true };
  }

  apply<T extends SpawnModelOptions>(agentType: string, options: T): T {
    if (!this.active || this.active.excludedAgentTypes.has(agentType.toLowerCase())) return options;
    return { ...options, model: this.active.model, thinkingLevel: this.active.thinkingLevel };
  }
}
