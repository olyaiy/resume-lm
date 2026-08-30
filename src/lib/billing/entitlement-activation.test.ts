import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { shouldCaptureEntitlementActivation } from "./entitlement-activation";

const now = new Date("2026-08-29T12:00:00Z");
const currentActive = {
  subscription_plan: "pro",
  subscription_status: "active",
  current_period_end: "2026-09-29T12:00:00Z",
  trial_end: null,
};

describe("entitlement activation transitions", () => {
  it("captures a new active entitlement", () => {
    assert.equal(
      shouldCaptureEntitlementActivation(null, currentActive, now),
      true,
    );
  });

  it("does not recapture an already-active entitlement", () => {
    assert.equal(
      shouldCaptureEntitlementActivation(currentActive, currentActive, now),
      false,
    );
  });

  it("captures a transition from free to active", () => {
    assert.equal(
      shouldCaptureEntitlementActivation(
        {
          subscription_plan: "free",
          subscription_status: null,
          current_period_end: null,
          trial_end: null,
        },
        currentActive,
        now,
      ),
      true,
    );
  });

  it("does not treat a still-entitled past-due recovery as a new activation", () => {
    assert.equal(
      shouldCaptureEntitlementActivation(
        {
          ...currentActive,
          subscription_status: "past_due",
        },
        currentActive,
        now,
      ),
      false,
    );
  });
});
