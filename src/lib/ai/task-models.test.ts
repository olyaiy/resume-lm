import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getTaskModel, withTaskModel } from "./task-models";
import type { AIConfig } from "@/lib/ai-models";

describe("task model routing", () => {
  it("routes full resume tailoring by plan", () => {
    assert.equal(getTaskModel("jobTailoring", false), "gpt-5.4-nano");
    assert.equal(getTaskModel("jobTailoring", true), "gpt-5.5");
  });

  it("routes extraction and scoring to GPT-5.4 Nano", () => {
    assert.equal(getTaskModel("structuredExtraction", false), "gpt-5.4-nano");
    assert.equal(getTaskModel("structuredExtraction", true), "gpt-5.4-nano");
    assert.equal(getTaskModel("resumeScoring", false), "gpt-5.4-nano");
    assert.equal(getTaskModel("resumeScoring", true), "gpt-5.4-nano");
  });

  it("routes bullet generation and cover letters to GPT-5.4 Mini", () => {
    assert.equal(getTaskModel("contentGeneration", false), "gpt-5.4-mini");
    assert.equal(getTaskModel("contentGeneration", true), "gpt-5.4-mini");
    assert.equal(getTaskModel("coverLetter", false), "gpt-5.4-mini");
    assert.equal(getTaskModel("coverLetter", true), "gpt-5.4-mini");
  });

  it("preserves API keys and custom prompts while replacing the model", () => {
    const config: AIConfig = {
      model: "claude-sonnet-4-6",
      apiKeys: [
        { service: "anthropic", key: "user-anthropic", addedAt: "2026-05-10" },
      ],
      customPrompts: {
        textAnalyzer: "Extract carefully.",
      },
    };

    const resolved = withTaskModel({
      task: "structuredExtraction",
      isPro: false,
      config,
    });

    assert.equal(resolved.model, "gpt-5.4-nano");
    assert.deepEqual(resolved.apiKeys, config.apiKeys);
    assert.deepEqual(resolved.customPrompts, config.customPrompts);
  });

  it("can intentionally preserve a selected model for future override paths", () => {
    const resolved = withTaskModel({
      task: "chatAssistant",
      isPro: true,
      config: {
        model: "claude-opus-4-7",
        apiKeys: [],
      },
      respectSelectedModel: true,
    });

    assert.equal(resolved.model, "claude-opus-4-7");
  });
});
