import { getBillingState, type BillingState } from "@/lib/billing/state";

export interface SubscriptionSnapshot {
  subscription_plan?: string | null;
  subscription_status?: string | null;
  current_period_end?: string | null;
  trial_end?: string | null;
  stripe_subscription_id?: string | null;
  payment_failure_count?: number | null;
  last_payment_failed_at?: string | null;
  next_payment_attempt_at?: string | null;
}

export interface SubscriptionAccessState {
  billingState: BillingState;
  isTrialing: boolean;
  isPastDue: boolean;
  isWithinAccessWindow: boolean;
  hasStripeSubscription: boolean;
  hasProAccess: boolean;
  isCanceling: boolean;
  isExpiredProAccess: boolean;
  needsTrial: boolean;
  daysRemaining: number;
  trialDaysRemaining: number;
  currentPeriodEndLabel: string | null;
  trialEndLabel: string | null;
  effectivePlan: "pro" | "free" | "";
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function isFutureDate(value: Date | null, now: Date): boolean {
  if (!value) return false;
  return value.getTime() > now.getTime();
}

function getDaysRemaining(value: Date | null, now: Date): number {
  if (!value) return 0;
  const millis = value.getTime() - now.getTime();
  return Math.max(0, Math.ceil(millis / (1000 * 60 * 60 * 24)));
}

function formatDate(value: Date | null): string | null {
  if (!value) return null;
  return value.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getSubscriptionAccessState(
  subscription: SubscriptionSnapshot | null | undefined,
  now: Date = new Date()
): SubscriptionAccessState {
  const plan = subscription?.subscription_plan?.toLowerCase() ?? "";
  const status = subscription?.subscription_status ?? "";

  const currentPeriodEnd = parseDate(subscription?.current_period_end);
  const trialEnd = parseDate(subscription?.trial_end);

  const isTrialing = isFutureDate(trialEnd, now);
  const isPastDue = status === "past_due";
  const hasStripeSubscription = Boolean(subscription?.stripe_subscription_id);
  const isWithinAccessWindow = isFutureDate(currentPeriodEnd, now);
  const billingState = getBillingState(
    {
      plan,
      status,
      currentPeriodEnd,
      trialEnd,
    },
    now,
  );
  const hasProAccess = billingState !== "free";

  const hadPaidAccess = plan === "pro";
  const isCanceling = billingState === "canceling";
  const isExpiredProAccess =
    hadPaidAccess &&
    !hasProAccess &&
    ["active", "canceled", "past_due"].includes(status);

  const hasSubscriptionRecord = Boolean(subscription);
  const effectivePlan = hasSubscriptionRecord ? (hasProAccess ? "pro" : "free") : "";

  return {
    billingState,
    isTrialing,
    isPastDue,
    isWithinAccessWindow,
    hasStripeSubscription,
    hasProAccess,
    isCanceling,
    isExpiredProAccess,
    needsTrial: !hasStripeSubscription,
    daysRemaining: getDaysRemaining(currentPeriodEnd, now),
    trialDaysRemaining: getDaysRemaining(trialEnd, now),
    currentPeriodEndLabel: formatDate(currentPeriodEnd),
    trialEndLabel: formatDate(trialEnd),
    effectivePlan,
  };
}
