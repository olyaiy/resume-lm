import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthDialog } from "@/components/auth/auth-dialog";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: PricingFeature[];
  buttonText: string;
  gradient: string;
  popular?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out ResumeLM",
    gradient: "from-violet-600/80 to-indigo-600/80",
    features: [
      { text: "Access to basic AI models", included: true },
      { text: "2 base resumes", included: true },
      { text: "5 tailored resumes ", included: true },
    ],
    buttonText: "Get Started",
  },
  {
    name: "Pro",
    price: "$20",
    description: "Enhanced features for serious job seekers",
    gradient: "from-pink-600/80 to-rose-600/80",
    popular: true,
    features: [
      { text: "Access to all premium AI models", included: true },
      { text: "Unlimited base resumes", included: true },
      { text: "Unlimited tailored resumes", included: true },
      { text: "Support an independent student developer ❤️", included: true },
    ],
    buttonText: "Get Started",
  },
  {
    name: "BYOK",
    price: "$0",
    description: "For users with their own API keys",
    gradient: "from-teal-600/80 to-cyan-600/80",
    features: [
      { text: "Use your own API keys", included: true },
      { text: "2 base resumes", included: true },
      { text: "5 tailored resumes ", included: true },
    ],
    buttonText: "Get Started",
  },
];

export function PricingSection() {
  return (
    <section className="pb-16 px-4 sm:px-6 lg:px-8 relative ">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 w-full h-full  -z-10">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-violet-600/20 to-indigo-600/20 blur-3xl top-0 -left-32 animate-[move_8s_ease-in-out_infinite]" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-pink-600/20 to-rose-600/20 blur-3xl bottom-0 -right-32 animate-[move_9s_ease-in-out_infinite]" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-24">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent pb-3">
            Pricing
          </h2>
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-gradient-to-r from-violet-600/10 to-blue-600/10 border border-violet-600/20 shadow-lg shadow-violet-600/5">
                <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                ⭐️ ResumeLM is open source and free to self-host
                </span>
            </div>
            <p className="mt-3 inline-block text-sm text-muted-foreground hover:text-violet-600 transition-colors duration-300">
              I&apos;d love to make this app completely free, but AI costs add up quickly. Feel free to self-host using your own API keys, or choose from our plans below.
            </p>
          
        </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative rounded-2xl h-full transition-all duration-500",
                tier.popular && "scale-105 md:-mt-8 z-10"
              )}
            >
              {tier.popular && (
                <div className="absolute -top-6 left-0 right-0 mx-auto w-36 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 px-4 py-1.5 text-sm text-white text-center font-medium shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="h-full rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl p-10 relative overflow-hidden group hover:shadow-2xl hover:shadow-violet-600/10 hover:-translate-y-1 transition-all duration-500">
                {/* Background gradient effect */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-[0.08] -z-10 transition-opacity duration-500",
                  tier.gradient,
                  "group-hover:opacity-[0.12]"
                )} />

                <div className="mb-10">
                  <h3 className="text-2xl font-bold">{tier.name}</h3>
                  <div className="mt-5 flex items-baseline">
                    <span className={cn(
                      "text-6xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                      tier.gradient
                    )}>
                      {tier.price}
                    </span>
                    {tier.price !== "$0" && (
                      <span className="ml-2 text-muted-foreground">/month</span>
                    )}
                  </div>
                  <p className="mt-3 text-muted-foreground">{tier.description}</p>
                </div>

                <ul className="space-y-5 mb-10">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-4">
                      <div className={cn(
                        "rounded-full p-1 bg-gradient-to-r",
                        feature.included ? tier.gradient : "from-gray-200 to-gray-300"
                      )}>
                        <Check className={cn(
                          "h-4 w-4",
                          feature.included ? "text-white" : "text-gray-400"
                        )} />
                      </div>
                      <span className={cn(
                        "text-sm",
                        feature.included ? "text-foreground" : "text-muted-foreground/50"
                      )}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <AuthDialog>
                  <Button
                    className={cn(
                      "w-full bg-gradient-to-r text-white shadow-lg hover:shadow-xl transition-all duration-500 h-12 text-base",
                      tier.gradient
                    )}
                  >
                    {tier.buttonText}
                  </Button>
                </AuthDialog>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 