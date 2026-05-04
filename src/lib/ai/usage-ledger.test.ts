import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  AIUsageError,
  usageFromLanguageModelUsage,
} from "./usage-ledger";

describe("usageFromLanguageModelUsage", () => {
  it("maps provider usage tokens into ledger columns", () => {
    const usage = usageFromLanguageModelUsage({
      promptTokens: 123,
      completionTokens: 45,
      totalTokens: 168,
    });

    assert.deepEqual(usage, {
      inputTokens: 123,
      outputTokens: 45,
      totalTokens: 168,
    });
  });

  it("omits token columns when provider usage is unavailable", () => {
    assert.deepEqual(usageFromLanguageModelUsage(), {});
  });
});

describe("AIUsageError", () => {
  it("preserves the access-control code and HTTP status", () => {
    const error = new AIUsageError("Model unavailable", "blocked", 403);

    assert.equal(error.name, "AIUsageError");
    assert.equal(error.message, "Model unavailable");
    assert.equal(error.code, "blocked");
    assert.equal(error.status, 403);
  });
});
