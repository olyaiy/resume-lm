import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PLAN_CONFIG } from "./plans";

describe("plan configuration", () => {
  it("matches the free-plan limits shown to users", () => {
    assert.equal(PLAN_CONFIG.free.limits.base, 2);
    assert.equal(PLAN_CONFIG.free.limits.tailored, 5);
    assert.ok(PLAN_CONFIG.free.features.includes("5 tailored resumes"));
  });

  it("keeps the paid offer explicit", () => {
    assert.equal(PLAN_CONFIG.pro.price, "$20");
    assert.equal(PLAN_CONFIG.pro.period, "/month");
    assert.ok(PLAN_CONFIG.pro.features.includes("Access to app-funded premium AI models"));
  });
});
