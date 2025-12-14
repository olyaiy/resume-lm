'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  CreditCard,
  Shield, 
  Crown,
  Star,
  Zap,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';
import { LogoutButton } from '@/components/auth/logout-button';

const features = [
  "Unlimited base resumes",
  "Unlimited AI-tailored resumes",
  "Advanced AI assistance with multiple models",
  "Premium ATS-optimized templates",
  "Cover letter generation",
  "Priority customer support"
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer at Google",
    content: "ResumeLM helped me land 3 interviews in my first week.",
    avatar: "SC"
  },
  {
    name: "Marcus Johnson",
    role: "Product Manager at Meta", 
    content: "Went from 2% to 15% response rate. Game changer!",
    avatar: "MJ"
  }
];

export default function StartTrialPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStartTrial = () => {
    setIsLoading(true);
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
    if (priceId) {
      router.push(`/subscription/checkout?price_id=${priceId}&trial=true`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-teal-400/15 to-cyan-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-purple-200/10 to-pink-200/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-purple-100/50 bg-white/50 backdrop-blur-sm">
        <Logo className="text-xl" />
        <LogoutButton />
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-purple-500" />
            <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 px-3 py-1">
              7-Day Free Trial
            </Badge>
            <Sparkles className="h-6 w-6 text-purple-500" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Start Building Your
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Perfect Resume</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Try ResumeLM Pro free for 7 days. Cancel anytime before your trial ends and you won&apos;t be charged.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* What you get */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-900">What you get with Pro</h2>
              </div>
              
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="space-y-3">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl border border-purple-100/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 mb-1">&ldquo;{testimonial.content}&rdquo;</p>
                      <p className="text-xs text-gray-500">
                        <strong>{testimonial.name}</strong> • {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rating */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <span>4.9/5 from 12,000+ users</span>
            </div>
          </motion.div>

          {/* Right Column - CTA Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white rounded-2xl border border-purple-200 p-8 shadow-xl relative overflow-hidden">
              {/* Gradient top bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500" />
              
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-purple-50 rounded-full px-4 py-2 mb-4">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">7-day free trial</span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">ResumeLM Pro</h3>
                
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-500">for 7 days</span>
                </div>
                
                <p className="text-sm text-gray-500">
                  Then $20/month • Cancel anytime
                </p>
              </div>

              {/* What happens */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <Zap className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Instant Pro Access</p>
                    <p className="text-xs text-green-600">Start building AI-powered resumes immediately</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Card Required</p>
                    <p className="text-xs text-blue-600">For seamless continuation if you love it</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <Shield className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-800">Cancel Anytime</p>
                    <p className="text-xs text-purple-600">No charge if you cancel before trial ends</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleStartTrial}
                disabled={isLoading}
                className={cn(
                  "w-full py-6 text-lg font-semibold rounded-xl transition-all duration-300",
                  "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
                  "text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Start Free Trial</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>

              <p className="text-center text-xs text-gray-500 mt-4">
                By starting your trial, you agree to our Terms of Service
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}


