// src/app/settings/page.tsx

"use server"

import { SettingsContent } from '@/components/settings/settings-content'
import { createClient } from '@/utils/supabase/server'
import { getSubscriptionAccessState } from '@/lib/subscription-access';


export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subscription } = user
    ? await supabase
        .from('subscriptions')
        .select('subscription_plan, subscription_status, current_period_end, trial_end, stripe_subscription_id')
        .eq('user_id', user.id)
        .maybeSingle()
    : { data: null };

  const subscriptionState = getSubscriptionAccessState(subscription);
  const isProPlan = subscriptionState.hasProAccess;
  const subscriptionStatus = subscription?.subscription_status ?? '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <main className="pt-4 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <SettingsContent 
          user={user} 
          isProPlan={isProPlan}
          subscriptionStatus={subscriptionStatus}
          subscriptionSnapshot={subscription}
        />
      </main>
    </div>
  )
}
