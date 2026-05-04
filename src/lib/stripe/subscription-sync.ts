import type { Subscription } from "@/lib/types";

export type SupportedStripeStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export interface MapStripeSubscriptionInput {
  userId: string;
  customerId: string;
  subscriptionId: string;
  priceId: string;
  stripeStatus: SupportedStripeStatus;
  currentPeriodEnd: Date | null;
  trialEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  proPriceId: string;
}

export interface AppSubscriptionStateForStaleCheck {
  stripe_subscription_id?: string | null;
  subscription_plan?: string | null;
  subscription_status?: string | null;
  current_period_end?: string | null;
  trial_end?: string | null;
}

export function mapStripeSubscriptionToAppSubscription(
  input: MapStripeSubscriptionInput
): Partial<Subscription> {
  const isKnownProPrice = input.priceId === input.proPriceId;
  const isActiveLike =
    input.stripeStatus === "active" || input.stripeStatus === "trialing";
  const shouldHaveProPlan = isKnownProPrice && isActiveLike;

  return {
    user_id: input.userId,
    stripe_customer_id: input.customerId,
    stripe_subscription_id: input.subscriptionId,
    subscription_plan: shouldHaveProPlan ? "pro" : "free",
    subscription_status:
      shouldHaveProPlan && !input.cancelAtPeriodEnd ? "active" : "canceled",
    current_period_end: input.currentPeriodEnd?.toISOString() ?? null,
    trial_end: input.trialEnd?.toISOString() ?? null,
    updated_at: new Date().toISOString(),
  };
}

function hasFutureEntitlementDate(
  subscription: AppSubscriptionStateForStaleCheck,
  now: Date
): boolean {
  const dates = [subscription.current_period_end, subscription.trial_end];

  return dates.some((date) => {
    if (!date) return false;
    const timestamp = Date.parse(date);
    return Number.isFinite(timestamp) && timestamp > now.getTime();
  });
}

export function shouldSkipStaleInactiveSubscriptionUpdate(input: {
  currentSubscription: AppSubscriptionStateForStaleCheck | null;
  incomingSubscription: AppSubscriptionStateForStaleCheck;
  now?: Date;
}): boolean {
  const { currentSubscription, incomingSubscription } = input;
  const now = input.now ?? new Date();

  if (!currentSubscription?.stripe_subscription_id) {
    return false;
  }

  if (!incomingSubscription.stripe_subscription_id) {
    return false;
  }

  if (
    currentSubscription.stripe_subscription_id ===
    incomingSubscription.stripe_subscription_id
  ) {
    return false;
  }

  const currentIsActivePro =
    currentSubscription.subscription_plan === "pro" &&
    currentSubscription.subscription_status === "active" &&
    hasFutureEntitlementDate(currentSubscription, now);

  if (!currentIsActivePro) {
    return false;
  }

  const incomingIsInactive =
    incomingSubscription.subscription_plan !== "pro" ||
    incomingSubscription.subscription_status !== "active";

  return incomingIsInactive;
}
