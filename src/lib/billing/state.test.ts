import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getBillingState } from "./state";

describe("canonical billing state", () => {
  const now = new Date("2026-08-11T12:00:00Z");

  it("distinguishes a trial from paid active access", () => {
    assert.equal(
      getBillingState({
        plan: "pro",
        status: "active",
        trialEnd: "2026-08-12T12:00:00Z",
        currentPeriodEnd: "2026-08-12T12:00:00Z",
      }, now),
      "trial",
    );
    assert.equal(
      getBillingState({
        plan: "pro",
        status: "active",
        currentPeriodEnd: "2026-09-11T12:00:00Z",
      }, now),
      "active",
    );
  });

  it("keeps cancel-at-period-end access available but marks it canceling", () => {
    assert.equal(
      getBillingState({
        plan: "pro",
        status: "canceled",
        currentPeriodEnd: "2026-08-29T12:00:00Z",
      }, now),
      "canceling",
    );
  });

  it("keeps past-due access only inside the recoverable window", () => {
    assert.equal(
      getBillingState({
        plan: "pro",
        status: "past_due",
        currentPeriodEnd: "2026-08-29T12:00:00Z",
      }, now),
      "past_due",
    );
    assert.equal(
      getBillingState({
        plan: "pro",
        status: "past_due",
        currentPeriodEnd: "2026-08-01T12:00:00Z",
      }, now),
      "free",
    );
  });

  it("does not grant indefinite access from a stale active row", () => {
    assert.equal(
      getBillingState({
        plan: "pro",
        status: "active",
        currentPeriodEnd: "2026-08-01T12:00:00Z",
      }, now),
      "free",
    );
  });
});
