import dynamic from "next/dynamic";
import { Background } from "@/components/landing/Background";
import { Hero } from "@/components/landing/Hero";
import { Footer } from "@/components/layout/footer";
import { NavLinks } from "@/components/layout/nav-links";
import { Logo } from "@/components/ui/logo";
import { Metadata } from "next";
import Script from "next/script";
import { toSafeJsonScript } from "@/lib/html-safety";
import { AuthDialogProvider } from "@/components/auth/auth-dialog-provider";

// Lazy-load below-the-fold sections to reduce initial JS bundle
const VideoShowcase = dynamic(() =>
  import("@/components/landing/VideoShowcase").then((mod) => mod.VideoShowcase)
);
const FeatureHighlights = dynamic(
  () => import("@/components/landing/FeatureHighlights")
);
const CreatorStory = dynamic(() =>
  import("@/components/landing/creator-story").then((mod) => mod.CreatorStory)
);
const PricingPlans = dynamic(() =>
  import("@/components/landing/PricingPlans").then((mod) => mod.PricingPlans)
);
const FAQ = dynamic(() =>
  import("@/components/landing/FAQ").then((mod) => mod.FAQ)
);

// Page-specific metadata that extends the base metadata from layout.tsx
export const metadata: Metadata = {
  title: "ResumeLM - AI Resume Builder for Tech Jobs",
  description: "Create ATS-optimized tech resumes in under 10 minutes. 3x your interview chances with AI-powered resume tailoring.",
  openGraph: {
    title: "ResumeLM - AI Resume Builder for Tech Jobs",
    description: "Create ATS-optimized tech resumes in under 10 minutes. 3x your interview chances with AI-powered resume tailoring.",
    url: "https://resumelm.com",
  },
  twitter: {
    title: "ResumeLM - AI Resume Builder for Tech Jobs",
    description: "Create ATS-optimized tech resumes in under 10 minutes. 3x your interview chances with AI-powered resume tailoring.",
  },
};

export default function Page() {
  // Authenticated users are redirected to /home by middleware,
  // so this page only renders for unauthenticated visitors.

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ResumeLM",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Create ATS-optimized tech resumes in under 10 minutes. 3x your interview chances with AI-powered resume tailoring.",
    "operatingSystem": "Web",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "500"
    }
  };
  
  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <Script
        id="schema-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: toSafeJsonScript(structuredData)
        }}
      />

      <AuthDialogProvider>
        <main aria-label="ResumeLM landing page" className=" ">
          {/* Simplified Navigation */}
          <nav aria-label="Main navigation" className="border-b border-gray-200 fixed top-0 w-full bg-white/95 z-[1000] transition-all duration-300 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <Logo />
                <NavLinks />
              </div>
            </div>
          </nav>

          {/* Background component */}
          <Background />

          {/* Main content */}
          <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-24 flex flex-col justify-center">
            {/* Hero Section */}
            <Hero />
          </div>

          {/* Video Showcase Section */}
          <section id="product-demo">
            <VideoShowcase />
          </section>

          {/* Feature Highlights Section */}
          <section id="features" aria-labelledby="features-heading">
            <FeatureHighlights />
          </section>

          {/* Creator Story Section */}
          <section id="about" aria-labelledby="about-heading">
            <CreatorStory />
          </section>

          {/* Pricing Plans Section */}
          <section id="pricing" aria-labelledby="pricing-heading">
            <PricingPlans />
          </section>

          {/* FAQ Section */}
          <FAQ />

          <Footer variant="static" />
        </main>
      </AuthDialogProvider>
    </>
  );
}
