import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  mapStripeSubscriptionToAppSubscription,
  shouldSkipStaleInactiveSubscriptionUpdate,
} from "./subscription-sync";

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

describe("shouldSkipStaleInactiveSubscriptionUpdate", () => {
  const now = new Date("2026-05-04T12:00:00Z");

  it("skips stale inactive updates for an old subscription when a different Pro subscription is current", () => {
    const shouldSkip = shouldSkipStaleInactiveSubscriptionUpdate({
      now,
      currentSubscription: {
        stripe_subscription_id: "sub_current",
        subscription_plan: "pro",
        subscription_status: "active",
        current_period_end: "2026-06-01T00:00:00.000Z",
        trial_end: null,
      },
      incomingSubscription: {
        stripe_subscription_id: "sub_old",
        subscription_plan: "free",
        subscription_status: "canceled",
        current_period_end: "2026-05-01T00:00:00.000Z",
        trial_end: null,
      },
    });

    assert.equal(shouldSkip, true);
  });

  it("does not skip cancellation for the current subscription", () => {
    const shouldSkip = shouldSkipStaleInactiveSubscriptionUpdate({
      now,
      currentSubscription: {
        stripe_subscription_id: "sub_current",
        subscription_plan: "pro",
        subscription_status: "active",
        current_period_end: "2026-06-01T00:00:00.000Z",
        trial_end: null,
      },
      incomingSubscription: {
        stripe_subscription_id: "sub_current",
        subscription_plan: "free",
        subscription_status: "canceled",
        current_period_end: "2026-05-01T00:00:00.000Z",
        trial_end: null,
      },
    });

    assert.equal(shouldSkip, false);
  });

  it("does not skip active updates for a replacement subscription", () => {
    const shouldSkip = shouldSkipStaleInactiveSubscriptionUpdate({
      now,
      currentSubscription: {
        stripe_subscription_id: "sub_old",
        subscription_plan: "pro",
        subscription_status: "active",
        current_period_end: "2026-06-01T00:00:00.000Z",
        trial_end: null,
      },
      incomingSubscription: {
        stripe_subscription_id: "sub_current",
        subscription_plan: "pro",
        subscription_status: "active",
        current_period_end: "2026-07-01T00:00:00.000Z",
        trial_end: null,
      },
    });

    assert.equal(shouldSkip, false);
  });

  it("does not skip stale updates when the current entitlement has expired", () => {
    const shouldSkip = shouldSkipStaleInactiveSubscriptionUpdate({
      now,
      currentSubscription: {
        stripe_subscription_id: "sub_current",
        subscription_plan: "pro",
        subscription_status: "active",
        current_period_end: "2026-05-01T00:00:00.000Z",
        trial_end: null,
      },
      incomingSubscription: {
        stripe_subscription_id: "sub_old",
        subscription_plan: "free",
        subscription_status: "canceled",
        current_period_end: "2026-05-01T00:00:00.000Z",
        trial_end: null,
      },
    });

    assert.equal(shouldSkip, false);
  });
});
