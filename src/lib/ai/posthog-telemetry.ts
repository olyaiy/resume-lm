import type { TelemetrySettings } from "ai";

import type { ResolvedAIRequest } from "./access-control";

export function getPostHogProjectApiKey() {
  return (
    process.env.POSTHOG_PROJECT_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() ||
    ""
  );
}

export function getPostHogHost() {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";
}

export function isPostHogLLMAnalyticsDisabled() {
  const value = process.env.POSTHOG_LLM_ANALYTICS_DISABLED?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function getDisabledTelemetry(): TelemetrySettings {
  return {
    isEnabled: false,
    recordInputs: false,
    recordOutputs: false,
  };
}

export function buildPostHogAITelemetry(input: {
  route: string;
  userId: string;
  usageEventId: string;
  isPro: boolean;
  resolved: ResolvedAIRequest;
  environment?: string;
}): TelemetrySettings {
  if (!getPostHogProjectApiKey() || isPostHogLLMAnalyticsDisabled()) {
    return getDisabledTelemetry();
  }

  return {
    isEnabled: true,
    recordInputs: false,
    recordOutputs: false,
    functionId: input.route,
    metadata: {
      posthog_distinct_id: input.userId,
      resumelm_usage_event_id: input.usageEventId,
      resumelm_route: input.route,
      resumelm_provider: input.resolved.providerId,
      resumelm_model: input.resolved.modelId,
    },
  };
}
