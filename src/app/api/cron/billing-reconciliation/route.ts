import Stripe from "stripe";

import { reportBillingAlert } from "@/lib/billing/alerts";
import {
  compareStripeAndSupabaseState,
  type StoredReconciliationSnapshot,
  type StripeReconciliationSnapshot,
} from "@/lib/billing/reconciliation";
import { createServiceClient } from "@/utils/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-04-30.basil",
    });
  }
  return stripe;
}

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function listAllStripeSubscriptions(): Promise<Stripe.Subscription[]> {
  const subscriptions: Stripe.Subscription[] = [];
  let startingAfter: string | undefined;

  do {
    const page = await getStripe().subscriptions.list({
      status: "all",
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    subscriptions.push(...page.data);
    startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
  } while (startingAfter);

  return subscriptions;
}

function toStripeSnapshot(subscription: Stripe.Subscription): StripeReconciliationSnapshot | null {
  const item = subscription.items.data[0];
  if (!item) return null;

  return {
    id: subscription.id,
    priceId: item.price.id,
    status: subscription.status,
    currentPeriodEnd: item.current_period_end
      ? new Date(item.current_period_end * 1000).toISOString()
      : null,
    trialEnd: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}

async function runBillingReconciliation() {
  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
  if (!proPriceId) throw new Error("NEXT_PUBLIC_STRIPE_PRO_PRICE_ID is not configured");

  const supabase = await createServiceClient();
  const [{ data: storedRows, error: storedError }, stripeSubscriptions] = await Promise.all([
    supabase
      .from("subscriptions")
      .select(
        "user_id, stripe_subscription_id, subscription_plan, subscription_status, current_period_end, trial_end, payment_failure_count",
      )
      .not("stripe_subscription_id", "is", null),
    listAllStripeSubscriptions(),
  ]);

  if (storedError) throw storedError;

  const storedByStripeId = new Map(
    ((storedRows ?? []) as StoredReconciliationSnapshot[])
      .filter((row) => row.stripe_subscription_id)
      .map((row) => [row.stripe_subscription_id as string, row]),
  );

  let checked = 0;
  let mismatches = 0;
  let mappingMissing = 0;
  let staleEntitlements = 0;
  const seenStripeIds = new Set<string>();

  for (const subscription of stripeSubscriptions) {
    const snapshot = toStripeSnapshot(subscription);
    if (!snapshot) continue;
    checked += 1;
    seenStripeIds.add(snapshot.id);

    const mismatch = compareStripeAndSupabaseState({
      stripe: snapshot,
      stored: storedByStripeId.get(snapshot.id) ?? null,
      proPriceId,
    });
    if (!mismatch) continue;

    mismatches += 1;
    if (mismatch.kind === "mapping_missing") mappingMissing += 1;
    if (mismatch.kind === "stale_entitlement") staleEntitlements += 1;

    await reportBillingAlert(supabase, {
      type: mismatch.kind === "mapping_missing" ? "mapping_missing" : "billing_state_mismatch",
      severity: mismatch.severity,
      alertKey: `reconciliation:${snapshot.id}:${mismatch.kind}:${mismatch.expectedState}:${mismatch.actualState ?? "missing"}`,
      message: `Stripe and Supabase disagree for subscription ${snapshot.id.slice(-8)} (${mismatch.kind}).`,
      stripeSubscriptionId: snapshot.id,
      details: {
        expected_state: mismatch.expectedState,
        actual_state: mismatch.actualState,
        expected_plan: mismatch.expectedPlan,
        expected_status: mismatch.expectedStatus,
        stripe_status: snapshot.status,
      },
    });
  }

  for (const stored of storedByStripeId.values()) {
    if (!stored.stripe_subscription_id || seenStripeIds.has(stored.stripe_subscription_id)) continue;

    const mismatch = compareStripeAndSupabaseState({
      stripe: {
        id: stored.stripe_subscription_id,
        priceId: "missing",
        status: "canceled",
        currentPeriodEnd: null,
        trialEnd: null,
        cancelAtPeriodEnd: false,
      },
      stored,
      proPriceId,
    });

    if (mismatch?.kind !== "stale_entitlement") continue;
    staleEntitlements += 1;
    mismatches += 1;
    await reportBillingAlert(supabase, {
      type: "billing_state_mismatch",
      severity: "critical",
      alertKey: `reconciliation:missing:${stored.stripe_subscription_id}`,
      message: `Supabase still grants Pro for a subscription missing in Stripe (${stored.stripe_subscription_id.slice(-8)}).`,
      stripeSubscriptionId: stored.stripe_subscription_id,
      details: {
        expected_state: "free",
        actual_state: mismatch.actualState,
        stored_plan: stored.subscription_plan,
        stored_status: stored.subscription_status,
      },
    });
  }

  return {
    checkedStripeSubscriptions: checked,
    linkedSupabaseSubscriptions: storedByStripeId.size,
    mismatches,
    mappingMissing,
    staleEntitlements,
  };
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return Response.json({ ok: true, ...(await runBillingReconciliation()) });
  } catch (error) {
    console.error("Billing reconciliation failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json({ error: "Billing reconciliation failed" }, { status: 500 });
  }
}
