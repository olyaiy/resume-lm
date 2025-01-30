'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, Clock, ArrowDownToLine, Lock } from 'lucide-react';
import { createPortalSession } from '@/app/(dashboard)/subscription/stripe-session';
import { PricingCard, type Plan } from './pricing-card';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
    } catch {
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

  // Calculate days remaining
  const daysRemaining = initialProfile?.current_period_end
    ? Math.max(0, Math.ceil((new Date(initialProfile.current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="container mx-auto px-4 py-16 relative">
      {/* Subtle pulsing background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -right-[25%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-amber-500/5 to-orange-500/5 blur-3xl animate-pulse" />
        <div className="absolute -bottom-[40%] -left-[25%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-red-500/5 to-pink-500/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="max-w-5xl mx-auto p-12 text-center rounded-3xl border border-amber-200/50 bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-xl mb-16 relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-orange-400/5 animate-gradient" />
          
          <div className="relative space-y-8">
            <div className="flex items-center justify-center space-x-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center"
              >
                <Clock className="h-8 w-8 text-amber-600 animate-pulse" />
              </motion.div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold">
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Your Pro Access is Ending Soon
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                You have <span className="font-semibold text-amber-600">{daysRemaining} days</span> remaining until {endDate}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { 
                  icon: Lock,
                  text: "Premium Features Locking Soon",
                  subtext: "Including AI assistance"
                },
                { 
                  icon: ArrowDownToLine,
                  text: "Download Your Content",
                  subtext: "While you still have access"
                },
                { 
                  icon: AlertCircle,
                  text: "Limited Template Access",
                  subtext: "Reverting to basic templates"
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="p-4 rounded-xl bg-white/40 backdrop-blur-sm border border-amber-100 hover:border-amber-200 transition-colors duration-300"
                >
                  <item.icon className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-amber-900">{item.text}</p>
                  <p className="text-xs text-amber-600/80 mt-1">{item.subtext}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto relative">
        {plans.map((plan) => (
          <motion.div
            key={plan.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: plan.title === 'Pro' ? 0.2 : 0,
              duration: 0.5
            }}
            className={`relative ${plan.title === 'Pro' ? 'md:-mt-4 md:mb-4' : ''}`}
          >
            {plan.title === 'Pro' && (
              <>
                {/* Animated glow effect */}
                <div className="absolute -inset-[2px] bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl opacity-75 blur-lg group-hover:opacity-100 animate-pulse transition-opacity duration-500" />
                <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl" />
                {/* Time-sensitive badge */}
                <div className="absolute -top-6 left-0 right-0 mx-auto w-40 z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full blur-md" />
                    <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium text-center shadow-lg">
                      Limited Time Left
                    </div>
                  </div>
                </div>
              </>
            )}
            <PricingCard
              key={plan.title}
              plan={plan}
              isCurrentPlan={plan.title.toLowerCase() === subscriptionPlan}
              isLoading={isLoading}
              onAction={handlePortalSession}
              buttonText={plan.title.toLowerCase() === subscriptionPlan ? 'Manage Subscription' : undefined}
              variant="canceling"
              className={cn(
                "relative",
                plan.title === 'Pro' && [
                  "scale-105 shadow-2xl",
                  "hover:scale-[1.07] hover:shadow-3xl hover:shadow-amber-500/20",
                  "transition-all duration-500"
                ]
              )}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
} 