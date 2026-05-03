import type { LanguageModelUsage, LanguageModelV1 } from "ai";

import { checkRateLimit } from "@/lib/rateLimiter";
import { getDefaultModel } from "@/lib/ai-models";
import {
  resolveAIRequest,
  type ResolvedAIRequest,
} from "@/lib/ai/access-control";
import { createAIClientFromResolvedRequest, type AIConfig } from "@/utils/ai-tools";
import { createServiceClient } from "@/utils/supabase/server";

type AIUsageStatus = "succeeded" | "failed" | "rate_limited" | "blocked";

export class AIUsageError extends Error {
  constructor(
    message: string,
    public readonly code: "blocked" | "rate_limited" | "failed",
    public readonly status: number = 500
  ) {
    super(message);
    this.name = "AIUsageError";
  }
}

export async function recordAIUsageStarted(input: {
  userId: string;
  route: string;
  provider: string;
  model: string;
  isPro: boolean;
  usedServerKey: boolean;
}): Promise<string> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("ai_usage_events")
    .insert({
      user_id: input.userId,
      route: input.route,
      provider: input.provider,
      model: input.model,
      is_pro: input.isPro,
      used_server_key: input.usedServerKey,
      status: "started",
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

export async function recordAIUsageFinished(input: {
  id: string;
  status: AIUsageStatus;
  errorCode?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}): Promise<void> {
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("ai_usage_events")
    .update({
      status: input.status,
      error_code: input.errorCode ?? null,
      input_tokens: input.inputTokens ?? null,
      output_tokens: input.outputTokens ?? null,
      total_tokens: input.totalTokens ?? null,
    })
    .eq("id", input.id);

  if (error) {
    throw error;
  }
}

export function usageFromLanguageModelUsage(usage?: LanguageModelUsage) {
  if (!usage) {
    return {};
  }

  return {
    inputTokens: usage.promptTokens,
    outputTokens: usage.completionTokens,
    totalTokens: usage.totalTokens,
  };
}

export async function finishAIUsageRequest(input: {
  usageEventId: string;
  status: AIUsageStatus;
  usage?: LanguageModelUsage;
  errorCode?: string;
}) {
  await recordAIUsageFinished({
    id: input.usageEventId,
    status: input.status,
    errorCode: input.errorCode,
    ...usageFromLanguageModelUsage(input.usage),
  });
}

export async function startAIUsageRequest(input: {
  userId: string;
  route: string;
  config?: AIConfig;
  isPro: boolean;
  useThinking?: boolean;
}): Promise<{
  model: LanguageModelV1;
  usageEventId: string;
  resolved: ResolvedAIRequest;
}> {
  const requestedModel = input.config?.model ?? getDefaultModel(input.isPro);

  let resolved: ResolvedAIRequest;
  try {
    resolved = resolveAIRequest({
      requestedModel,
      apiKeys: input.config?.apiKeys ?? [],
      isPro: input.isPro,
    });
  } catch (error) {
    const usageEventId = await recordAIUsageStarted({
      userId: input.userId,
      route: input.route,
      provider: "unknown",
      model: requestedModel,
      isPro: input.isPro,
      usedServerKey: false,
    });

    await recordAIUsageFinished({
      id: usageEventId,
      status: "blocked",
      errorCode: error instanceof Error ? error.message : "access_denied",
    });

    throw new AIUsageError(
      error instanceof Error ? error.message : "AI request blocked",
      "blocked",
      403
    );
  }

  const usageEventId = await recordAIUsageStarted({
    userId: input.userId,
    route: input.route,
    provider: resolved.providerId,
    model: resolved.modelId,
    isPro: input.isPro,
    usedServerKey: resolved.usedServerKey,
  });

  if (resolved.requiresRateLimit) {
    try {
      await checkRateLimit(input.userId);
    } catch (error) {
      await recordAIUsageFinished({
        id: usageEventId,
        status: "rate_limited",
        errorCode: error instanceof Error ? error.message : "rate_limit_exceeded",
      });

      throw new AIUsageError(
        error instanceof Error ? error.message : "Rate limit exceeded",
        "rate_limited",
        429
      );
    }
  }

  return {
    model: createAIClientFromResolvedRequest(resolved, input.useThinking),
    usageEventId,
    resolved,
  };
}
