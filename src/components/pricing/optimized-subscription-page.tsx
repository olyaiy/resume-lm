'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Clock, 
  Users, 
  TrendingUp, 
  Shield, 
  Crown,
  Star,
  Zap,
  ArrowRight
} from 'lucide-react';
import { createPortalSession } from '@/app/(dashboard)/subscription/stripe-session';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Profile {
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

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer at Google",
    content: "ResumeLM helped me land 3 interviews in my first week. The AI suggestions were spot-on.",
    avatar: "SC"
  },
  {
    name: "Marcus Johnson", 
    role: "Product Manager at Meta",
    content: "Went from 2% to 15% response rate. This tool paid for itself with my first interview.",
    avatar: "MJ"
  },
  {
    name: "Emily Rodriguez",
    role: "Data Scientist at Microsoft", 
    content: "The tailored resumes feature is a game-changer. Got my dream job in 3 weeks.",
    avatar: "ER"
  }
];

export function OptimizedSubscriptionPage({ initialProfile }: OptimizedSubscriptionPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const isPro = initialProfile?.subscription_plan?.toLowerCase() === 'pro';
  const isCanceling = initialProfile?.subscription_status === 'canceled';

  const handleUpgrade = async () => {
    if (isPro) {
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
        router.push(`/subscription/checkout?price_id=${priceId}`);
      }
    }
  };

  // Calculate days remaining for canceling users
  const daysRemaining = initialProfile?.current_period_end
    ? Math.max(0, Math.ceil((new Date(initialProfile.current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const endDate = initialProfile?.current_period_end 
    ? new Date(initialProfile.current_period_end).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      })
    : null;

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
                Your Pro access ends on {endDate}. Keep the momentum going and continue landing interviews.
              </p>
            </>
          ) : isPro ? (
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
                  3x Higher Interview Rate
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

        {/* Social Proof Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center mb-8 text-sm text-gray-600"
        >
          <Users className="h-4 w-4 mr-2" />
          <span>Trusted by 12,000+ professionals</span>
          <div className="flex ml-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
            ))}
          </div>
          <span className="ml-2">4.9/5 rating</span>
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
                {isPro ? "Your Pro Benefits" : "What you get with Pro"}
              </h2>
              
              <div className="grid gap-4">
                {[
                  {
                    icon: Zap,
                    title: "3x faster job applications",
                    description: "AI-powered tailoring saves 15+ hours per week",
                    highlight: true
                  },
                  {
                    icon: TrendingUp, 
                    title: "Higher response rates",
                    description: "Members see 300% increase in interview invitations",
                    highlight: true
                  },
                  {
                    icon: Crown,
                    title: "Unlimited everything",
                    description: "No limits on resumes, tailoring, or AI assistance"
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

            {/* Testimonials */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Success Stories</h3>
              <div className="space-y-4">
                {testimonials.slice(0, 2).map((testimonial, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {testimonial.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 mb-1">&ldquo;{testimonial.content}&rdquo;</p>
                        <p className="text-xs text-gray-500">
                          <strong>{testimonial.name}</strong> • {testimonial.role}
                        </p>
                      </div>
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
              {!isPro && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
              )}
              
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">ResumeLM Pro</h3>
                  {!isPro && (
                    <Badge className="ml-3 bg-blue-100 text-blue-700">Most Popular</Badge>
                  )}
                </div>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$20</span>
                  <span className="text-gray-600">/month</span>
                </div>
                
                {!isPro && (
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>💰 <strong>Pays for itself</strong> with one interview</p>
                    <p>⏰ Less than one lunch per month</p>
                    <p>💼 Compare: Resume writers charge $260+</p>
                  </div>
                )}
              </div>

              {/* Feature List */}
              <div className="space-y-3 mb-8">
                {[
                  "Unlimited base resumes",
                  "Unlimited AI-tailored resumes", 
                  "Advanced AI assistance",
                  "Premium ATS-optimized templates",
                  "Priority customer support",
                  "Custom branding options"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Risk Reduction */}
              {!isPro && (
                <div className="flex items-center justify-center space-x-4 mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    30-day money-back guarantee
                  </span>
                </div>
              )}

              {/* CTA Button */}
              <Button
                onClick={handleUpgrade}
                disabled={isLoading}
                className={cn(
                  "w-full py-6 text-lg font-semibold rounded-xl transition-all duration-300",
                  isPro
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : isPro ? (
                  "Manage Subscription"
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Start Landing More Interviews</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>

              {!isPro && (
                <p className="text-center text-xs text-gray-500 mt-4">
                  Cancel anytime • No hidden fees • Instant access
                </p>
              )}
            </div>

            {/* Additional CTA for canceling users */}
            {isCanceling && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="text-center">
                  <h4 className="font-semibold text-amber-900 mb-2">Limited Time Offer</h4>
                  <p className="text-sm text-amber-700 mb-4">
                    Reactivate now and get 2 months for the price of 1
                  </p>
                  <Button
                    onClick={handleUpgrade}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Reactivate & Save 50%
                  </Button>
                </div>
              </div>
            )}


          </motion.div>
        </div>
      </div>
    </div>
  );
} 