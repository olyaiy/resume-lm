import { getSubscriptionAccessState, type SubscriptionSnapshot } from "@/lib/subscription-access";

type EntitlementSnapshot = Pick<
  SubscriptionSnapshot,
  "subscription_plan" | "subscription_status" | "current_period_end" | "trial_end"
>;

export function shouldCaptureEntitlementActivation(
  previous: EntitlementSnapshot | null | undefined,
  current: EntitlementSnapshot,
  now: Date = new Date(),
): boolean {
  const wasEntitled = previous
    ? getSubscriptionAccessState(previous, now).hasProAccess
    : false;
  const isEntitled = getSubscriptionAccessState(current, now).hasProAccess;

  return !wasEntitled && isEntitled;
}
