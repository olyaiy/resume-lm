'use client'

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Star, Trophy, Rocket, Clock, Zap } from "lucide-react"
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { createPortalSession, postStripeSession } from '@/app/(dashboard)/subscription/stripe-session';
import { PricingCard, type Plan } from '../pricing/pricing-card';
import { useRouter } from 'next/navigation';
import { getSubscriptionStatus } from '@/utils/actions/stripe/actions';

const plans = [
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

export function SubscriptionSection() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      try {
        const data = await getSubscriptionStatus();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchSubscriptionStatus();
  }, []);

  const subscription_plan = profile?.subscription_plan;
  const subscription_status = profile?.subscription_status;
  const current_period_end = profile?.current_period_end;
  
  const isPro = subscription_plan?.toLowerCase() === 'pro';
  const isCanceling = subscription_status === 'canceled';

  const handlePortalSession = async () => {
    try {
      setIsLoading(true);
      const result = await createPortalSession();
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      // Handle error silently
      void error
    } finally {
      setIsLoading(false);
    }
  };

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

  // Calculate days remaining for canceling plan
  const daysRemaining = current_period_end
    ? Math.max(0, Math.ceil((new Date(current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (isLoadingProfile) {
    return (
      <div className="space-y-16 relative min-h-[600px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-16 w-16 bg-muted rounded-2xl" />
          <div className="h-8 w-48 bg-muted rounded-full" />
          <div className="h-4 w-64 bg-muted rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {isPro ? (
          <>
            <div className="absolute -top-[40%] -right-[25%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-purple-500/10 to-violet-500/10 blur-3xl" />
            <div className="absolute -bottom-[40%] -left-[25%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-indigo-500/10 to-blue-500/10 blur-3xl" />
          </>
        ) : isCanceling ? (
          <>
            <div className="absolute -top-[40%] -right-[25%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-amber-500/5 to-orange-500/5 blur-3xl animate-pulse" />
            <div className="absolute -bottom-[40%] -left-[25%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-red-500/5 to-pink-500/5 blur-3xl animate-pulse" />
          </>
        ) : (
          <>
            <div className="absolute -top-[40%] -right-[25%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-teal-500/10 to-emerald-500/10 blur-3xl" />
            <div className="absolute -bottom-[40%] -left-[25%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-3xl" />
          </>
        )}
      </div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className={cn(
          "p-8 text-center rounded-3xl border backdrop-blur-xl relative overflow-hidden shadow-2xl",
          isPro && "border-purple-200/50 bg-gradient-to-br from-purple-50/80 to-violet-50/80",
          isCanceling && "border-amber-200/50 bg-gradient-to-br from-amber-50/80 to-orange-50/80",
          !isPro && !isCanceling && "border-teal-200/50 bg-gradient-to-br from-teal-50/80 to-emerald-50/80"
        )}>
          <div className="relative space-y-6">
            {/* Icon */}
            <div className="flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                className={cn(
                  "h-16 w-16 rounded-2xl flex items-center justify-center transform transition-transform duration-300",
                  isPro && "bg-gradient-to-br from-purple-500 to-violet-500 hover:rotate-12",
                  isCanceling && "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
                  !isPro && !isCanceling && "bg-gradient-to-br from-teal-500 to-emerald-500 hover:rotate-12"
                )}
              >
                {isPro ? (
                  <Trophy className="h-8 w-8 text-white" />
                ) : isCanceling ? (
                  <Clock className="h-8 w-8 text-amber-600 animate-pulse" />
                ) : (
                  <Rocket className="h-8 w-8 text-white" />
                )}
              </motion.div>
            </div>

            {/* Title and Description */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">
                <span className={cn(
                  "bg-clip-text text-transparent",
                  isPro && "bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600",
                  isCanceling && "bg-gradient-to-r from-amber-600 to-orange-600",
                  !isPro && !isCanceling && "bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600"
                )}>
                  {isPro ? 'Pro Plan Active' : isCanceling ? 'Pro Access Ending Soon' : 'Free Plan Active'}
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                {isCanceling ? (
                  <>You have <span className="font-semibold text-amber-600">{daysRemaining} days</span> of Pro access remaining</>
                ) : (
                  isPro ? 'Enjoying unlimited access to all features' : 'Start building your perfect resume today'
                )}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4">
              {[
                isPro ? [
                  { icon: Trophy, text: "Premium Features" },
                  { icon: Sparkles, text: "Priority Support" },
                  { icon: Star, text: "Exclusive Templates" }
                ] : isCanceling ? [
                  { icon: Star, text: "Premium Features Ending" },
                  { icon: Clock, text: `${daysRemaining} Days Left` },
                  { icon: Zap, text: "Download Your Content" }
                ] : [
                  { icon: Rocket, text: "Quick Start" },
                  { icon: Sparkles, text: "Basic Features" },
                  { icon: Zap, text: "Standard Templates" }
                ]
              ][0].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className={cn(
                    "p-4 rounded-xl backdrop-blur-sm border transition-all duration-300",
                    isPro && "bg-white/40 border-purple-100 hover:border-purple-200",
                    isCanceling && "bg-white/40 border-amber-100 hover:border-amber-200",
                    !isPro && !isCanceling && "bg-white/40 border-teal-100 hover:border-teal-200"
                  )}
                >
                  <item.icon className={cn(
                    "h-6 w-6 mx-auto mb-2",
                    isPro && "text-purple-600",
                    isCanceling && "text-amber-600",
                    !isPro && !isCanceling && "text-teal-600"
                  )} />
                  <p className={cn(
                    "text-sm font-medium",
                    isPro && "text-purple-900",
                    isCanceling && "text-amber-900",
                    !isPro && !isCanceling && "text-teal-900"
                  )}>{item.text}</p>
                </motion.div>
              ))}
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <Button
                onClick={handlePortalSession}
                disabled={isLoading}
                className={cn(
                  "px-8 py-2 text-white border-0 transition-colors",
                  isPro && "bg-violet-600 hover:bg-violet-700",
                  isCanceling && "bg-amber-600 hover:bg-amber-700",
                  !isPro && !isCanceling && "bg-teal-600 hover:bg-teal-700"
                )}
              >
                {isLoading ? (
                  "Loading..."
                ) : (
                  isPro ? 'Manage Subscription' : isCanceling ? 'Reactivate Pro' : 'Upgrade to Pro'
                )}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 relative">
        {plans.map((plan) => (
          <motion.div
            key={plan.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: plan.title === 'Pro' ? 0.2 : 0,
              duration: 0.5
            }}
            className={cn(
              "relative",
              plan.title === 'Pro' && "md:-mt-4 md:mb-4"
            )}
          >
            {plan.title === 'Pro' && (
              <>
                {/* Animated glow effect */}
                <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-2xl opacity-75 blur-lg group-hover:opacity-100 animate-pulse transition-opacity duration-500" />
                <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-2xl" />
                {/* Pro badge */}
                <div className="absolute -top-6 left-0 right-0 mx-auto w-32 z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full blur-md" />
                    <div className="relative bg-gradient-to-r from-purple-500 to-violet-500 text-white px-4 py-1 rounded-full text-sm font-medium text-center shadow-lg">
                      Most Popular
                    </div>
                  </div>
                </div>
              </>
            )}
            <PricingCard
              key={plan.title}
              plan={plan}
              isCurrentPlan={plan.title.toLowerCase() === subscription_plan?.toLowerCase()}
              isLoading={isCheckingOut}
              onAction={handleCheckout}
              buttonText={plan.title.toLowerCase() === subscription_plan?.toLowerCase() ? 'Current Plan' : undefined}
              variant={isPro ? 'pro' : isCanceling ? 'canceling' : 'default'}
              className={cn(
                "relative",
                plan.title === 'Pro' && [
                  "scale-105 shadow-2xl",
                  "hover:scale-[1.07] hover:shadow-3xl hover:shadow-purple-500/20",
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