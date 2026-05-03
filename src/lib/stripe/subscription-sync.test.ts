import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mapStripeSubscriptionToAppSubscription } from "./subscription-sync";

describe("mapStripeSubscriptionToAppSubscription", () => {
  const proPriceId = "price_pro";

  it("maps active Pro subscriptions to active Pro", () => {
    const result = mapStripeSubscriptionToAppSubscription({
      userId: "user_1",
      customerId: "cus_1",
      subscriptionId: "sub_1",
      priceId: proPriceId,
      stripeStatus: "active",
      currentPeriodEnd: new Date("2026-06-01T00:00:00Z"),
      trialEnd: null,
      cancelAtPeriodEnd: false,
      proPriceId,
    });

    assert.equal(result.subscription_plan, "pro");
    assert.equal(result.subscription_status, "active");
  });

  it("maps trialing Pro subscriptions to active Pro", () => {
    const result = mapStripeSubscriptionToAppSubscription({
      userId: "user_1",
      customerId: "cus_1",
      subscriptionId: "sub_1",
      priceId: proPriceId,
      stripeStatus: "trialing",
      currentPeriodEnd: new Date("2026-06-01T00:00:00Z"),
      trialEnd: new Date("2026-05-10T00:00:00Z"),
      cancelAtPeriodEnd: false,
      proPriceId,
    });

    assert.equal(result.subscription_plan, "pro");
    assert.equal(result.subscription_status, "active");
  });

  it("maps non-Pro prices to free even when Stripe is active", () => {
    const result = mapStripeSubscriptionToAppSubscription({
      userId: "user_1",
      customerId: "cus_1",
      subscriptionId: "sub_1",
      priceId: "price_other",
      stripeStatus: "active",
      currentPeriodEnd: new Date("2026-06-01T00:00:00Z"),
      trialEnd: null,
      cancelAtPeriodEnd: false,
      proPriceId,
    });

    assert.equal(result.subscription_plan, "free");
    assert.equal(result.subscription_status, "canceled");
  });

  it("keeps cancel-at-period-end users as canceled with period end preserved", () => {
    const result = mapStripeSubscriptionToAppSubscription({
      userId: "user_1",
      customerId: "cus_1",
      subscriptionId: "sub_1",
      priceId: proPriceId,
      stripeStatus: "active",
      currentPeriodEnd: new Date("2026-06-01T00:00:00Z"),
      trialEnd: null,
      cancelAtPeriodEnd: true,
      proPriceId,
    });

    assert.equal(result.subscription_plan, "pro");
    assert.equal(result.subscription_status, "canceled");
    assert.equal(result.current_period_end, "2026-06-01T00:00:00.000Z");
  });
});
