import { Background } from "@/components/landing/Background";
import FeatureHighlights from "@/components/landing/FeatureHighlights";
import { Hero } from "@/components/landing/Hero";
import { PricingPlans } from "@/components/landing/PricingPlans";
import { VideoShowcase } from "@/components/landing/VideoShowcase";
import { CreatorStory } from "@/components/landing/creator-story";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/layout/footer";
import { NavLinks } from "@/components/layout/nav-links";
import { Logo } from "@/components/ui/logo";
import { Metadata } from "next";
import Script from "next/script";
import { toSafeJsonScript } from "@/lib/html-safety";
import { AuthDialogProvider } from "@/components/auth/auth-dialog-provider";
import { siteUrl } from "@/lib/site-config";

// Page-specific metadata that extends the base metadata from layout.tsx
export const metadata: Metadata = {
  title: "ResumeLM - AI Resume Builder for Tech Jobs",
  description: "Create and tailor tech resumes with an open-source AI resume builder.",
  openGraph: {
    title: "ResumeLM - AI Resume Builder for Tech Jobs",
    description: "Create and tailor tech resumes with an open-source AI resume builder.",
    url: siteUrl(),
  },
  twitter: {
    title: "ResumeLM - AI Resume Builder for Tech Jobs",
    description: "Create and tailor tech resumes with an open-source AI resume builder.",
  },
};

export default function Page() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ResumeLM",
    "applicationCategory": "BusinessApplication",
    "offers": [
      {
        "@type": "Offer",
        "name": "Free plan",
        "price": "0",
        "priceCurrency": "USD"
      },
      {
        "@type": "Offer",
        "name": "Pro plan",
        "price": "20",
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "20",
          "priceCurrency": "USD",
          "unitText": "MONTH"
        }
      }
    ],
    "description": "Create and tailor tech resumes with an open-source AI resume builder.",
    "operatingSystem": "Web",
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
            <Logo href="/" />
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
