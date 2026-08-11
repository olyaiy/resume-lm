import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { compareStripeAndSupabaseState } from "./reconciliation";

const now = new Date("2026-08-11T12:00:00Z");
const baseStripe = {
  id: "sub_12345678",
  priceId: "price_pro",
  currentPeriodEnd: "2026-08-29T12:00:00Z",
  trialEnd: null,
  cancelAtPeriodEnd: false,
} as const;

describe("Stripe/Supabase reconciliation", () => {
  it("accepts a trial mapped to the app's active storage status", () => {
    assert.equal(
      compareStripeAndSupabaseState({
        now,
        proPriceId: "price_pro",
        stripe: {
          ...baseStripe,
          status: "trialing",
          trialEnd: "2026-08-12T12:00:00Z",
          cancelAtPeriodEnd: true,
        },
        stored: {
          user_id: "user_1",
          stripe_subscription_id: baseStripe.id,
          subscription_plan: "pro",
          subscription_status: "canceled",
          current_period_end: baseStripe.currentPeriodEnd,
          trial_end: "2026-08-12T12:00:00Z",
        },
      }),
      null,
    );
  });

  it("accepts a recoverable past-due subscription", () => {
    assert.equal(
      compareStripeAndSupabaseState({
        now,
        proPriceId: "price_pro",
        stripe: { ...baseStripe, status: "past_due" },
        stored: {
          user_id: "user_1",
          stripe_subscription_id: baseStripe.id,
          subscription_plan: "pro",
          subscription_status: "past_due",
          current_period_end: baseStripe.currentPeriodEnd,
          trial_end: null,
        },
      }),
      null,
    );
  });

  it("flags a current Stripe entitlement without a Supabase mapping", () => {
    const mismatch = compareStripeAndSupabaseState({
      now,
      proPriceId: "price_pro",
      stripe: { ...baseStripe, status: "active" },
      stored: null,
    });

    assert.equal(mismatch?.kind, "mapping_missing");
    assert.equal(mismatch?.severity, "critical");
  });

  it("flags Pro access when Stripe no longer has the subscription", () => {
    const mismatch = compareStripeAndSupabaseState({
      now,
      proPriceId: "price_pro",
      stripe: {
        ...baseStripe,
        status: "canceled",
        currentPeriodEnd: null,
      },
      stored: {
        user_id: "user_1",
        stripe_subscription_id: baseStripe.id,
        subscription_plan: "pro",
        subscription_status: "active",
        current_period_end: baseStripe.currentPeriodEnd,
        trial_end: null,
      },
    });

    assert.equal(mismatch?.kind, "stale_entitlement");
    assert.equal(mismatch?.severity, "critical");
  });
});
