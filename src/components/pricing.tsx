'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getSubscriptionStatus, createCheckoutSession, cancelSubscription } from '@/utils/actions';
import { checkAuth } from '@/app/auth/login/actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { createPortalSession } from '@/app/(dashboard)/subscription/stripe-session';

interface AuthStatus {
  authenticated: boolean;
  user?: { id: string; email?: string } | null;
}

interface Plan {
  title: string;
  priceId: string;
  price: string;
  features: string[];
}

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

export default function Pricing({ initialProfile }: PricingProps) {
  const router = useRouter();
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>(
    initialProfile?.subscription_plan?.toLowerCase() || 'free'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [portalLoading, setPortalLoading] = useState<boolean>(false);

  useEffect(() => {
    // Only fetch if we don't have initial data
    if (!initialProfile) {
      const fetchStatuses = async () => {
        try {
          setLoading(true);
          const [profile, auth] = await Promise.all([
            getSubscriptionStatus(),
            checkAuth()
          ]);
          setSubscriptionPlan(profile.subscription_plan?.toLowerCase() || 'free');
          setAuthStatus(auth);
        } catch (error) {
          // Handle error silently
        } finally {
          setLoading(false);
        }
      };
      fetchStatuses();
    }
  }, [initialProfile]);

  const handleCheckout = async (plan: Plan) => {
    if (plan.title === subscriptionPlan) {
      await handleCancelSubscription();
    } else if (plan.priceId) {
      router.push('/plans/checkout');
    }
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      await cancelSubscription();
      setSubscriptionPlan('free');
    } catch (error) {
      // Handle error silently
    }
    setCancelLoading(false);
  };

  const handlePortalSession = async () => {
    try {
      setPortalLoading(true);
      const result = await createPortalSession();
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
      </div>
    );
  }

  // Show thank you message for Pro subscribers
  if (subscriptionPlan?.toLowerCase() === 'pro') {
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
              disabled={portalLoading}
            >
              {portalLoading ? (
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

        {/* Keep the debug information */}
        {initialProfile && (
          <div className="mt-12 p-6 rounded-lg border border-border/50 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Current Subscription Status</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Plan: {initialProfile.subscription_plan || 'No plan'}</p>
              <p>Status: {initialProfile.subscription_status || 'No status'}</p>
              <p>Current Period Ends: {initialProfile.current_period_end ? new Date(initialProfile.current_period_end).toLocaleDateString() : 'N/A'}</p>
              <p>Trial Ends: {initialProfile.trial_end ? new Date(initialProfile.trial_end).toLocaleDateString() : 'N/A'}</p>
              <p>Stripe Customer ID: {initialProfile.stripe_customer_id || 'None'}</p>
              <p>Stripe Subscription ID: {initialProfile.stripe_subscription_id || 'None'}</p>
            </div>
          </div>
        )}
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
          <Card key={plan.title} className="relative p-8 rounded-2xl border border-border/50 backdrop-blur-xl bg-background/50">
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-2">{plan.title}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              variant={plan.title === 'Pro' ? 'default' : 'outline'}
              onClick={() => handleCheckout(plan)}
              disabled={cancelLoading}
            >
              {cancelLoading && plan.title === subscriptionPlan ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {plan.title === subscriptionPlan
                ? 'Cancel Subscription'
                : `Upgrade to ${plan.title}`}
            </Button>
          </Card>
        ))}
      </div>

      {/* Subscription Debug Information */}
      {initialProfile && (
        <div className="mt-12 p-6 rounded-lg border border-border/50 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-4">Current Subscription Status</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Plan: {initialProfile.subscription_plan || 'No plan'}</p>
            <p>Status: {initialProfile.subscription_status || 'No status'}</p>
            <p>Current Period Ends: {initialProfile.current_period_end ? new Date(initialProfile.current_period_end).toLocaleDateString() : 'N/A'}</p>
            <p>Trial Ends: {initialProfile.trial_end ? new Date(initialProfile.trial_end).toLocaleDateString() : 'N/A'}</p>
            <p>Stripe Customer ID: {initialProfile.stripe_customer_id || 'None'}</p>
            <p>Stripe Subscription ID: {initialProfile.stripe_subscription_id || 'None'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
