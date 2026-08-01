import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getInvoiceSubscriptionId,
  isFirstPaidInvoice,
  shouldCaptureTrialStarted,
} from "./billing-events";

function invoice(overrides: Record<string, unknown> = {}) {
  return {
    id: "in_current",
    status: "paid" as const,
    amount_paid: 2000,
    billing_reason: "subscription_create" as const,
    ...overrides,
  };
}

describe("Stripe billing lifecycle event classification", () => {
  it("captures a trial only when Stripe enters trialing", () => {
    assert.equal(
      shouldCaptureTrialStarted({
        eventType: "customer.subscription.created",
        status: "trialing",
      }),
      true
    );
    assert.equal(
      shouldCaptureTrialStarted({
        eventType: "customer.subscription.updated",
        status: "trialing",
        previousStatus: "incomplete",
      }),
      true
    );
    assert.equal(
      shouldCaptureTrialStarted({
        eventType: "customer.subscription.updated",
        status: "trialing",
        previousStatus: "trialing",
      }),
      false
    );
    assert.equal(
      shouldCaptureTrialStarted({
        eventType: "customer.subscription.updated",
        status: "trialing",
      }),
      false
    );
    assert.equal(
      shouldCaptureTrialStarted({
        eventType: "customer.subscription.created",
        status: "active",
      }),
      false
    );
  });

  it("treats the first positive subscription invoice as paid conversion", () => {
    assert.equal(
      isFirstPaidInvoice({ invoice: invoice(), paidSubscriptionInvoices: [] }),
      true
    );
    assert.equal(
      isFirstPaidInvoice({
        invoice: invoice({ billing_reason: "subscription_cycle" }),
        paidSubscriptionInvoices: [invoice({ id: "in_trial_zero", amount_paid: 0 })],
      }),
      true
    );
    assert.equal(
      isFirstPaidInvoice({
        invoice: invoice(),
        paidSubscriptionInvoices: [invoice({ id: "in_previous" })],
      }),
      false
    );
    assert.equal(
      isFirstPaidInvoice({
        invoice: invoice({ amount_paid: 0 }),
        paidSubscriptionInvoices: [],
      }),
      false
    );
    assert.equal(
      isFirstPaidInvoice({
        invoice: invoice({ billing_reason: "subscription_update" }),
        paidSubscriptionInvoices: [],
      }),
      false
    );
  });

  it("supports both current and legacy Stripe invoice subscription shapes", () => {
    assert.equal(
      getInvoiceSubscriptionId(
        invoice({ subscription: "sub_legacy" }) as never
      ),
      "sub_legacy"
    );
    assert.equal(
      getInvoiceSubscriptionId(
        invoice({
          parent: {
            type: "subscription_details",
            subscription_details: { subscription: "sub_current" },
          },
        }) as never
      ),
      "sub_current"
    );
  });
});
