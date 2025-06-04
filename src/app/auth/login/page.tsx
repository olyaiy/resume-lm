import { Metadata } from "next";
import { MockResume } from "@/components/landing/mock-resume";
import { MockResumeMobile } from "@/components/landing/mock-resume-mobile";
import { BenefitsList } from "@/components/landing/benefits-list";
import { ActionButtons } from "@/components/landing/action-buttons";
import { Logo } from "@/components/ui/logo";
import { PricingSection } from "@/components/landing/pricing-section";
import { ErrorDialog } from "@/components/auth/error-dialog";
import { CreatorStory } from "@/components/landing/creator-story";
import { HowItWorks } from "@/components/landing/how-it-works";
import { HeroVideoSection } from "@/components/landing/hero-video-section";
import { Footer } from "@/components/layout/footer";
import { SplitContent } from "@/components/ui/split-content";
import { NavLinks } from "@/components/layout/nav-links";
import { ModelShowcase } from "@/components/landing/model-showcase";

// import { WaitlistSection } from "@/components/waitlist/waitlist-section";

export const metadata: Metadata = {
  title: "Login | ResumeLM - AI-Powered Resume Builder",
  description: "Create tailored, ATS-optimized resumes powered by AI. ResumeLM helps you land your dream tech job with personalized resume optimization.",
  keywords: ["resume builder", "AI resume", "ATS optimization", "tech jobs", "career tools", "job application"],
  authors: [{ name: "ResumeLM" }],
  openGraph: {
    title: "ResumeLM - AI-Powered Resume Builder",
    description: "Create tailored, ATS-optimized resumes powered by AI. Land your dream tech job with personalized resume optimization.",
    url: "https://resumelm.com//",
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
  // verification: {
  //   google: "google-site-verification-code", // Replace with actual verification code
  // },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const showErrorDialog = params?.error === 'email_confirmation' || params?.error === 'auth_code_missing';

  return (
    <>
      <main className="relative overflow-x-hidden selection:bg-violet-200/50 ">
        {/* Error Dialog */}
        <ErrorDialog isOpen={!!showErrorDialog} />

       

        {/* Enhanced Navigation with backdrop blur and border */}
        <nav className="border-b border-white/50 backdrop-blur-xl shadow-md fixed top-0 w-full bg-white/20 z-[1000] transition-all duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Logo />
              <NavLinks />
            </div>
          </div>
        </nav>

        {/* Enhanced Content with better spacing and animations */}
        <div className="relative z-10">
          
          {/* Hero Section with Split Layout */}
          <div className="mb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 py-12 lg:py-24 items-center">
              {/* Left Column - Content */}
              <div className="flex flex-col gap-8 lg:gap-12 lg:pr-12">
                <div className="space-y-8">
                  {/* GitHub Badge */}
                  <a
                    href="https://github.com/olyaiy/resume-ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full 
                      bg-gradient-to-r from-violet-500/15 via-blue-500/15 to-violet-500/15
                      hover:from-violet-500/25 hover:via-blue-500/25 hover:to-violet-500/25
                      border border-violet-300/30 hover:border-violet-400/40
                      backdrop-blur-xl shadow-lg shadow-violet-500/15
                      transition-all duration-500 hover:scale-105 hover:-translate-y-1 group
                      max-w-fit"
                  >
                    <svg
                      className="w-5 h-5 text-violet-600 group-hover:text-violet-700 transition-colors duration-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-semibold bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
                      Open Source on GitHub
                    </span>
                    <svg
                      className="w-4 h-4 text-violet-500 transition-all duration-300 transform group-hover:translate-x-1 group-hover:text-violet-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>

                  <div className="space-y-5">
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                      <span className="inline-block bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent animate-gradient-x pb-2">
                        Free AI Resume Builder
                      </span>
                      <br />
                      <span className="relative inline-block">
                        <span className="inline-block bg-gradient-to-r from-violet-500/90 via-blue-500/90 to-violet-500/90 bg-clip-text text-transparent animate-gradient-x">
                          that lands you tech jobs
                        </span>
                        <div className="absolute -bottom-2 left-0 w-24 sm:w-32 h-1.5 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full" />
                      </span>
                    </h1>
                    
                    <p className="text-xl sm:text-2xl text-muted-foreground/90 leading-relaxed max-w-2xl font-medium">
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
                  <div className="relative w-full max-w-[min(85vw,_6in)] mx-auto transform hover:scale-[1.02] transition-transform duration-700">
                    {/* Decorative Elements - Enhanced gradients for mobile */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5 rounded-sm transform rotate-3 scale-[1.03] shadow-xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5 rounded-sm transform -rotate-3 scale-[1.03] shadow-xl" />
                    
                    {/* Stacked Resume Previews - Mobile Optimized */}
                    <div className="relative">
                      {/* Background Resume - Third Layer */}
                      <div className="absolute -right-5 top-3 opacity-80 scale-[0.98] rotate-[-8deg] shadow-lg">
                        <MockResumeMobile />
                      </div>
                      
                      {/* Middle Resume - Second Layer */}
                      <div className="absolute -right-2.5 top-1.5 opacity-90 scale-[0.99] rotate-[-4deg] origin-center shadow-lg">
                        <MockResumeMobile />
                      </div>

                      {/* Front Resume - Main Layer */}
                      <div className="relative shadow-xl transform transition-all duration-700 hover:translate-y-[-5px]">
                        <MockResumeMobile />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop stacked resume view */}
                <div className="relative hidden lg:block transform hover:scale-[1.02] transition-transform duration-700">
                  {/* Decorative Elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 to-blue-500/8 rounded-3xl transform rotate-6 scale-110 shadow-xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 to-blue-500/8 rounded-3xl transform -rotate-6 scale-110 shadow-xl" />
                  
                  {/* Enhanced glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 via-blue-500/20 to-violet-500/20 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-1000"></div>
                  
                  {/* Stacked Resume Previews with improved positioning and effects */}
                  <div className="relative">
                    {/* Background Resume - Third Layer */}
                    <div className="absolute -right-14 top-6 opacity-70 blur-[0.5px] scale-[0.96] rotate-[-10deg] origin-bottom-right shadow-xl">
                      <MockResume />
                    </div>
                    
                    {/* Middle Resume - Second Layer */}
                    <div className="absolute -right-7 top-3 opacity-85 scale-[0.98] rotate-[-5deg] origin-bottom-right shadow-xl">
                      <MockResume />
                    </div>

                    {/* Front Resume - Main Layer */}
                    <div className="relative shadow-2xl transform transition-all duration-700 hover:translate-y-[-5px]">
                      <MockResume />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Hero Video Section with better framing */}
          <div className="relative py-16">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-50/30 to-transparent"></div>
            <HeroVideoSection />
          </div>
          
          {/* Enhanced Model Showcase with better spacing */}
          <div className="py-16 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent"></div>
            <ModelShowcase />
          </div>

          {/* Enhanced Features Section with improved card styling */}
          <div className="flex flex-col gap-24 py-24 relative" id="features">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-50/30 to-transparent"></div>
            
            <SplitContent
              imageSrc="/SS Chat.png"
              heading="AI-Powered Resume Assistant"
              description="Get real-time feedback and suggestions from our advanced AI assistant. Optimize your resume content, improve your bullet points, and ensure your skills stand out to recruiters and ATS systems."
              imageOnLeft={false}
              imageOverflowRight={true}
            />

            <SplitContent
              imageSrc="/Dashboard Image.png"
              heading="Beautiful Resume Dashboard"
              description="Manage all your resumes in one place with our intuitive dashboard. Create base resumes, generate tailored versions for specific jobs, and track your application progress with ease."
              imageOnLeft={true}
            />

            <SplitContent
              imageSrc="/SS Score.png"
              heading="Resume Performance Scoring"
              description="Get detailed insights into your resume's effectiveness with our comprehensive scoring system. Track key metrics, identify areas for improvement, and optimize your resume to stand out to employers and ATS systems."
              imageOnLeft={false}
              imageOverflowRight={true}
            />

            <SplitContent
              imageSrc="/SS Cover Letter.png"
              heading="AI Cover Letter Generator"
              description="Create compelling, personalized cover letters in minutes with our AI-powered generator. Tailor your message to specific job opportunities while maintaining a professional and engaging tone that captures attention."
              imageOnLeft={true}
            />
          </div>

          {/* How It Works Section with improved framing */}
          <div id="how-it-works" className="relative py-16">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent"></div>
            <HowItWorks />
          </div>

          {/* Pricing Section with improved framing */}
          <div id="pricing" className="relative py-16">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-50/30 to-transparent"></div>
            <PricingSection />
          </div>

          {/* Creator Story with improved framing */}
          <div id="about" className="relative py-16">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent"></div>
            <CreatorStory />
          </div>
        </div>
      </main>
      <Footer variant="static"/>
    </>
  );
}
