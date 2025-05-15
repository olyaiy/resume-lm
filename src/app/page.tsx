import { Background } from "@/components/landing/Background";
import FeatureHighlights from "@/components/landing/FeatureHighlights";
import { Hero } from "@/components/landing/Hero";
import { PricingPlans } from "@/components/landing/PricingPlans";
import { VideoShowcase } from "@/components/landing/VideoShowcase";
import { CreatorStory } from "@/components/landing/creator-story";
import { NavLinks } from "@/components/layout/nav-links";
import { Logo } from "@/components/ui/logo";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Page() {
  // Check if user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // If user is authenticated, redirect to home page
  if (user) {
    redirect("/home");
  }
  
  return (
    <main className="relative overflow-x-hidden selection:bg-violet-200/50">

      {/* Enhanced Navigation with backdrop blur and border */}
      <nav className="border-b border-white/50 backdrop-blur-xl shadow-md fixed top-0 w-full bg-white/20 z-[1000] transition-all duration-500">
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
      <div className="relative z-10 min-h-[100vh] container mx-auto px-4 py-8 md:py-16 flex flex-col justify-center">
        {/* Hero Section */}
        <Hero />
      </div>
      
      {/* Video Showcase Section */}
      <VideoShowcase />
      
      {/* Feature Highlights Section */}
      <FeatureHighlights />
      
      {/* Creator Story Section */}
      <CreatorStory />
      
      {/* Pricing Plans Section */}
      <PricingPlans />
      
    </main>
  );
}