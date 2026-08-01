export const PLAN_CONFIG = {
  free: {
    name: "Free",
    price: "$0",
    description: "Open source resume building with your own API keys or free app-funded models",
    limits: {
      base: 2,
      tailored: 5,
    },
    features: [
      "Use your own API keys",
      "2 base resumes",
      "5 tailored resumes",
      "Self-host option available",
    ],
  },
  pro: {
    name: "Pro",
    price: "$20",
    period: "/month",
    description: "App-funded premium AI models and unlimited resume versions",
    features: [
      "Access to app-funded premium AI models",
      "Unlimited base resumes",
      "Unlimited tailored resumes",
      "Advanced AI assistance",
    ],
  },
} as const;

export type PlanName = keyof typeof PLAN_CONFIG;
