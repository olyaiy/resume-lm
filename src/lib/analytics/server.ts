import type { SupabaseClient } from "@supabase/supabase-js";

import { getSubscriptionAccessState } from "@/lib/subscription-access";
import {
  buildAnalyticsPayload,
  type AnalyticsEventName,
  type AnalyticsProperties,
} from "./events";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

function getCaptureUrl() {
  return `${posthogHost.replace(/\/$/, "")}/capture/`;
}

export async function captureServerAnalyticsEvent(input: {
  distinctId: string | null | undefined;
  event: AnalyticsEventName;
  properties?: AnalyticsProperties;
}) {
  if (!posthogKey || !input.distinctId) return;

  try {
    const response = await fetch(getCaptureUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        buildAnalyticsPayload({
          apiKey: posthogKey,
          distinctId: input.distinctId,
          event: input.event,
          properties: input.properties,
        })
      ),
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("PostHog capture failed", {
        event: input.event,
        status: response.status,
      });
    }
  } catch (error) {
    console.warn("PostHog capture failed", {
      event: input.event,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getSubscriptionAnalyticsProperties(
  supabase: SupabaseClient,
  userId: string
) {
  const { data } = await supabase
    .from("subscriptions")
    .select("subscription_plan, subscription_status, stripe_subscription_id, current_period_end, trial_end")
    .eq("user_id", userId)
    .maybeSingle();

  const state = getSubscriptionAccessState(data);

  return {
    plan: state.effectivePlan || data?.subscription_plan || "free",
    is_pro: state.hasProAccess,
    subscription_status: data?.subscription_status ?? null,
  };
}
