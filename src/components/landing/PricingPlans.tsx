"use client"

import { useMemo, useRef } from "react";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

interface PlanFeature {
  text: string;
  highlight?: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  badge?: string;
  popular?: boolean;
  features: PlanFeature[];
  ctaText: string;
  ctaLink: string;
  ctaSecondary?: boolean;
}

export function PricingPlans() {
  // Refs for intersection observer
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  // Define pricing plans data for easier maintenance
  const plans = useMemo<PricingPlan[]>(() => [
    {
      name: "Free",
      price: "$0",
      description: "Self-host or use with your own API keys",
      features: [
        { text: "Use your own API keys" },
        { text: "2 base resumes" },
        { text: "5 tailored resumes" },
        { text: "Self-host option available" },
      ],
      ctaText: "Get Started",
      ctaLink: "/auth/register",
      ctaSecondary: true,
    },
    {
      name: "Pro",
      price: "$20",
      period: "/month",
      description: "Enhanced features for serious job seekers",
      badge: "Most Popular",
      popular: true,
      features: [
        { text: "Access to all premium AI models", highlight: true },
        { text: "Unlimited base resumes", highlight: true },
        { text: "Unlimited tailored resumes", highlight: true },
        { text: "Support an independent student developer ❤️" },
      ],
      ctaText: "Get Started",
      ctaLink: "/auth/register",
    }
  ], []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  // Component for plan features with consistent styling
  const FeatureItem = ({ feature }: { feature: PlanFeature }) => (
    <div className="flex items-start">
      <Check className={`h-5 w-5 ${feature.highlight ? "text-indigo-600" : "text-purple-600"} mr-3 mt-0.5 flex-shrink-0`} />
      <span className={feature.highlight ? "font-medium" : ""}>{feature.text}</span>
    </div>
  );

  return (
    <section 
      ref={sectionRef}
      className="py-24 md:py-32 px-4 relative overflow-hidden scroll-mt-20" 
      id="pricing"
      aria-labelledby="pricing-heading"
    >
      {/* Background decoration elements with reduced opacity for better performance */}
      <div aria-hidden="true" className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-200/20 to-indigo-200/20 blur-3xl"></div>
      <div aria-hidden="true" className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-tr from-teal-200/20 to-cyan-200/20 blur-3xl"></div>
      <div aria-hidden="true" className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-pink-200/15 to-rose-200/15 blur-3xl"></div>
      
      {/* Heading */}
      <div className="relative z-10 max-w-3xl mx-auto text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center gap-3 mb-4"
        >
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-teal-600/10 to-cyan-600/10 border border-teal-200/40 text-sm text-teal-700">
            Simple Pricing
          </span>
        </motion.div>
        
        <motion.h2
          id="pricing-heading"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold tracking-tight"
        >
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Choose Your Plan
          </span>
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground mt-4 max-w-2xl mx-auto"
        >
          Select the perfect plan for your needs with transparent pricing and no hidden fees
        </motion.p>
      </div>
      
      {/* Pricing Cards Grid */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            variants={itemVariants}
            className={`
              group relative rounded-2xl p-8 md:p-10 transition-all duration-500 hover:-translate-y-1 overflow-hidden
              ${plan.popular 
                ? "bg-gradient-to-br from-purple-600/5 to-indigo-600/5 backdrop-blur-md border border-purple-200/40 shadow-xl hover:shadow-2xl" 
                : "bg-white/40 backdrop-blur-md border border-white/40 shadow-xl hover:shadow-2xl"
              }
            `}
            aria-label={`${plan.name} plan for ${plan.price}${plan.period || ""}`}
          >
            {/* Decorative elements */}
            <div aria-hidden="true" className={`absolute ${index === 0 ? "-right-20 -bottom-20" : "-left-20 -top-20"} w-40 h-40 rounded-full bg-gradient-to-br from-purple-600/5 to-indigo-600/5 blur-2xl will-change-transform`}></div>
            
            {/* Popular plan indicator */}
            {plan.popular && (
              <>
                <div aria-hidden="true" className="absolute right-0 top-0 w-full h-1 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-300/40 text-xs font-medium text-purple-700 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>{plan.badge}</span>
                </div>
              </>
            )}
            
            {/* Plan name badge */}
            <div className="px-3 py-1 w-fit rounded-full bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border border-purple-200/40 text-sm text-purple-700 mb-4">
              {plan.name}
            </div>
            
            {/* Price display */}
            <div className="flex items-baseline">
              <h3 className="text-4xl font-bold">
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {plan.price}
                </span>
              </h3>
              {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
            </div>
            
            <p className="text-muted-foreground mt-2 mb-6">{plan.description}</p>
            
            {/* CTA button */}
            <Link 
              href={plan.ctaLink} 
              className={`
                block w-full py-3 rounded-lg font-medium text-center transition-all duration-300 hover:-translate-y-1 mb-8
                ${plan.ctaSecondary 
                  ? "bg-white/60 border border-purple-200/40 hover:shadow-md" 
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl"
                }
              `}
              aria-label={`${plan.ctaText} with the ${plan.name} plan`}
            >
              {plan.ctaSecondary ? (
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {plan.ctaText}
                </span>
              ) : plan.ctaText}
            </Link>
            
            {/* Features list */}
            <div className="space-y-3">
              {plan.features.map((feature, i) => (
                <FeatureItem key={i} feature={feature} />
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default PricingPlans; 