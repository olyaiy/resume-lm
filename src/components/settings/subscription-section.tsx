'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Star, Clock, Zap, ArrowRight, Crown, Shield, Check, Users, TrendingUp } from "lucide-react"
import { cn } from '@/lib/utils';
import { createPortalSession } from '@/app/(dashboard)/subscription/stripe-session';
import { getSubscriptionStatus } from '@/utils/actions/stripe/actions';

interface Profile {
  subscription_plan: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export function SubscriptionSection() {
  const [isLoading, setIsLoading] = useState(false);
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

  // Calculate days remaining for canceling plan
  const daysRemaining = current_period_end
    ? Math.max(0, Math.ceil((new Date(current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const endDate = current_period_end 
    ? new Date(current_period_end).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      })
    : null;

  if (isLoadingProfile) {
    return (
      <div className="space-y-6 relative min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl animate-pulse" />
          <div className="space-y-2 text-center">
            <div className="h-6 w-48 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

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
              Your Pro access ends on {endDate}. Reactivate to keep your premium features.
            </p>
          </>
        ) : isPro ? (
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
            {isPro ? "Your Pro Benefits" : "What you get with Pro"}
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
            {!isPro && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
            )}
            
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-2">
                <h4 className="text-xl font-bold text-gray-900">ResumeLM Pro</h4>
                {!isPro && (
                  <Badge className="ml-2 bg-blue-100 text-blue-700 text-xs">Most Popular</Badge>
                )}
              </div>
              
              <div className="mb-3">
                <span className="text-3xl font-bold text-gray-900">$20</span>
                <span className="text-gray-600">/month</span>
              </div>
              
              {!isPro && (
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
            {!isPro && (
              <div className="flex items-center justify-center space-x-2 mb-4 p-2 bg-green-50 rounded-lg border border-green-200">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-xs text-green-700 font-medium">
                  30-day money-back guarantee
                </span>
              </div>
            )}

            {/* CTA Button */}
            <Button
              onClick={handlePortalSession}
              disabled={isLoading}
              className={cn(
                "w-full py-3 font-semibold rounded-lg transition-all duration-300",
                isPro
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
              )}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : isPro ? (
                "Manage Subscription"
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Upgrade to Pro</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>

            {!isPro && (
              <p className="text-center text-xs text-gray-500 mt-3">
                Cancel anytime • No hidden fees
              </p>
            )}
          </div>

          {/* Additional CTA for canceling users */}
          {isCanceling && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="text-center">
                <h5 className="font-semibold text-amber-900 mb-1 text-sm">Limited Time Offer</h5>
                <p className="text-xs text-amber-700 mb-3">
                  Reactivate now and get 2 months for the price of 1
                </p>
                <Button
                  onClick={handlePortalSession}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-sm py-2 px-4"
                >
                  Reactivate & Save 50%
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 