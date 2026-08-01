import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getCanonicalModelId,
  getDefaultModel,
  getModelById,
  getModelSDKConfig,
  getProvidersArray,
  getSelectableModels,
  groupModelsByProvider,
} from "@/lib/ai-models";

describe("AI model configuration", () => {
  it("uses OpenRouter models for both app-funded defaults", () => {
    assert.equal(getDefaultModel(false), "openai/gpt-5.6-luna");
    assert.equal(getDefaultModel(true), "openai/gpt-5.6-terra");

    assert.equal(getModelSDKConfig(getDefaultModel(false))?.provider.id, "openrouter");
    assert.equal(getModelSDKConfig(getDefaultModel(true))?.provider.id, "openrouter");
  });

  it("configures GPT-5.6 Luna as the app-funded low-cost model", () => {
    const luna = getModelById("openai/gpt-5.6-luna");

    assert.ok(luna);
    assert.equal(luna.provider, "openrouter");
    assert.equal(luna.features.isFree, true);
    assert.equal(luna.features.supportsVision, true);
    assert.equal(luna.features.supportsTools, true);
    assert.equal(luna.features.maxTokens, 1_050_000);
    assert.equal(luna.availability.requiresApiKey, false);
  });

  it("migrates legacy direct OpenAI defaults to canonical OpenRouter IDs", () => {
    assert.equal(getCanonicalModelId("gpt-5.4-nano"), "openai/gpt-5.6-luna");
    assert.equal(getModelById("gpt-5.4-nano")?.id, "openai/gpt-5.6-luna");
    assert.deepEqual(getModelSDKConfig("gpt-5.4-nano"), {
      provider: getModelSDKConfig("openai/gpt-5.6-luna")?.provider,
      modelId: "openai/gpt-5.6-luna",
    });
    assert.equal(getCanonicalModelId("openai/gpt-5.5"), "openai/gpt-5.6-terra");
    assert.equal(getCanonicalModelId("  GPT-5.4-NANO  "), "openai/gpt-5.6-luna");
  });

  it("exposes the curated visible catalog", () => {
    const visibleIds = [
      "openai/gpt-5.6-luna",
      "openai/gpt-5.6-terra",
      "anthropic/claude-sonnet-5",
      "deepseek/deepseek-v4-flash",
      "openai/gpt-5.6-sol",
      "anthropic/claude-opus-5",
      "moonshotai/kimi-k3",
      "google/gemini-3.6-flash",
    ];

    assert.deepEqual(
      visibleIds.map((id) => getModelById(id)?.id),
      visibleIds,
    );
    assert.equal(getModelById("deepseek/deepseek-v4-flash")?.features.isFree, true);
    assert.equal(getModelById("openai/gpt-5.6-terra")?.availability.requiresPro, true);
    assert.equal(getModelById("anthropic/claude-opus-5")?.provider, "openrouter");

    const selectorIds = groupModelsByProvider().flatMap((group) =>
      group.models.map((model) => model.id),
    );
    assert.deepEqual(selectorIds, visibleIds);
    assert.deepEqual(
      getSelectableModels(false, []).map((model) => model.id),
      ["openai/gpt-5.6-luna", "deepseek/deepseek-v4-flash"],
    );
  });

  it("only shows providers that have selectable models", () => {
    const providerIds = getProvidersArray().map(provider => provider.id);

    assert.deepEqual(providerIds, ["anthropic", "openrouter"]);
  });
});
