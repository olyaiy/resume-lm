import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getSubscriptionAccessState } from "./subscription-access";

describe("getSubscriptionAccessState", () => {
  const now = new Date("2026-05-03T00:00:00Z");

  it("does not grant Pro from Stripe fields when the plan is free", () => {
    const result = getSubscriptionAccessState(
      {
        subscription_plan: "free",
        subscription_status: "active",
        stripe_subscription_id: "sub_1",
        current_period_end: "2026-06-01T00:00:00.000Z",
        trial_end: null,
      },
      now
    );

    assert.equal(result.hasProAccess, false);
    assert.equal(result.effectivePlan, "free");
  });

  it("does not grant Pro trial access when the plan is free", () => {
    const result = getSubscriptionAccessState(
      {
        subscription_plan: "free",
        subscription_status: "active",
        stripe_subscription_id: "sub_1",
        current_period_end: "2026-06-01T00:00:00.000Z",
        trial_end: "2026-05-10T00:00:00.000Z",
      },
      now
    );

    assert.equal(result.isTrialing, true);
    assert.equal(result.hasProAccess, false);
    assert.equal(result.effectivePlan, "free");
  });

  it("keeps canceling Pro users active until the access window expires", () => {
    const result = getSubscriptionAccessState(
      {
        subscription_plan: "pro",
        subscription_status: "canceled",
        stripe_subscription_id: "sub_1",
        current_period_end: "2026-06-01T00:00:00.000Z",
        trial_end: null,
      },
      now
    );

    assert.equal(result.hasProAccess, true);
    assert.equal(result.effectivePlan, "pro");
    assert.equal(result.isCanceling, true);
  });
});
