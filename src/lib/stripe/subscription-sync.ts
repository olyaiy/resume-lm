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
