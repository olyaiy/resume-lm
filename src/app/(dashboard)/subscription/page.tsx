
import { ProPlanDisplay } from '@/components/pricing/pro-plan-display';
import { FreePlanDisplay } from '@/components/pricing/free-plan-display';
import { CancelingPlanDisplay } from '@/components/pricing/canceling-plan-display';
import { getSubscriptionStatus} from '@/utils/actions/stripe/actions';


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

  const isPro = profile?.subscription_plan?.toLowerCase() === 'pro';
  const isCanceling = profile?.subscription_status === 'canceled';

  console.log('profile', profile);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 my-14">
      {isPro ? (
        isCanceling ? (
          <CancelingPlanDisplay initialProfile={profile} />
        ) : (
          <ProPlanDisplay initialProfile={profile} />
        )
      ) : (
        <FreePlanDisplay initialProfile={profile} />
      )}
    </div>
  );
}