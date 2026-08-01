import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getTaskModel, withTaskModel } from "./task-models";
import type { AIConfig } from "@/lib/ai-models";

describe("task model routing", () => {
  it("routes full resume tailoring by plan", () => {
    assert.equal(getTaskModel("jobTailoring", false), "openai/gpt-5.6-luna");
    assert.equal(getTaskModel("jobTailoring", true), "openai/gpt-5.6-terra");
  });

  it("routes extraction and scoring to GPT-5.6 Luna through OpenRouter", () => {
    assert.equal(getTaskModel("structuredExtraction", false), "openai/gpt-5.6-luna");
    assert.equal(getTaskModel("structuredExtraction", true), "openai/gpt-5.6-luna");
    assert.equal(getTaskModel("resumeScoring", false), "openai/gpt-5.6-luna");
    assert.equal(getTaskModel("resumeScoring", true), "openai/gpt-5.6-luna");
  });

  it("routes bullet generation and cover letters to GPT-5.6 Luna", () => {
    assert.equal(getTaskModel("contentGeneration", false), "openai/gpt-5.6-luna");
    assert.equal(getTaskModel("contentGeneration", true), "openai/gpt-5.6-luna");
    assert.equal(getTaskModel("coverLetter", false), "openai/gpt-5.6-luna");
    assert.equal(getTaskModel("coverLetter", true), "openai/gpt-5.6-luna");
  });

  it("routes chat assistants through OpenRouter", () => {
    assert.equal(getTaskModel("chatAssistant", false), "openai/gpt-5.6-luna");
    assert.equal(getTaskModel("chatAssistant", true), "openai/gpt-5.6-terra");
  });

  it("honors a selected model while preserving API keys and custom prompts", () => {
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

    assert.equal(resolved.model, "claude-sonnet-5");
    assert.deepEqual(resolved.apiKeys, config.apiKeys);
    assert.deepEqual(resolved.customPrompts, config.customPrompts);
  });

  it("migrates a legacy selected OpenAI model to its OpenRouter equivalent", () => {
    const resolved = withTaskModel({
      task: "structuredExtraction",
      isPro: false,
      config: {
        model: "gpt-5.4-nano",
        apiKeys: [],
      },
    });

    assert.equal(resolved.model, "openai/gpt-5.6-luna");
  });

  it("uses the task default when no selected model is provided", () => {
    const resolved = withTaskModel({
      task: "chatAssistant",
      isPro: false,
      config: {
        model: "  ",
        apiKeys: [],
      },
    });

    assert.equal(resolved.model, "openai/gpt-5.6-luna");
  });
});
