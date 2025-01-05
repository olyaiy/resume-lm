import { Metadata } from "next";
import { MockResume } from "@/components/landing/mock-resume";
import { BenefitsList } from "@/components/landing/benefits-list";
import { ActionButtons } from "@/components/landing/action-buttons";
import { Logo } from "@/components/ui/logo";
import { PricingSection } from "@/components/landing/pricing-section";
import { ErrorDialog } from "@/components/auth/error-dialog";

export const metadata: Metadata = {
  title: "Login | ResumeLM - AI-Powered Resume Builder",
  description: "Create tailored, ATS-optimized resumes powered by AI. ResumeLM helps you land your dream tech job with personalized resume optimization.",
  keywords: ["resume builder", "AI resume", "ATS optimization", "tech jobs", "career tools", "job application"],
  authors: [{ name: "ResumeLM" }],
  openGraph: {
    title: "ResumeLM - AI-Powered Resume Builder",
    description: "Create tailored, ATS-optimized resumes powered by AI. Land your dream tech job with personalized resume optimization.",
    url: "https://resumelm.com/auth/login",
    siteName: "ResumeLM",
    images: [
      {
        url: "/og.webp",
        width: 1200,
        height: 630,
        alt: "ResumeLM - AI Resume Builder",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeLM - AI-Powered Resume Builder",
    description: "Create tailored, ATS-optimized resumes powered by AI. Land your dream tech job with personalized resume optimization.",
    images: ["/og.webp"],
    creator: "@resumelm",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code", // Replace with actual verification code
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const showErrorDialog = params?.error === 'email_confirmation';

  return (
    <main className="relative overflow-hidden selection:bg-violet-200/50">
      {/* Error Dialog */}
      <ErrorDialog isOpen={!!showErrorDialog} />

      {/* Enhanced Gradient Background Elements */}
      <div className="fixed inset-0 z-0">
        {/* Primary gradient mesh with improved colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/60 via-blue-50/60 to-indigo-50/60 animate-gradient-slow" />
        
        {/* Enhanced animated gradient orbs with better positioning and animations - mobile optimized */}
        <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gradient-to-r from-violet-200/30 to-blue-200/30 rounded-full blur-3xl animate-float-slow opacity-80 mix-blend-multiply" />
        <div className="absolute bottom-1/3 right-1/4 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-gradient-to-r from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl animate-float-delayed opacity-80 mix-blend-multiply" />
        <div className="absolute top-1/2 right-1/3 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-gradient-to-r from-indigo-200/30 to-violet-200/30 rounded-full blur-3xl animate-float opacity-80 mix-blend-multiply" />
        
        {/* Enhanced mesh grid overlay with subtle animation */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] animate-mesh-slow" />
      </div>

      {/* Enhanced Navigation with backdrop blur and border */}
      <nav className="relative z-10 border-b border-white/40 backdrop-blur-xl bg-white/15 shadow-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14">
            <Logo />
          </div>
        </div>
      </nav>

      {/* Enhanced Content with better spacing and animations */}
      <div className="relative z-10">
        {/* Hero Section with Split Layout */}
        <div className="mb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 py-8 lg:py-16">
            {/* Left Column - Content */}
            <div className="flex flex-col gap-6 lg:gap-10 lg:pr-12">
              <div className="space-y-6 lg:space-y-8">
                <div className="space-y-3 lg:space-y-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                    <span className="inline-block bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent animate-gradient-x pb-2">
                      Open Source, AI Resume Builder
                    </span>
                    <br />
                    <span className="inline-block bg-gradient-to-r from-violet-500/90 via-blue-500/90 to-violet-500/90 bg-clip-text text-transparent animate-gradient-x relative">
                      that lands you tech jobs
                      <div className="absolute -bottom-2 left-0 w-16 sm:w-24 h-1 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full" />
                    </span>
                  </h1>
                  
                  <p className="text-lg sm:text-xl text-muted-foreground/90 leading-relaxed max-w-2xl font-medium">
                    Create tailored, ATS-optimized resumes powered by AI.
                  </p>
                </div>

                <BenefitsList />
              </div>
              
              <ActionButtons />
            </div>

            {/* Right Column - Floating Resume Preview */}
            <div className="relative mt-8 lg:mt-0">
              {/* Mobile-only single resume view */}
              <div className="block lg:hidden">
                <div className="relative w-full max-w-[min(85vw,_6in)] mx-auto">
                  <MockResume />
                </div>
              </div>

              {/* Desktop stacked resume view */}
              <div className="relative hidden lg:block">
                {/* Decorative Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5 rounded-3xl transform rotate-3 scale-105" />
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5 rounded-3xl transform -rotate-3 scale-105" />
                
                {/* Stacked Resume Previews */}
                <div className="relative">
                  {/* Background Resume - Third Layer */}
                  <div className="absolute -right-12 top-4 opacity-60 blur-[1px] scale-[0.97] rotate-[-8deg] origin-bottom-right">
                    <MockResume />
                  </div>
                  
                  {/* Middle Resume - Second Layer */}
                  <div className="absolute -right-6 top-2 opacity-80 blur-[0.5px] scale-[0.985] rotate-[-4deg] origin-bottom-right">
                    <MockResume />
                  </div>
                  
                  {/* Front Resume - Main Layer */}
                  <div className="relative">
                    <MockResume />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <PricingSection />
      </div>
    </main>
  );
}
  