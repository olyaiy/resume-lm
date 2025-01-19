'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';

export interface Plan {
  title: string;
  priceId: string;
  price: string;
  features: string[];
}

interface PricingCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  isLoading: boolean;
  onAction: (plan: Plan) => Promise<void>;
}

export function PricingCard({ 
  plan, 
  isCurrentPlan, 
  isLoading,
  onAction 
}: PricingCardProps) {
  const isFree = plan.title === 'Free';
  
  return (
    <Card className="relative p-8 rounded-2xl border border-border/50 backdrop-blur-xl bg-background/50 flex flex-col">
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

      <div className="mt-auto">
        <Button
          className="w-full"
          variant={plan.title === 'Pro' ? 'default' : 'outline'}
          onClick={() => onAction(plan)}
          disabled={isLoading || isFree}
          {...(isFree && { className: "w-full opacity-50 cursor-not-allowed" })}
        >
          {isLoading && isCurrentPlan ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isFree && isCurrentPlan
            ? 'Your current plan'
            : isCurrentPlan
            ? 'Cancel Subscription'
            : `Upgrade to ${plan.title}`}
        </Button>
      </div>
    </Card>
  );
} 