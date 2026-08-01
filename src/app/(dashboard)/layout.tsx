import { Analytics } from "@vercel/analytics/react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { Footer } from "@/components/layout/footer";
import { PostHogPageView } from "@/components/analytics/posthog-pageview";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import {
  IMPERSONATION_STATE_COOKIE_NAME,
  parseImpersonationStateCookieValue,
} from "@/lib/impersonation";
import { getSubscriptionAccessState } from "@/lib/subscription-access";
import { createClient } from "@/utils/supabase/server";

const isVercel = process.env.VERCEL === "1";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const impersonationState = parseImpersonationStateCookieValue(
    cookieStore.get(IMPERSONATION_STATE_COOKIE_NAME)?.value,
  );

  let showUpgradeButton = true;
  let isProPlan = false;
  let subscriptionPlan = "free";
  let subscriptionStatus: string | null = null;
  let upgradeButtonVariant: "trial" | "upgrade" = "upgrade";

  try {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select(
        "subscription_plan, subscription_status, current_period_end, trial_end, stripe_subscription_id",
      )
      .eq("user_id", user.id)
      .maybeSingle();

    const subscriptionState = getSubscriptionAccessState(subscription);
    isProPlan = subscriptionState.hasProAccess;
    subscriptionPlan =
      subscriptionState.effectivePlan || subscription?.subscription_plan || "free";
    subscriptionStatus = subscription?.subscription_status ?? null;
    showUpgradeButton = !subscriptionState.hasProAccess;
    upgradeButtonVariant = subscriptionState.needsTrial ? "trial" : "upgrade";
  } catch {
    // Keep the dashboard usable if the subscription read is temporarily unavailable.
  }

  return (
    <PostHogProvider
      user={{
        id: user.id,
        subscriptionPlan,
        subscriptionStatus,
        isPro: isProPlan,
      }}
    >
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {impersonationState && (
        <div className="bg-amber-500 py-2 text-center text-sm text-white">
          Impersonating <span className="font-semibold">{user.email ?? user.id}</span>.{" "}
          <Link href="/stop-impersonation" className="font-medium underline">
            Stop impersonating
          </Link>
        </div>
      )}
      <div className="relative flex h-screen min-h-screen flex-col">
        <AppHeader
          showUpgradeButton={showUpgradeButton}
          isProPlan={isProPlan}
          upgradeButtonVariant={upgradeButtonVariant}
        />
        <main className="h-full py-14">{children}</main>
        <Footer />
        {isVercel && <Analytics />}
      </div>
    </PostHogProvider>
  );
}
