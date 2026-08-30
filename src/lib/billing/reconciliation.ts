import { getBillingState, type BillingState } from "@/lib/billing/state";
import { getSubscriptionAccessState } from "@/lib/subscription-access";
import type { SupportedStripeStatus } from "@/lib/stripe/subscription-sync";

export interface StripeReconciliationSnapshot {
  id: string;
  priceId: string;
  status: SupportedStripeStatus;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface StoredReconciliationSnapshot {
  user_id: string;
  stripe_subscription_id: string | null;
  subscription_plan: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  payment_failure_count?: number | null;
}

export type ReconciliationMismatchKind =
  | "mapping_missing"
  | "state_mismatch"
  | "entitlement_mismatch"
  | "stale_entitlement";

export interface ReconciliationMismatch {
  kind: ReconciliationMismatchKind;
  severity: "warning" | "critical";
  expectedState: BillingState;
  actualState: BillingState | null;
  expectedPlan: "pro" | "free";
  expectedStatus: "active" | "past_due" | "canceled";
}

function expectedAppState(
  input: StripeReconciliationSnapshot,
  proPriceId: string,
  now: Date,
) {
  const isKnownProPrice = input.priceId === proPriceId;
  const isActiveLike = input.status === "active" || input.status === "trialing";
  const isPastDue = input.status === "past_due";
  const expectedPlan = isKnownProPrice && (isActiveLike || isPastDue) ? "pro" : "free";
  const expectedStatus =
    isPastDue
      ? "past_due"
      : expectedPlan === "pro" && !input.cancelAtPeriodEnd
        ? "active"
        : "canceled";

  return {
    expectedPlan,
    expectedStatus,
    expectedState: getBillingState(
      {
        plan: expectedPlan,
        status: expectedStatus,
        stripeStatus: input.status,
        currentPeriodEnd: input.currentPeriodEnd,
        trialEnd: input.trialEnd,
        cancelAtPeriodEnd: input.cancelAtPeriodEnd,
      },
      now,
    ),
  } as const;
}

export function compareStripeAndSupabaseState(input: {
  stripe: StripeReconciliationSnapshot;
  stored: StoredReconciliationSnapshot | null;
  proPriceId: string;
  now?: Date;
}): ReconciliationMismatch | null {
  const now = input.now ?? new Date();
  const expected = expectedAppState(input.stripe, input.proPriceId, now);

  // Historical canceled subscriptions do not need a user mapping. Current or
  // recoverable entitlements do, because missing mappings can strand paid access.
  if (!input.stored) {
    return expected.expectedState === "free"
      ? null
      : {
          kind: "mapping_missing",
          severity: "critical",
          expectedState: expected.expectedState,
          actualState: null,
          expectedPlan: expected.expectedPlan,
          expectedStatus: expected.expectedStatus,
        };
  }

  const actualAccess = getSubscriptionAccessState(input.stored, now);
  const actualState = actualAccess.billingState;

  if (expected.expectedState === "free" && actualAccess.hasProAccess) {
    return {
      kind: "stale_entitlement",
      severity: "critical",
      expectedState: expected.expectedState,
      actualState,
      expectedPlan: expected.expectedPlan,
      expectedStatus: expected.expectedStatus,
    };
  }

  if (expected.expectedState !== actualState) {
    return {
      kind: "state_mismatch",
      severity: expected.expectedState === "free" && actualState !== "free" ? "critical" : "warning",
      expectedState: expected.expectedState,
      actualState,
      expectedPlan: expected.expectedPlan,
      expectedStatus: expected.expectedStatus,
    };
  }

  if (expected.expectedState !== "free" && !actualAccess.hasProAccess) {
    return {
      kind: "entitlement_mismatch",
      severity: "critical",
      expectedState: expected.expectedState,
      actualState,
      expectedPlan: expected.expectedPlan,
      expectedStatus: expected.expectedStatus,
    };
  }

  return null;
}

export function getExpectedStripeState(input: StripeReconciliationSnapshot, proPriceId: string) {
  return expectedAppState(input, proPriceId, new Date());
}
