import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { getSubscriptionAccessState } from "@/lib/subscription-access";
import {
  buildAnalyticsPayload,
  type AnalyticsEventName,
  type AnalyticsProperties,
} from "./events";
import {
  ANALYTICS_ANONYMOUS_ID_COOKIE,
  ATTRIBUTION_COOKIE,
  getAnalyticsContextProperties,
  LATEST_ATTRIBUTION_COOKIE,
  normalizeAnalyticsAnonymousId,
  parseStoredAttributionValue,
  type AnalyticsAttributionContext,
} from "./attribution";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

function getCaptureUrl() {
  return `${posthogHost.replace(/\/$/, "")}/capture/`;
}

export async function getServerAnalyticsContext(): Promise<AnalyticsAttributionContext> {
  try {
    const cookieStore = await cookies();
    return {
      anonymousId: normalizeAnalyticsAnonymousId(
        cookieStore.get(ANALYTICS_ANONYMOUS_ID_COOKIE)?.value,
      ),
      currentAttribution: parseStoredAttributionValue(
        cookieStore.get(LATEST_ATTRIBUTION_COOKIE)?.value,
      ),
      firstTouchAttribution: parseStoredAttributionValue(
        cookieStore.get(ATTRIBUTION_COOKIE)?.value,
      ),
    };
  } catch {
    // Webhooks and non-request server contexts have no browser cookies.
    return { currentAttribution: {}, firstTouchAttribution: {} };
  }
}

export async function captureServerAnalyticsEvent(input: {
  distinctId: string | null | undefined;
  event: AnalyticsEventName;
  insertId?: string;
  properties?: AnalyticsProperties;
  context?: Partial<AnalyticsAttributionContext>;
  identitySource?: string;
}) {
  const distinctId = input.distinctId?.trim();
  if (!posthogKey || !distinctId) return;

  try {
    const cookieContext = await getServerAnalyticsContext();
    const context: AnalyticsAttributionContext = {
      anonymousId: input.context?.anonymousId ?? cookieContext.anonymousId,
      currentAttribution:
        input.context?.currentAttribution ?? cookieContext.currentAttribution,
      firstTouchAttribution:
        input.context?.firstTouchAttribution ?? cookieContext.firstTouchAttribution,
    };

    const response = await fetch(getCaptureUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        buildAnalyticsPayload({
          apiKey: posthogKey,
          distinctId,
          event: input.event,
          insertId: input.insertId,
          properties: {
            ...input.properties,
            ...getAnalyticsContextProperties(context),
            analytics_user_id: distinctId,
            capture_source: "server",
            identity_source: input.identitySource ?? "supabase_user_id",
          },
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
