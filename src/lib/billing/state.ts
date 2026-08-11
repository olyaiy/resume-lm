export type BillingState =
  | "trial"
  | "active"
  | "canceling"
  | "past_due"
  | "free";

export interface BillingStateInput {
  plan?: string | null;
  status?: string | null;
  stripeStatus?: string | null;
  currentPeriodEnd?: string | Date | null;
  trialEnd?: string | Date | null;
  cancelAtPeriodEnd?: boolean;
}

function toDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isFuture(value: string | Date | null | undefined, now: Date): boolean {
  const date = toDate(value);
  return date !== null && date.getTime() > now.getTime();
}

export function getBillingState(
  input: BillingStateInput,
  now: Date = new Date(),
): BillingState {
  const plan = input.plan?.toLowerCase() ?? "";
  const status = input.status?.toLowerCase() ?? "";
  const stripeStatus = input.stripeStatus?.toLowerCase() ?? "";

  if (plan !== "pro") return "free";

  const isTrialing =
    stripeStatus === "trialing" ||
    (!stripeStatus && status === "active" && isFuture(input.trialEnd, now));
  const hasFutureAccessWindow =
    isFuture(input.currentPeriodEnd, now) || isFuture(input.trialEnd, now);

  // A stale database row must never keep Pro access alive indefinitely.
  if (!hasFutureAccessWindow) return "free";

  if (isTrialing) {
    return input.cancelAtPeriodEnd ? "canceling" : "trial";
  }

  if (stripeStatus === "past_due" || status === "past_due") {
    return "past_due";
  }

  if (
    input.cancelAtPeriodEnd ||
    stripeStatus === "canceled" ||
    status === "canceled"
  ) {
    return "canceling";
  }

  if (stripeStatus === "active" || status === "active") {
    return "active";
  }

  return "free";
}

