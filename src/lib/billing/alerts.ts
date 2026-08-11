import type { SupabaseClient } from "@supabase/supabase-js";

import { AnalyticsEvents } from "@/lib/analytics/events";
import { captureServerAnalyticsEvent } from "@/lib/analytics/server";

export type BillingAlertType =
  | "payment_failed"
  | "billing_state_mismatch"
  | "mapping_missing"
  | "webhook_processing_failed";

export interface BillingAlertInput {
  type: BillingAlertType;
  severity: "warning" | "critical";
  alertKey: string;
  message: string;
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
  details?: Record<string, string | number | boolean | null | undefined>;
}

const ALERT_COOLDOWN_MS = 15 * 60 * 1000;

export function identifierSuffix(value?: string | null): string | null {
  if (!value) return null;
  return value.length <= 8 ? value : value.slice(-8);
}

export function redactBillingAlertDetails(
  details: BillingAlertInput["details"] = {},
): Record<string, string | number | boolean | null> {
  const output: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(details)) {
    if (value === undefined) continue;
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("email") || lowerKey.includes("password")) continue;
    if (
      lowerKey.includes("stripe_subscription_id") ||
      lowerKey.includes("stripe_customer_id") ||
      lowerKey === "user_id"
    ) {
      output[key] = identifierSuffix(String(value));
    } else if (typeof value === "string") {
      output[key] = value.slice(0, 240);
    } else {
      output[key] = value;
    }
  }
  return output;
}

export function buildBillingAlertNotification(input: BillingAlertInput) {
  return {
    text: `[ResumeLM billing] ${input.severity.toUpperCase()}: ${input.message}`,
    alert_type: input.type,
    severity: input.severity,
    stripe_subscription_suffix: identifierSuffix(input.stripeSubscriptionId),
    details: redactBillingAlertDetails(input.details),
  };
}

function shouldNotify(lastNotifiedAt: string | null | undefined, now: Date) {
  if (!lastNotifiedAt) return true;
  const timestamp = Date.parse(lastNotifiedAt);
  return !Number.isFinite(timestamp) || now.getTime() - timestamp >= ALERT_COOLDOWN_MS;
}

export async function reportBillingAlert(
  supabase: SupabaseClient,
  input: BillingAlertInput,
): Promise<void> {
  const now = new Date();
  const details = redactBillingAlertDetails(input.details);
  const { data: existing, error: readError } = await supabase
    .from("billing_alerts")
    .select("occurrence_count, last_notified_at")
    .eq("alert_key", input.alertKey)
    .maybeSingle();

  if (readError) {
    console.error("Billing alert state lookup failed", { alertType: input.type, error: readError });
    return;
  }

  const occurrenceCount = (existing?.occurrence_count ?? 0) + 1;
  const notify = shouldNotify(existing?.last_notified_at, now);
  const row = {
    alert_key: input.alertKey,
    alert_type: input.type,
    severity: input.severity,
    stripe_subscription_id: input.stripeSubscriptionId ?? null,
    stripe_customer_id: input.stripeCustomerId ?? null,
    details,
    occurrence_count: occurrenceCount,
    first_seen_at: existing ? undefined : now.toISOString(),
    last_seen_at: now.toISOString(),
  };

  const { error: writeError } = existing
    ? await supabase.from("billing_alerts").update(row).eq("alert_key", input.alertKey)
    : await supabase.from("billing_alerts").insert(row);

  if (writeError) {
    console.error("Billing alert state write failed", { alertType: input.type, error: writeError });
    return;
  }

  let delivered = false;
  const alertWebhookUrl = process.env.BILLING_ALERT_WEBHOOK_URL;
  if (notify && alertWebhookUrl) {
    try {
      const response = await fetch(alertWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBillingAlertNotification(input)),
        cache: "no-store",
      });
      delivered = response.ok;
      if (!response.ok) {
        console.error("Billing alert webhook rejected notification", {
          alertType: input.type,
          status: response.status,
        });
      }
    } catch (error) {
      console.error("Billing alert webhook delivery failed", {
        alertType: input.type,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (delivered) {
    await supabase
      .from("billing_alerts")
      .update({ last_notified_at: now.toISOString() })
      .eq("alert_key", input.alertKey);
  }

  await captureServerAnalyticsEvent({
    distinctId: "billing-alerts",
    event: AnalyticsEvents.BillingAlertTriggered,
    insertId: `${input.alertKey}:${occurrenceCount}`,
    properties: {
      billing_alert_type: input.type,
      billing_alert_severity: input.severity,
      billing_alert_occurrence_count: occurrenceCount,
      billing_alert_webhook_configured: Boolean(alertWebhookUrl),
      billing_alert_webhook_delivered: delivered,
      stripe_subscription_suffix: identifierSuffix(input.stripeSubscriptionId),
    },
  });
}
