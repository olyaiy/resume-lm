'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { cancelSubscription } from '@/utils/actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { createPortalSession, postStripeSession } from '@/app/(dashboard)/subscription/stripe-session';
import { PricingCard, type Plan } from './pricing/pricing-card';



const plans: Plan[] = [
  {
    title: 'Free',
    priceId: '',
    price: '$0',
    features: [
      '1 Base Resume',
      '3 Tailored Resumes',
      'Basic AI Assistance',
      'Standard Templates'
    ]
  },
  {
    title: 'Pro',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!,
    price: '$20',
    features: [
      'Unlimited Base Resumes',
      'Unlimited Tailored Resumes',
      'Advanced AI Assistance',
      'Premium Templates',
      'Priority Support',
      'Custom Branding'
    ]
  }
];

interface Profile {
  subscription_plan: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

interface PricingProps {
  initialProfile: Profile | null;
}

// Simplify ActionState to just the type
type ActionType = 'idle' | 'checkout' | 'cancel' | 'portal';

export default function Pricing({ initialProfile }: PricingProps) {
  const router = useRouter();
  const [actionType, setActionType] = useState<ActionType>('idle');
  const subscriptionPlan = initialProfile?.subscription_plan?.toLowerCase() || 'free';

  const handleError = (error: unknown, action: string) => {
    console.error(`Error during ${action}:`, error);
    setActionType('idle');
  };

  const handleCheckout = async (plan: Plan) => {
    const planTitle = plan.title.toLowerCase();
    if (planTitle === subscriptionPlan) {
      await handleCancelSubscription();
      return;
    }

    if (!plan.priceId) return;

    try {
      setActionType('checkout');
      const { clientSecret } = await postStripeSession({ priceId: plan.priceId });
      router.push(`/subscription/checkout?session_id=${clientSecret}`);
    } catch (error) {
      handleError(error, 'checkout');
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setActionType('cancel');
      await cancelSubscription();
    } catch (error) {
      // Handle error silently
    }
  };

  const handlePortalSession = async () => {
    try {
      setActionType('portal');
      const result = await createPortalSession();
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      // Handle error silently
    }
  };

  if (actionType === 'portal') {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto p-12 text-center rounded-2xl border border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-violet-50/50 backdrop-blur-xl">
          <div className="space-y-6">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Loading...
            </h2>
            <p className="text-muted-foreground text-lg">
              Redirecting to manage subscription
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={handlePortalSession}
              disabled={(actionType as ActionType) === 'portal'}
            >
              {(actionType as ActionType) === 'portal' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Manage Subscription'
              )}
            </Button>
          </div>
        </Card>

        <DebugInfo profile={initialProfile} />
      </div>
    );
  }

  // Show thank you message for Pro subscribers
  if (subscriptionPlan === 'pro') {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto p-12 text-center rounded-2xl border border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-violet-50/50 backdrop-blur-xl">
          <div className="space-y-6">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 flex items-center justify-center">
              <Check className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Thank You for Being a Pro Member!
            </h2>
            <p className="text-muted-foreground text-lg">
              Enjoy unlimited access to all premium features and priority support.
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={handlePortalSession}
              disabled={(actionType as ActionType) === 'portal'}
            >
              {(actionType as ActionType) === 'portal' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Manage Subscription'
              )}
            </Button>
          </div>
        </Card>

        <DebugInfo profile={initialProfile} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Get started with our flexible pricing options
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <PricingCard
            key={plan.title}
            plan={plan}
            isCurrentPlan={plan.title.toLowerCase() === subscriptionPlan}
            isLoading={
              (actionType === 'checkout') || 
              (actionType === 'cancel' && plan.title.toLowerCase() === subscriptionPlan)
            }
            onAction={handleCheckout}
          />
        ))}
      </div>

      <DebugInfo profile={initialProfile} />
    </div>
  );
}

function DebugInfo({ profile }: { profile: Profile | null }) {
  if (!profile) return null;
  
  return (
    <div className="mt-12 p-6 rounded-lg border border-border/50 max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Current Subscription Status</h3>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Plan: {profile.subscription_plan || 'No plan'}</p>
        <p>Status: {profile.subscription_status || 'No status'}</p>
        <p>Current Period Ends: {profile.current_period_end ? new Date(profile.current_period_end).toLocaleDateString() : 'N/A'}</p>
        <p>Trial Ends: {profile.trial_end ? new Date(profile.trial_end).toLocaleDateString() : 'N/A'}</p>
        <p>Stripe Customer ID: {profile.stripe_customer_id || 'None'}</p>
        <p>Stripe Subscription ID: {profile.stripe_subscription_id || 'None'}</p>
      </div>
    </div>
  );
}
