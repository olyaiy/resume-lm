import type { LanguageModelUsage, LanguageModelV1, TelemetrySettings } from "ai";

import { checkRateLimit } from "@/lib/rateLimiter";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { captureServerAnalyticsEvent } from "@/lib/analytics/server";
import {
  FAST_DEFAULT_MODEL,
  AIProviderError,
  MODEL_UNAVAILABLE_MESSAGE,
  assertProviderCircuitClosed,
  classifyAIError,
} from "@/lib/ai/reliability";
import { getDefaultModel } from "@/lib/ai-models";
import { buildPostHogAITelemetry } from "@/lib/ai/posthog-telemetry";
import {
  resolveAIRequest,
  AIRequestAccessError,
  type ResolvedAIRequest,
} from "@/lib/ai/access-control";
import { createAIClientFromResolvedRequest, type AIConfig } from "@/utils/ai-tools";
import { createServiceClient } from "@/utils/supabase/server";

type AIUsageStatus = "succeeded" | "failed" | "rate_limited" | "blocked";

export function getAIErrorCategory(errorCode?: string | null): string | null {
  if (!errorCode) return null;

  const normalized = errorCode.toLowerCase();
  if (normalized.includes("quota") || normalized.includes("credit") || normalized.includes("payment")) {
    return "provider_billing";
  }
  if (normalized.includes("api key") || normalized.includes("key not found") || normalized.includes("authentication")) {
    return "provider_authentication";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many requests")) {
    return "rate_limited";
  }
  if (normalized.includes("schema") || normalized.includes("parse") || normalized.includes("tool")) {
    return "invalid_model_output";
  }
  if (normalized.includes("timeout") || normalized.includes("timed out")) {
    return "timeout";
  }
  if (normalized.includes("unavailable") || normalized.includes("network") || normalized.includes("fetch")) {
    return "provider_unavailable";
  }
  return "provider_error";
}

export function getAIRequestFailureProperties(input: {
  errorCode?: string | null;
  error?: unknown;
}) {
  const classification = input.error ? classifyAIError(input.error) : null;
  const category =
    classification?.kind ?? getAIErrorCategory(input.errorCode) ?? "provider_error";

  return {
    error_code: category,
    error_category: category,
    error_status_code: classification?.statusCode ?? null,
    error_retryable: classification?.retryable ?? null,
  } as const;
}

export class AIUsageError extends Error {
  constructor(
    message: string,
    public readonly code: "blocked" | "rate_limited" | "failed",
    public readonly status: number = 500,
    public readonly fallbackModelId?: string,
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

  void captureServerAnalyticsEvent({
    distinctId: input.userId,
    event: AnalyticsEvents.AIRequestStarted,
    properties: {
      route: input.route,
      provider: input.provider,
      model: input.model,
      status: "started",
    },
  });

  return data.id;
}

export async function recordAIUsageFinished(input: {
  id: string;
  status: AIUsageStatus;
  errorCode?: string;
  error?: unknown;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}): Promise<void> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("ai_usage_events")
    .update({
      status: input.status,
      error_code: input.errorCode ?? null,
      input_tokens: input.inputTokens ?? null,
      output_tokens: input.outputTokens ?? null,
      total_tokens: input.totalTokens ?? null,
    })
    .eq("id", input.id)
    .select("user_id, route, provider, model, status, input_tokens, output_tokens, total_tokens, error_code, created_at")
    .single();

  if (error) {
    throw error;
  }

  const durationMs = data.created_at
    ? Math.max(0, Date.now() - Date.parse(data.created_at))
    : null;
  const analyticsProperties = {
    route: data.route,
    provider: data.provider,
    model: data.model,
    status: data.status,
    duration_ms: durationMs,
    input_tokens: data.input_tokens,
    output_tokens: data.output_tokens,
    total_tokens: data.total_tokens,
    ...(input.status === "succeeded"
      ? {}
      : getAIRequestFailureProperties({
          errorCode: data.error_code,
          error: input.error,
        })),
  };

  const analyticsCapture = captureServerAnalyticsEvent({
    distinctId: data.user_id,
    event: input.status === "succeeded"
      ? AnalyticsEvents.AIRequestSucceeded
      : AnalyticsEvents.AIRequestFailed,
    properties: analyticsProperties,
  });

  // Successful requests should not wait for analytics delivery. Failure
  // telemetry stays awaited because it is the diagnostic signal for the user
  // experience that just failed.
  if (input.status === "succeeded") {
    void analyticsCapture;
  } else {
    await analyticsCapture;
  }

  if (input.status === "succeeded") {
    // This secondary milestone must never add another database round trip to
    // the user's AI response. It is best-effort analytics, not access control.
    void (async () => {
      try {
        const { count } = await supabase
          .from("ai_usage_events")
          .select("id", { count: "exact", head: true })
          .eq("user_id", data.user_id)
          .eq("status", "succeeded");

        if (count === 1) {
          await captureServerAnalyticsEvent({
            distinctId: data.user_id,
            event: AnalyticsEvents.FirstAIRequestSucceeded,
            insertId: `${data.user_id}:${AnalyticsEvents.FirstAIRequestSucceeded}`,
            properties: analyticsProperties,
          });
        }
      } catch (analyticsError) {
        console.warn("Unable to determine first successful AI request", {
          userId: data.user_id,
          error: analyticsError instanceof Error ? analyticsError.message : "Unknown error",
        });
      }
    })();
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
  error?: unknown;
}) {
  await recordAIUsageFinished({
    id: input.usageEventId,
    status: input.status,
    errorCode: input.errorCode,
    error: input.error,
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
  telemetry: TelemetrySettings;
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
      error,
    });

    throw new AIUsageError(
      error instanceof Error ? error.message : "AI request blocked",
      "blocked",
      error instanceof AIRequestAccessError && error.code === "invalid_model" ? 503 : 403,
      error instanceof AIRequestAccessError && error.code === "invalid_model"
        ? FAST_DEFAULT_MODEL
        : undefined,
    );
  }

  try {
    await assertProviderCircuitClosed({
      providerId: resolved.providerId,
      modelId: resolved.modelId,
      apiKey: resolved.apiKey,
      usedServerKey: resolved.usedServerKey,
    });
  } catch (error) {
    const usageEventId = await recordAIUsageStarted({
      userId: input.userId,
      route: input.route,
      provider: resolved.providerId,
      model: resolved.modelId,
      isPro: input.isPro,
      usedServerKey: resolved.usedServerKey,
    });

    await recordAIUsageFinished({
      id: usageEventId,
      status: "blocked",
      errorCode: error instanceof Error ? error.message : "provider_circuit_open",
      error,
    });

    throw new AIUsageError(
      error instanceof AIProviderError ? error.message : MODEL_UNAVAILABLE_MESSAGE,
      "blocked",
      503,
      FAST_DEFAULT_MODEL,
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
        error,
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
    telemetry: buildPostHogAITelemetry({
      route: input.route,
      userId: input.userId,
      usageEventId,
      isPro: input.isPro,
      resolved,
    }),
  };
}
