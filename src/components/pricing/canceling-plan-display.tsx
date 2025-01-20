'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { createPortalSession } from '@/app/(dashboard)/subscription/stripe-session';
import { PricingCard, type Plan } from './pricing-card';

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

interface CancelingPlanDisplayProps {
  initialProfile: {
    subscription_plan: string | null;
    subscription_status: string | null;
    current_period_end: string | null;
    trial_end: string | null;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
  } | null;
}

export function CancelingPlanDisplay({ initialProfile }: CancelingPlanDisplayProps) {
  const [isLoading, setIsLoading] = useState(false);
  const subscriptionPlan = initialProfile?.subscription_plan?.toLowerCase() || 'free';

  const handlePortalSession = async () => {
    try {
      setIsLoading(true);
      const result = await createPortalSession();
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setIsLoading(false);
    }
  };

  // Format the end date
  const endDate = initialProfile?.current_period_end 
    ? new Date(initialProfile.current_period_end).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'the end of your billing period';

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-5xl mx-auto p-12 text-center rounded-2xl border border-yellow-200/50 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 backdrop-blur-xl mb-16">
        <div className="space-y-6">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-br from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            Your Pro Plan is Ending Soon
          </h2>
          <p className="text-muted-foreground text-lg">
            Your subscription will cancel on {endDate}. Until then, you'll continue to enjoy all Pro features.
          </p>
        </div>
      </Card>


      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <PricingCard
            key={plan.title}
            plan={plan}
            isCurrentPlan={plan.title.toLowerCase() === subscriptionPlan}
            isLoading={isLoading}
            onAction={handlePortalSession}
            buttonText={plan.title.toLowerCase() === subscriptionPlan ? 'Manage Subscription' : undefined}
            variant="canceling"
          />
        ))}
      </div>
    </div>
  );
} 