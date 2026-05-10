import {
  MODEL_DESIGNATIONS,
  type AIConfig,
  type ApiKey,
} from "@/lib/ai-models";
import type { CustomPrompts } from "@/lib/types";

export type AITaskModel =
  | "structuredExtraction"
  | "resumeScoring"
  | "simpleRewrite"
  | "contentGeneration"
  | "coverLetter"
  | "jobTailoring"
  | "chatAssistant";

interface TaskModelInput {
  config?: AIConfig;
  isPro: boolean;
  task: AITaskModel;
  respectSelectedModel?: boolean;
}

interface TaskModelConfigParts {
  apiKeys: ApiKey[];
  customPrompts?: CustomPrompts;
}

function getConfigParts(config?: AIConfig): TaskModelConfigParts {
  return {
    apiKeys: config?.apiKeys ?? [],
    ...(config?.customPrompts ? { customPrompts: config.customPrompts } : {}),
  };
}

export function getTaskModel(task: AITaskModel, isPro: boolean): string {
  switch (task) {
    case "structuredExtraction":
      return MODEL_DESIGNATIONS.STRUCTURED_EXTRACTION;
    case "resumeScoring":
      return MODEL_DESIGNATIONS.RESUME_SCORING;
    case "simpleRewrite":
      return MODEL_DESIGNATIONS.SIMPLE_REWRITE;
    case "contentGeneration":
      return MODEL_DESIGNATIONS.CONTENT_GENERATION;
    case "coverLetter":
      return MODEL_DESIGNATIONS.COVER_LETTER;
    case "jobTailoring":
      return isPro
        ? MODEL_DESIGNATIONS.JOB_TAILORING_PRO
        : MODEL_DESIGNATIONS.JOB_TAILORING_FREE;
    case "chatAssistant":
      return isPro
        ? MODEL_DESIGNATIONS.CHAT_ASSISTANT_PRO
        : MODEL_DESIGNATIONS.CHAT_ASSISTANT_FREE;
  }
}

export function withTaskModel(input: TaskModelInput): AIConfig {
  if (input.respectSelectedModel && input.config?.model) {
    return {
      ...getConfigParts(input.config),
      model: input.config.model,
    };
  }

  return {
    ...getConfigParts(input.config),
    model: getTaskModel(input.task, input.isPro),
  };
}

export function dedupeAIConfigs(configs: AIConfig[]): AIConfig[] {
  const seen = new Set<string>();
  return configs.filter((config) => {
    if (seen.has(config.model)) {
      return false;
    }

    seen.add(config.model);
    return true;
  });
}
