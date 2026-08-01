import type Stripe from "stripe";

type InvoiceWithLegacySubscription = Stripe.Invoice & {
  /** `subscription` was present on older Stripe API versions. */
  subscription?: string | Stripe.Subscription | null;
};

const FIRST_PAID_INVOICE_REASONS = new Set<Stripe.Invoice.BillingReason>([
  "subscription_create",
  "subscription_cycle",
]);

export function getInvoiceSubscriptionId(
  invoice: InvoiceWithLegacySubscription
): string | null {
  if (invoice.subscription) {
    return typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription.id;
  }

  const subscriptionDetails =
    invoice.parent?.type === "subscription_details"
      ? invoice.parent.subscription_details
      : null;

  if (!subscriptionDetails?.subscription) {
    return null;
  }

  return typeof subscriptionDetails.subscription === "string"
    ? subscriptionDetails.subscription
    : subscriptionDetails.subscription.id;
}

export function shouldCaptureTrialStarted(input: {
  eventType: string;
  status: Stripe.Subscription.Status;
  previousStatus?: Stripe.Subscription.Status;
}): boolean {
  if (input.status !== "trialing") {
    return false;
  }

  if (input.eventType === "customer.subscription.created") {
    return true;
  }

  return (
    input.eventType === "customer.subscription.updated" &&
    input.previousStatus !== undefined &&
    input.previousStatus !== "trialing"
  );
}

export function isFirstPaidInvoice(input: {
  invoice: Pick<Stripe.Invoice, "id" | "status" | "amount_paid" | "billing_reason">;
  paidSubscriptionInvoices: Array<
    Pick<Stripe.Invoice, "id" | "status" | "amount_paid">
  >;
}): boolean {
  const { invoice } = input;

  if (
    invoice.status !== "paid" ||
    invoice.amount_paid <= 0 ||
    !invoice.billing_reason ||
    !FIRST_PAID_INVOICE_REASONS.has(invoice.billing_reason)
  ) {
    return false;
  }

  return !input.paidSubscriptionInvoices.some(
    (candidate) =>
      candidate.id !== invoice.id &&
      candidate.status === "paid" &&
      candidate.amount_paid > 0
  );
}
