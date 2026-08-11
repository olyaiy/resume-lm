import type Stripe from "stripe";
import {
  getAnalyticsContextProperties,
  type AnalyticsAttributionContext,
} from "@/lib/analytics/attribution";

const CHECKOUT_SOURCE = "resumelm_checkout";

export interface CheckoutGuardInput {
  userId: string;
  priceId: string;
  includeTrial: boolean;
  analyticsContext?: AnalyticsAttributionContext;
}

export type CheckoutSessionMetadata = Record<string, string> & {
  supabaseUUID: string;
  price_id: string;
  include_trial: "true" | "false";
  source: typeof CHECKOUT_SOURCE;
};

export function isBlockingCheckoutSubscription(
  status: Stripe.Subscription.Status
): boolean {
  return (
    status === "active" ||
    status === "trialing" ||
    status === "past_due" ||
    status === "unpaid" ||
    status === "incomplete"
  );
}

export function buildCheckoutSessionMetadata({
  userId,
  priceId,
  includeTrial,
  analyticsContext,
}: CheckoutGuardInput): CheckoutSessionMetadata {
  return {
    supabaseUUID: userId,
    price_id: priceId,
    include_trial: includeTrial ? "true" : "false",
    source: CHECKOUT_SOURCE,
    ...(analyticsContext
      ? getAnalyticsContextProperties(analyticsContext)
      : {}),
  };
}

export function buildSubscriptionMetadata(
  input: CheckoutGuardInput
): CheckoutSessionMetadata {
  return buildCheckoutSessionMetadata(input);
}

export function buildCheckoutIdempotencyKey({
  userId,
  priceId,
  includeTrial,
}: CheckoutGuardInput): string {
  return `checkout:${userId}:${priceId}:${includeTrial ? "trial" : "paid"}`;
}

export function isMatchingOpenCheckoutSession(
  session: Pick<Stripe.Checkout.Session, "metadata" | "mode" | "status">,
  metadata: CheckoutSessionMetadata
): boolean {
  return (
    session.mode === "subscription" &&
    session.status === "open" &&
    session.metadata?.supabaseUUID === metadata.supabaseUUID &&
    session.metadata?.price_id === metadata.price_id &&
    session.metadata?.include_trial === metadata.include_trial &&
    session.metadata?.source === metadata.source
  );
}
