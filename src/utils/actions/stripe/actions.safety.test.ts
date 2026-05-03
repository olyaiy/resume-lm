import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const stripeActionsSource = readFileSync(
  "src/utils/actions/stripe/actions.ts",
  "utf8"
);

describe("Stripe action safety", () => {
  it("does not export a self-service subscription plan toggle", () => {
    assert.equal(
      stripeActionsSource.includes("toggleSubscriptionPlan"),
      false
    );
    assert.equal(
      stripeActionsSource.includes("subscription_plan: newPlan"),
      false
    );
  });
});
