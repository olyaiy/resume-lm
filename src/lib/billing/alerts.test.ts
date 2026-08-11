import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildBillingAlertNotification,
  identifierSuffix,
  redactBillingAlertDetails,
} from "./alerts";

describe("billing alerts", () => {
  it("only exposes identifier suffixes and safe scalar details", () => {
    assert.equal(identifierSuffix("sub_123456789"), "23456789");
    assert.deepEqual(
      redactBillingAlertDetails({
        stripe_subscription_id: "sub_123456789",
        email: "person@example.com",
        attempt_count: 3,
        error: "payment failed",
      }),
      {
        stripe_subscription_id: "23456789",
        attempt_count: 3,
        error: "payment failed",
      },
    );
  });

  it("builds an operator notification without customer PII", () => {
    const notification = buildBillingAlertNotification({
      type: "payment_failed",
      severity: "warning",
      alertKey: "payment-failed:in_123",
      message: "Invoice payment failed",
      stripeSubscriptionId: "sub_123456789",
      details: { email: "person@example.com", attempt_count: 2 },
    });

    assert.equal(notification.stripe_subscription_suffix, "23456789");
    assert.equal(JSON.stringify(notification).includes("person@example.com"), false);
  });
});
