import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildCheckoutIdempotencyKey,
  buildCheckoutSessionMetadata,
  buildSubscriptionMetadata,
  isBlockingCheckoutSubscription,
  isMatchingOpenCheckoutSession,
} from "./checkout-guard";

describe("isBlockingCheckoutSubscription", () => {
  for (const status of ["active", "trialing", "past_due", "unpaid", "incomplete"] as const) {
    it(`blocks checkout when Stripe subscription status is ${status}`, () => {
      assert.equal(isBlockingCheckoutSubscription(status), true);
    });
  }

  for (const status of ["canceled", "incomplete_expired", "paused"] as const) {
    it(`allows checkout when Stripe subscription status is ${status}`, () => {
      assert.equal(isBlockingCheckoutSubscription(status), false);
    });
  }
});

describe("buildCheckoutSessionMetadata", () => {
  it("stores enough metadata to reconcile and reuse a session", () => {
    const metadata = buildCheckoutSessionMetadata({
      userId: "user_123",
      priceId: "price_pro",
      includeTrial: true,
    });

    assert.deepEqual(metadata, {
      supabaseUUID: "user_123",
      price_id: "price_pro",
      include_trial: "true",
      source: "resumelm_checkout",
    });
  });
});

describe("buildSubscriptionMetadata", () => {
  it("stores user and source metadata on Stripe subscriptions", () => {
    const metadata = buildSubscriptionMetadata({
      userId: "user_123",
      priceId: "price_pro",
      includeTrial: false,
    });

    assert.equal(metadata.supabaseUUID, "user_123");
    assert.equal(metadata.price_id, "price_pro");
    assert.equal(metadata.include_trial, "false");
    assert.equal(metadata.source, "resumelm_checkout");
  });
});

describe("buildCheckoutIdempotencyKey", () => {
  it("is stable for the same user, price, and trial mode", () => {
    const input = {
      userId: "user_123",
      priceId: "price_pro",
      includeTrial: true,
    };

    assert.equal(
      buildCheckoutIdempotencyKey(input),
      buildCheckoutIdempotencyKey(input)
    );
  });

  it("changes when price or trial mode changes", () => {
    const base = buildCheckoutIdempotencyKey({
      userId: "user_123",
      priceId: "price_pro",
      includeTrial: false,
    });

    assert.notEqual(
      base,
      buildCheckoutIdempotencyKey({
        userId: "user_123",
        priceId: "price_other",
        includeTrial: false,
      })
    );
    assert.notEqual(
      base,
      buildCheckoutIdempotencyKey({
        userId: "user_123",
        priceId: "price_pro",
        includeTrial: true,
      })
    );
  });
});

describe("isMatchingOpenCheckoutSession", () => {
  const metadata = buildCheckoutSessionMetadata({
    userId: "user_123",
    priceId: "price_pro",
    includeTrial: true,
  });

  it("matches open subscription sessions for the same user, price, and trial mode", () => {
    assert.equal(
      isMatchingOpenCheckoutSession(
        {
          mode: "subscription",
          status: "open",
          metadata,
        },
        metadata
      ),
      true
    );
  });

  it("does not match completed sessions", () => {
    assert.equal(
      isMatchingOpenCheckoutSession(
        {
          mode: "subscription",
          status: "complete",
          metadata,
        },
        metadata
      ),
      false
    );
  });

  it("does not match a different user, price, or trial mode", () => {
    assert.equal(
      isMatchingOpenCheckoutSession(
        {
          mode: "subscription",
          status: "open",
          metadata: { ...metadata, supabaseUUID: "user_other" },
        },
        metadata
      ),
      false
    );
    assert.equal(
      isMatchingOpenCheckoutSession(
        {
          mode: "subscription",
          status: "open",
          metadata: { ...metadata, price_id: "price_other" },
        },
        metadata
      ),
      false
    );
    assert.equal(
      isMatchingOpenCheckoutSession(
        {
          mode: "subscription",
          status: "open",
          metadata: { ...metadata, include_trial: "false" },
        },
        metadata
      ),
      false
    );
  });
});
