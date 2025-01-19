import { getSubscriptionStatus } from '@/utils/actions';
import Pricing from '@/components/pricing';
import ManageSubscriptionButton from '@/components/subscription/manage-subscription-button';

interface Profile {
  subscription_plan: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
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