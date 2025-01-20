'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PricingCard, type Plan } from './pricing-card';
import { postStripeSession } from '@/app/(dashboard)/subscription/stripe-session';

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

interface FreePlanDisplayProps {
  initialProfile: {
    subscription_plan: string | null;
    subscription_status: string | null;
  } | null;
}

export function FreePlanDisplay({ initialProfile }: FreePlanDisplayProps) {
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const subscriptionPlan = initialProfile?.subscription_plan?.toLowerCase() || 'free';

  const handleCheckout = async (plan: Plan) => {
    if (!plan.priceId) return;

    try {
      setIsCheckingOut(true);
      const { clientSecret } = await postStripeSession({ priceId: plan.priceId });
      router.push(`/subscription/checkout?session_id=${clientSecret}`);
    } catch (error) {
      console.error(`Error during checkout:`, error);
      setIsCheckingOut(false);
    }
  };

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
            isLoading={isCheckingOut}
            onAction={handleCheckout}
          />
        ))}
      </div>
    </div>
  );
} 