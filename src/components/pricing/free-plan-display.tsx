'use client';

import { useRouter } from 'next/navigation';
import { PricingCard, type Plan } from './pricing-card';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Sparkles, Rocket, Zap } from 'lucide-react';
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

interface FreePlanDisplayProps {
  initialProfile: {
    subscription_plan: string | null;
    subscription_status: string | null;
  } | null;
}

export function FreePlanDisplay({ initialProfile }: FreePlanDisplayProps) {
  const router = useRouter();
  const subscriptionPlan = initialProfile?.subscription_plan?.toLowerCase() || 'free';

  const handleCheckout = async (plan: Plan) => {
    if (!plan.priceId) return;
    
    router.push(`/subscription/checkout?price_id=${plan.priceId}`);
  };

  return (
    <div className="container mx-auto px-4 py-16 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -right-[25%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-teal-500/10 to-emerald-500/10 blur-3xl animate-[move_8s_ease-in-out_infinite]" />
        <div className="absolute -bottom-[40%] -left-[25%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-3xl animate-[move_9s_ease-in-out_infinite]" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="max-w-5xl mx-auto p-12 text-center rounded-3xl border border-teal-200/50 bg-gradient-to-br from-teal-50/80 to-emerald-50/80 backdrop-blur-xl mb-16 relative overflow-hidden shadow-2xl">
          {/* Subtle animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-400/5 to-emerald-400/5 animate-gradient" />
          
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
                className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center transform hover:rotate-12 transition-transform duration-300"
              >
                <Rocket className="h-8 w-8 text-white" />
              </motion.div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold">
                <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  Start Your Journey
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Begin crafting your perfect resume with our powerful AI-assisted tools
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { 
                  icon: Rocket,
                  text: "Quick Start",
                  subtext: "Create your first resume in minutes"
                },
                { 
                  icon: Sparkles,
                  text: "AI Assistance",
                  subtext: "Smart suggestions and improvements"
                },
                { 
                  icon: Zap,
                  text: "Instant Results",
                  subtext: "See changes in real-time"
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="group p-4 rounded-xl bg-white/40 backdrop-blur-sm border border-teal-100 hover:border-teal-200 hover:bg-white/60 transition-all duration-300"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative">
                      <item.icon className="h-6 w-6 text-teal-600 mx-auto mb-2 transform group-hover:scale-110 transition-transform duration-300" />
                      <p className="text-sm font-medium text-teal-900">{item.text}</p>
                      <p className="text-xs text-teal-600/80 mt-1">{item.subtext}</p>
                    </div>
                  </div>
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
                <div className="absolute -inset-[2px] bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 rounded-2xl opacity-75 blur-lg group-hover:opacity-100 animate-pulse transition-opacity duration-500" />
                <div className="absolute -inset-[1px] bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 rounded-2xl" />
                {/* Pro badge */}
                <div className="absolute -top-6 left-0 right-0 mx-auto w-32 z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-full blur-md" />
                    <div className="relative bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium text-center shadow-lg">
                      Upgrade Now
                    </div>
                  </div>
                </div>
              </>
            )}
            <PricingCard
              key={plan.title}
              plan={plan}
              isCurrentPlan={plan.title.toLowerCase() === subscriptionPlan}
              onAction={handleCheckout}
              variant={plan.title === 'Pro' ? 'pro' : 'default'}
              className={cn(
                "relative",
                plan.title === 'Pro' && [
                  "scale-105 shadow-2xl",
                  "hover:scale-[1.07] hover:shadow-3xl hover:shadow-teal-500/20",
                  "transition-all duration-500"
                ]
              )}
              isLoading={false}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
} 