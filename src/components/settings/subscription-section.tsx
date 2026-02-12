'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Star, Clock, Zap, ArrowRight, Crown, Shield, Check, Users, TrendingUp } from "lucide-react"
import { cn } from '@/lib/utils';
import { createPortalSession } from '@/app/(dashboard)/subscription/stripe-session';
import { getSubscriptionAccessState, type SubscriptionSnapshot } from '@/lib/subscription-access';

interface SubscriptionSectionProps {
  initialProfile: SubscriptionSnapshot | null;
}

export function SubscriptionSection({ initialProfile }: SubscriptionSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const subscriptionAccessState = getSubscriptionAccessState(initialProfile);
  const {
    hasProAccess,
    isCanceling,
    isExpiredProAccess,
    isTrialing,
    daysRemaining,
    currentPeriodEndLabel,
    trialDaysRemaining,
    trialEndLabel,
  } = subscriptionAccessState;

  const handleSubscriptionAction = async () => {
    if (!hasProAccess) {
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
      if (priceId) {
        router.push(`/subscription/checkout?price_id=${priceId}`);
      }
      return;
    }

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

  const endDate = currentPeriodEndLabel;

  return (
    <div className="space-y-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-purple-400/5 to-pink-600/5 rounded-full blur-3xl" />
      </div>

      {/* Header Section - State Aware */}
      <div className="text-center space-y-4">
        {isCanceling ? (
          <>
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-amber-500 mr-2" />
              <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                {daysRemaining} days remaining
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Pro access ending soon
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              {endDate
                ? `Your Pro access ends on ${endDate}. Reactivate to keep your premium features.`
                : "Your Pro access is ending soon. Reactivate to keep your premium features."}
            </p>
          </>
        ) : isExpiredProAccess ? (
          <>
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-rose-500 mr-2" />
              <Badge variant="outline" className="text-rose-700 border-rose-300 bg-rose-50">
                Access expired
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Your Pro access has expired
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              {endDate
                ? `Your previous Pro access ended on ${endDate}. Upgrade to regain premium features.`
                : "Your previous Pro access has ended. Upgrade to regain premium features."}
            </p>
          </>
        ) : isTrialing ? (
          <>
            <div className="flex items-center justify-center mb-2">
              <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                {trialDaysRemaining > 0 ? `${trialDaysRemaining} days left in trial` : 'Trial ends today'}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Free trial active — Pro unlocked
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              Enjoy full Pro access during your trial. After {trialEndLabel || 'the trial'}, you&apos;ll continue on the Pro plan at $20/month unless you cancel in the billing portal.
            </p>
          </>
        ) : hasProAccess ? (
          <>
            <div className="flex items-center justify-center mb-2">
              <Crown className="h-6 w-6 text-purple-500 mr-2" />
              <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                Pro Member
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              You&apos;re on the Pro plan
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              Enjoying unlimited access to all premium features and priority support.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-blue-500 mr-2" />
              <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                3x Higher Interview Rate
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Upgrade to ResumeLM Pro
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              Join thousands of professionals landing more interviews with premium AI assistance.
            </p>
          </>
        )}
      </div>

      {/* Social Proof */}
      <div className="flex items-center justify-center text-sm text-gray-600">
        <Users className="h-4 w-4 mr-2" />
        <span>Trusted by 12,000+ professionals</span>
        <div className="flex ml-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
          ))}
        </div>
        <span className="ml-1">4.9/5</span>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Benefits */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {hasProAccess ? "Your Pro Benefits" : "What you get with Pro"}
          </h3>
          
          <div className="space-y-3">
            {[
              {
                icon: Zap,
                title: "3x faster applications",
                description: "AI-powered tailoring saves hours",
                highlight: true
              },
              {
                icon: TrendingUp, 
                title: "Higher response rates",
                description: "300% increase in interviews",
                highlight: true
              },
              {
                icon: Crown,
                title: "Unlimited everything",
                description: "No limits on resumes or AI"
              },
              {
                icon: Sparkles,
                title: "Premium templates",
                description: "ATS-optimized designs"
              }
            ].map((benefit, index) => (
              <div 
                key={index}
                className={cn(
                  "flex items-start space-x-3 p-3 rounded-lg transition-colors",
                  benefit.highlight ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg flex-shrink-0",
                  benefit.highlight ? "bg-blue-100" : "bg-gray-100"
                )}>
                  <benefit.icon className={cn(
                    "h-4 w-4",
                    benefit.highlight ? "text-blue-600" : "text-gray-600"
                  )} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{benefit.title}</h4>
                  <p className="text-xs text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Pricing */}
      <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative overflow-hidden">
            {!hasProAccess && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
            )}
            
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-2">
                <h4 className="text-xl font-bold text-gray-900">ResumeLM Pro</h4>
                {!hasProAccess && (
                  <Badge className="ml-2 bg-blue-100 text-blue-700 text-xs">Most Popular</Badge>
                )}
              </div>
              
              <div className="mb-3">
                <span className="text-3xl font-bold text-gray-900">$20</span>
                <span className="text-gray-600">/month</span>
              </div>
              
              {!hasProAccess && (
                <div className="space-y-1 text-xs text-gray-600">
                  <p>💰 Pays for itself with one interview</p>
                  <p>💼 Compare: Resume writers charge $260+</p>
                </div>
              )}
            </div>

            {/* Feature List */}
            <div className="space-y-2 mb-6">
              {[
                "Unlimited base resumes",
                "Unlimited AI-tailored resumes", 
                "Advanced AI assistance",
                "Premium ATS templates",
                "Priority support"
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Risk Reduction */}
            {!hasProAccess && (
              <div className="flex items-center justify-center space-x-2 mb-4 p-2 bg-green-50 rounded-lg border border-green-200">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-xs text-green-700 font-medium">
                  30-day money-back guarantee
                </span>
              </div>
            )}

            {/* CTA Button */}
            <Button
              onClick={handleSubscriptionAction}
              disabled={isLoading}
              className={cn(
                "w-full py-3 font-semibold rounded-lg transition-all duration-300",
                hasProAccess
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
              )}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : hasProAccess ? (
                isTrialing ? "Manage trial / billing" : "Manage Subscription"
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Upgrade to Pro</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>

            {!hasProAccess && (
              <p className="text-center text-xs text-gray-500 mt-3">
                Cancel anytime • No hidden fees
              </p>
            )}
          </div>

          {/* Additional CTA for canceling users */}
        </div>
      </div>
    </div>
  );
} 
