'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Clock, 
  TrendingUp,
  Crown,
  Zap,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { createPortalSession } from '@/app/(dashboard)/subscription/stripe-session';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getSubscriptionAccessState, type SubscriptionSnapshot } from '@/lib/subscription-access';
import { PLAN_CONFIG } from '@/lib/plans';

interface Profile extends SubscriptionSnapshot {
  subscription_plan: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

interface OptimizedSubscriptionPageProps {
  initialProfile: Profile | null;
}

export function OptimizedSubscriptionPage({ initialProfile }: OptimizedSubscriptionPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const subscriptionAccessState = getSubscriptionAccessState(initialProfile);
  const {
    hasProAccess,
    isPastDue,
    isCanceling,
    isExpiredProAccess,
    daysRemaining,
    currentPeriodEndLabel,
  } = subscriptionAccessState;
  const paymentFailureCount = initialProfile?.payment_failure_count ?? 0;
  const nextPaymentAttemptLabel = initialProfile?.next_payment_attempt_at
    ? new Date(initialProfile.next_payment_attempt_at).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  const handleUpgrade = async () => {
    if (hasProAccess) {
      // Handle portal session for existing pro users
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
    } else {
      // Handle checkout for free users
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
      if (priceId) {
        router.push(`/subscription/checkout?price_id=${priceId}&trial=true`);
      }
    }
  };

  const endDate = currentPeriodEndLabel;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl pb-24">
        {/* Header Section - State Aware */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          {isCanceling ? (
            <>
              <div className="flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-amber-500 mr-3" />
                <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                  {daysRemaining} days remaining
                </Badge>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Don&apos;t lose your competitive edge
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {endDate
                  ? `Your Pro access ends on ${endDate}. Keep the momentum going and continue landing interviews.`
                  : "Your Pro access is ending soon. Keep the momentum going and continue landing interviews."}
              </p>
            </>
          ) : isExpiredProAccess ? (
            <>
              <div className="flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-rose-500 mr-3" />
                <Badge variant="outline" className="text-rose-700 border-rose-300 bg-rose-50">
                  Access expired
                </Badge>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Your Pro access has expired
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {endDate
                  ? `Your previous Pro access ended on ${endDate}. Upgrade to unlock premium features again.`
                  : "Your previous Pro access has ended. Upgrade to unlock premium features again."}
              </p>
            </>
          ) : isPastDue ? (
            <>
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-amber-500 mr-3" />
                <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                  Payment needs attention
                </Badge>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Keep your Pro access active
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We couldn&apos;t collect your latest payment. Stripe will retry automatically, and you can update your payment method now.
              </p>
            </>
          ) : hasProAccess ? (
            <>
              <div className="flex items-center justify-center mb-4">
                <Crown className="h-8 w-8 text-purple-500 mr-3" />
                <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                  Pro Member
                </Badge>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                You&apos;re maximizing your career potential
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Continue leveraging premium AI tools to stay ahead in your job search.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
                <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                  Pro plan features
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Ready to land your dream job?
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join thousands of professionals who&apos;ve upgraded their careers with ResumeLM Pro.
              </p>
            </>
          )}
        </motion.div>

        {isPastDue && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-950"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
              <div className="flex-1">
                <h2 className="font-semibold">Payment recovery is in progress</h2>
                <p className="mt-1 text-sm text-amber-800">
                  Your Pro features remain available while Stripe retries the payment. Update your payment method to avoid an interruption.
                  {paymentFailureCount > 0 && ` Attempt ${paymentFailureCount} has failed.`}
                  {nextPaymentAttemptLabel && ` The next retry is scheduled for ${nextPaymentAttemptLabel}.`}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Product facts */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center mb-8 text-sm text-gray-600"
        >
          <span>Open source • $20/month • App-funded premium AI models</span>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Value Proposition */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            {/* Key Benefits */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {hasProAccess ? "Your Pro Benefits" : "What you get with Pro"}
              </h2>
              
              <div className="grid gap-4">
                {[
                  {
                    icon: Zap,
                    title: "App-funded premium models",
                    description: "Use Pro models without entering your own provider key",
                    highlight: true
                  },
                  {
                    icon: TrendingUp, 
                    title: "Unlimited resume versions",
                    description: "Create and tailor as many versions as you need",
                    highlight: true
                  },
                  {
                    icon: Crown,
                    title: "Advanced AI assistance",
                    description: "Get contextual suggestions while you edit"
                  }
                ].map((benefit, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "flex items-start space-x-4 p-4 rounded-lg transition-colors",
                      benefit.highlight ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      benefit.highlight ? "bg-blue-100" : "bg-gray-100"
                    )}>
                      <benefit.icon className={cn(
                        "h-5 w-5",
                        benefit.highlight ? "text-blue-600" : "text-gray-600"
                      )} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{benefit.title}</h3>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>

          {/* Right Column - Pricing & CTA */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Pricing Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg relative overflow-hidden">
              {!hasProAccess && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
              )}
              
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">ResumeLM Pro</h3>
                  {!hasProAccess && (
                    <Badge className="ml-3 bg-blue-100 text-blue-700">Most Popular</Badge>
                  )}
                </div>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$20</span>
                  <span className="text-gray-600">/month</span>
                </div>
                
                {!hasProAccess && (
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>✓ Seven-day trial</p>
                    <p>✓ Cancel before the trial ends to avoid the recurring charge</p>
                  </div>
                )}
              </div>

              {/* Feature List */}
              <div className="space-y-3 mb-8">
                {PLAN_CONFIG.pro.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleUpgrade}
                disabled={isLoading}
                className={cn(
                  "w-full py-6 text-lg font-semibold rounded-xl transition-all duration-300",
                  hasProAccess
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : hasProAccess ? (
                  isPastDue ? "Fix payment method" : "Manage Subscription"
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Start Pro trial</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>

              {!hasProAccess && (
                <p className="text-center text-xs text-gray-500 mt-4">
                  Cancel anytime • No hidden fees • Instant access
                </p>
              )}
            </div>


          </motion.div>
        </div>
      </div>
    </div>
  );
} 
