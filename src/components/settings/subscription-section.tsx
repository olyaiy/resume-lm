'use client'

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Star, Rocket, Clock, Zap, CheckCircle, ArrowRight, Crown, Shield } from "lucide-react"
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
      <div className="space-y-8 relative min-h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-20 w-20 bg-gradient-to-br from-purple-100 to-violet-100 rounded-3xl animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-200/50 to-violet-200/50 rounded-3xl animate-pulse delay-75" />
          </div>
          <div className="space-y-3 text-center">
            <div className="h-8 w-56 bg-gradient-to-r from-slate-200 to-slate-100 rounded-2xl animate-pulse" />
            <div className="h-5 w-72 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl animate-pulse delay-150" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 relative">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isPro ? (
          <>
            <div className="absolute -top-[30%] -right-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-400/8 via-violet-400/6 to-indigo-400/8 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute -bottom-[30%] -left-[20%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-indigo-400/6 via-blue-400/8 to-purple-400/6 blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
          </>
        ) : isCanceling ? (
          <>
            <div className="absolute -top-[30%] -right-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-amber-400/6 to-orange-400/8 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute -bottom-[30%] -left-[20%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-red-400/4 to-pink-400/6 blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
          </>
        ) : (
          <>
            <div className="absolute -top-[30%] -right-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-teal-400/8 to-emerald-400/6 blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
            <div className="absolute -bottom-[30%] -left-[20%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-blue-400/6 to-cyan-400/8 blur-3xl animate-pulse" style={{ animationDuration: '14s', animationDelay: '3s' }} />
          </>
        )}
      </div>

      {/* Enhanced Status Card */}
      <div className="relative">
        <Card className={cn(
          "relative overflow-hidden rounded-3xl border-0 shadow-2xl shadow-black/5 backdrop-blur-2xl transition-all duration-700 hover:shadow-3xl",
          isPro && "bg-gradient-to-br from-purple-50/90 via-white/85 to-violet-50/90 hover:shadow-purple-500/10",
          isCanceling && "bg-gradient-to-br from-amber-50/90 via-white/85 to-orange-50/90 hover:shadow-amber-500/10",
          !isPro && !isCanceling && "bg-gradient-to-br from-teal-50/90 via-white/85 to-emerald-50/90 hover:shadow-teal-500/10"
        )}>
          {/* Subtle Border Gradient */}
          <div className={cn(
            "absolute inset-0 rounded-3xl p-[1px]",
            isPro && "bg-gradient-to-br from-purple-200/60 via-transparent to-violet-200/60",
            isCanceling && "bg-gradient-to-br from-amber-200/60 via-transparent to-orange-200/60",
            !isPro && !isCanceling && "bg-gradient-to-br from-teal-200/60 via-transparent to-emerald-200/60"
          )}>
            <div className="h-full w-full rounded-3xl bg-white/20 backdrop-blur-sm" />
          </div>

          <div className="relative p-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-10">
              <div className="flex items-center gap-6">
                {/* Enhanced Icon */}
                <div className="relative group">
                  <div className={cn(
                    "absolute inset-0 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl",
                    isPro && "bg-gradient-to-br from-purple-500/30 to-violet-500/30",
                    isCanceling && "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
                    !isPro && !isCanceling && "bg-gradient-to-br from-teal-500/30 to-emerald-500/30"
                  )} />
                  <div className={cn(
                    "relative h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                    isPro && "bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/25",
                    isCanceling && "bg-gradient-to-br from-amber-500/80 to-orange-500/80 shadow-lg shadow-amber-500/25",
                    !isPro && !isCanceling && "bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/25"
                  )}>
                    {isPro ? (
                      <Crown className="h-8 w-8 text-white drop-shadow-sm" />
                    ) : isCanceling ? (
                      <Clock className="h-8 w-8 text-white drop-shadow-sm" />
                    ) : (
                      <Rocket className="h-8 w-8 text-white drop-shadow-sm" />
                    )}
                  </div>
                </div>

                {/* Title and Description */}
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">
                    <span className={cn(
                      "bg-clip-text text-transparent bg-gradient-to-r",
                      isPro && "from-purple-600 via-violet-600 to-indigo-600",
                      isCanceling && "from-amber-600 via-orange-600 to-red-600",
                      !isPro && !isCanceling && "from-teal-600 via-emerald-600 to-cyan-600"
                    )}>
                      {isPro ? 'Pro Plan Active' : isCanceling ? 'Pro Access Ending Soon' : 'Free Plan Active'}
                    </span>
                  </h2>
                  <p className="text-lg text-slate-600 leading-relaxed max-w-md">
                    {isCanceling ? (
                      <>You have <span className="font-semibold text-amber-700">{daysRemaining} days</span> of Pro access remaining</>
                    ) : (
                      isPro ? 'Enjoying unlimited access to all features' : 'Start building your perfect resume today'
                    )}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                <Button
                  onClick={handlePortalSession}
                  disabled={isLoading}
                  size="lg"
                  className={cn(
                    "px-8 py-3 text-white font-medium rounded-2xl border-0 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl group relative overflow-hidden",
                    isPro && "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-violet-500/25 hover:shadow-violet-500/40",
                    isCanceling && "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-500/25 hover:shadow-amber-500/40",
                    !isPro && !isCanceling && "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-teal-500/25 hover:shadow-teal-500/40"
                  )}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        {isPro ? 'Manage Subscription' : isCanceling ? 'Reactivate Pro' : 'Upgrade to Pro'}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Button>
              </div>
            </div>

            {/* Enhanced Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                isPro ? [
                  { icon: Crown, text: "Premium Features", desc: "Full access unlocked" },
                  { icon: Shield, text: "Priority Support", desc: "24/7 assistance" },
                  { icon: Sparkles, text: "Exclusive Templates", desc: "Designer quality" }
                ] : isCanceling ? [
                  { icon: Star, text: "Premium Features Ending", desc: "Download your content" },
                  { icon: Clock, text: `${daysRemaining} Days Left`, desc: "Reactivate anytime" },
                  { icon: Zap, text: "Download Your Content", desc: "Keep your progress" }
                ] : [
                  { icon: Rocket, text: "Quick Start", desc: "Get started instantly" },
                  { icon: Sparkles, text: "Basic Features", desc: "Essential tools included" },
                  { icon: CheckCircle, text: "Standard Templates", desc: "Professional designs" }
                ]
              ][0].map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    "group p-6 rounded-2xl backdrop-blur-sm border transition-all duration-500 hover:scale-105 hover:-translate-y-1 cursor-default",
                    isPro && "bg-white/60 border-purple-100/60 hover:border-purple-200/80 hover:bg-white/80 hover:shadow-lg hover:shadow-purple-500/10",
                    isCanceling && "bg-white/60 border-amber-100/60 hover:border-amber-200/80 hover:bg-white/80 hover:shadow-lg hover:shadow-amber-500/10",
                    !isPro && !isCanceling && "bg-white/60 border-teal-100/60 hover:border-teal-200/80 hover:bg-white/80 hover:shadow-lg hover:shadow-teal-500/10"
                  )}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={cn(
                      "p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
                      isPro && "bg-gradient-to-br from-purple-100 to-violet-100 group-hover:from-purple-200 group-hover:to-violet-200",
                      isCanceling && "bg-gradient-to-br from-amber-100 to-orange-100 group-hover:from-amber-200 group-hover:to-orange-200",
                      !isPro && !isCanceling && "bg-gradient-to-br from-teal-100 to-emerald-100 group-hover:from-teal-200 group-hover:to-emerald-200"
                    )}>
                      <item.icon className={cn(
                        "h-6 w-6 transition-colors duration-300",
                        isPro && "text-purple-600 group-hover:text-purple-700",
                        isCanceling && "text-amber-600 group-hover:text-amber-700",
                        !isPro && !isCanceling && "text-teal-600 group-hover:text-teal-700"
                      )} />
                    </div>
                                         <div className="space-y-1">
                       <p className={cn(
                         "font-semibold transition-colors duration-300",
                         isPro && "text-white group-hover:text-white/90",
                         isCanceling && "text-amber-900 group-hover:text-amber-800",
                         !isPro && !isCanceling && "text-teal-900 group-hover:text-teal-800"
                       )}>{item.text}</p>
                       <p className={cn(
                         "text-sm transition-colors duration-300",
                         isPro && "text-white/80 group-hover:text-white/70",
                         (isCanceling || (!isPro && !isCanceling)) && "text-slate-500 group-hover:text-slate-600"
                       )}>{item.desc}</p>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 relative">
        {plans.map((plan, index) => (
          <div
            key={plan.title}
            className={cn(
              "relative transition-all duration-700",
              plan.title === 'Pro' && "md:-mt-6 md:mb-6"
            )}
            style={{ 
              animationDelay: `${index * 150}ms`,
              animation: 'fadeInUp 0.8s ease-out forwards'
            }}
          >
            {plan.title === 'Pro' && (
              <>
                {/* Enhanced Pro Badge */}
                <div className="absolute -top-8 left-0 right-0 mx-auto w-40 z-20">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 text-white px-6 py-2 rounded-full text-sm font-semibold text-center shadow-2xl shadow-purple-500/25 border border-white/20">
                      <span className="flex items-center justify-center gap-2">
                        <Star className="h-4 w-4" />
                        Most Popular
                      </span>
                    </div>
                  </div>
                </div>
                {/* Enhanced Glow Effect */}
                <div className="absolute -inset-[3px] bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-3xl opacity-20 blur-2xl transition-opacity duration-500 hover:opacity-30" />
                <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/50 via-violet-500/50 to-indigo-500/50 rounded-3xl" />
              </>
            )}
            <PricingCard
              plan={plan}
              isCurrentPlan={plan.title.toLowerCase() === subscription_plan?.toLowerCase()}
              isLoading={isCheckingOut}
              onAction={handleCheckout}
              buttonText={plan.title.toLowerCase() === subscription_plan?.toLowerCase() ? 'Current Plan' : undefined}
              variant={isPro ? 'pro' : isCanceling ? 'canceling' : 'default'}
              className={cn(
                "relative transition-all duration-700 hover:shadow-2xl",
                plan.title === 'Pro' && [
                  "scale-105 shadow-2xl shadow-purple-500/10",
                  "hover:scale-[1.08] hover:shadow-3xl hover:shadow-purple-500/20"
                ]
              )}
            />
          </div>
        ))}
      </div>

      {/* Add keyframes for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
} 