import { getSubscriptionStatus } from '@/utils/actions';
import Pricing from '@/components/pricing';
import { createPortalSession } from './stripe-session';
import { Button } from '@/components/ui/button';

interface Profile {
  subscription_plan: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

// Client component for the manage subscription button
'use client';
function ManageSubscriptionButton() {
  const handleManageSubscription = async () => {
    try {
      const result = await createPortalSession();
      console.log('Portal session result:', result);
    } catch (error) {
      console.error('Error creating portal session:', error);
    }
  };

  return (
    <Button onClick={handleManageSubscription} variant="outline">
      Manage Subscription
    </Button>
  );
}

export default async function PlansPage() {
  let profile: Profile | null = null;
  try {
    profile = await getSubscriptionStatus();
  } catch (error) {
    // User is not authenticated or other error occurred
    console.error('Error fetching subscription status:', error);
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      {profile?.stripe_subscription_id && <ManageSubscriptionButton />}
      <Pricing initialProfile={profile} />
    </div>
  );
}