import Stripe from "stripe";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { getSubscriptionAccessState } from "@/lib/subscription-access";

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;

  return new Stripe(secretKey, {
    apiVersion: "2025-04-30.basil",
  });
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !sessionId) {
    redirect("/subscription");
  }

  let sessionBelongsToUser = false;
  const stripe = getStripeClient();
  if (stripe) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const sessionUserId = session.metadata?.supabaseUUID ?? session.client_reference_id;
      sessionBelongsToUser = session.status === "complete" && sessionUserId === user.id;
    } catch {
      sessionBelongsToUser = false;
    }
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("subscription_plan, subscription_status, stripe_subscription_id, current_period_end, trial_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const entitlementActive = sessionBelongsToUser && getSubscriptionAccessState(subscription).hasProAccess;

  return (
    <div className="text-center space-y-4 p-8 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          {entitlementActive ? "Subscription active" : "Payment received"}
        </h1>
        <p className="text-muted-foreground">
          {entitlementActive
            ? "Your Pro access is active."
            : "Stripe received your payment. We are confirming your subscription now; refresh this page in a moment if access has not appeared yet."}
        </p>
      </div>

      <div className="mt-6 p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
        <div className="space-y-2 text-sm">
          <p>✓ Access to AI-powered resume tailoring</p>
          <p>✓ Unlimited resume versions</p>
          <p>✓ App-funded premium AI models</p>
        </div>
      </div>
    </div>
  );
}
