import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import type { ResolvedAIRequest } from "./access-control";
import { buildPostHogAITelemetry } from "./posthog-telemetry";

const ORIGINAL_ENV = {
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  POSTHOG_PROJECT_API_KEY: process.env.POSTHOG_PROJECT_API_KEY,
  POSTHOG_LLM_ANALYTICS_DISABLED: process.env.POSTHOG_LLM_ANALYTICS_DISABLED,
};

const resolved: ResolvedAIRequest = {
  providerId: "openai",
  modelId: "gpt-5.4-mini",
  apiKey: "provider-secret",
  usedServerKey: true,
  requiresRateLimit: true,
};

function restoreEnv() {
  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

afterEach(() => {
  restoreEnv();
});

describe("buildPostHogAITelemetry", () => {
  it("disables AI telemetry when no PostHog project key is configured", () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    delete process.env.POSTHOG_PROJECT_API_KEY;
    delete process.env.POSTHOG_LLM_ANALYTICS_DISABLED;

    assert.deepEqual(
      buildPostHogAITelemetry({
        route: "actions.resumes.generateResumeScore",
        userId: "user_123",
        usageEventId: "usage_123",
        isPro: true,
        resolved,
      }),
      {
        isEnabled: false,
        recordInputs: false,
        recordOutputs: false,
      }
    );
  });

  it("disables AI telemetry when the explicit kill switch is enabled", () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test";
    process.env.POSTHOG_LLM_ANALYTICS_DISABLED = "true";

    assert.deepEqual(
      buildPostHogAITelemetry({
        route: "actions.resumes.generateResumeScore",
        userId: "user_123",
        usageEventId: "usage_123",
        isPro: true,
        resolved,
      }),
      {
        isEnabled: false,
        recordInputs: false,
        recordOutputs: false,
      }
    );
  });

  it("enables full input and output capture with ResumeLM metadata", () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test";
    delete process.env.POSTHOG_LLM_ANALYTICS_DISABLED;

    const telemetry = buildPostHogAITelemetry({
      route: "actions.resumes.generateResumeScore",
      userId: "user_123",
      usageEventId: "usage_123",
      isPro: true,
      resolved,
      environment: "test",
    });

    assert.equal(telemetry.isEnabled, true);
    assert.equal(telemetry.recordInputs, true);
    assert.equal(telemetry.recordOutputs, true);
    assert.equal(telemetry.functionId, "actions.resumes.generateResumeScore");
    assert.deepEqual(telemetry.metadata, {
      posthog_distinct_id: "user_123",
      resumelm_usage_event_id: "usage_123",
      resumelm_route: "actions.resumes.generateResumeScore",
      resumelm_provider: "openai",
      resumelm_model: "gpt-5.4-mini",
      resumelm_is_pro: true,
      resumelm_used_server_key: true,
      resumelm_requires_rate_limit: true,
      resumelm_environment: "test",
    });
  });

  it("never exposes the provider API key in telemetry metadata", () => {
    process.env.POSTHOG_PROJECT_API_KEY = "phc_test";
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    delete process.env.POSTHOG_LLM_ANALYTICS_DISABLED;

    const telemetry = buildPostHogAITelemetry({
      route: "api.chat",
      userId: "user_123",
      usageEventId: "usage_123",
      isPro: false,
      resolved,
    });

    assert.ok(telemetry.metadata);
    assert.equal("apiKey" in telemetry.metadata, false);
    assert.equal("api_key" in telemetry.metadata, false);
    assert.equal("provider-secret" in telemetry.metadata, false);
  });
});
