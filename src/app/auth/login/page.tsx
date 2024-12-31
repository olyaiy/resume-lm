import { MockResume } from "@/components/landing/mock-resume";
import { BenefitsList } from "@/components/landing/benefits-list";
import { ActionButtons } from "@/components/landing/action-buttons";

export default async function LoginPage() {
  return (
    <main className="min-h-screen relative overflow-hidden selection:bg-violet-200/50">
      {/* Enhanced Gradient Background Elements */}
      <div className="fixed inset-0 z-0">
        {/* Primary gradient mesh with improved colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/60 via-blue-50/60 to-indigo-50/60 animate-gradient-slow" />
        
        {/* Enhanced animated gradient orbs with better positioning and animations */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-violet-200/30 to-blue-200/30 rounded-full blur-3xl animate-float-slow opacity-80 mix-blend-multiply" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl animate-float-delayed opacity-80 mix-blend-multiply" />
        <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-gradient-to-r from-indigo-200/30 to-violet-200/30 rounded-full blur-3xl animate-float opacity-80 mix-blend-multiply" />
        
        {/* Enhanced mesh grid overlay with subtle animation */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] animate-mesh-slow" />
      </div>

      {/* Enhanced Navigation with backdrop blur and border */}
      <nav className="relative z-10 border-b border-white/40 backdrop-blur-xl bg-white/15 shadow-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center h-14">
            <div className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 hover:from-blue-600 hover:via-violet-600 hover:to-blue-600 bg-clip-text text-transparent transition-all duration-700 bg-[length:200%_auto] hover:bg-[position:100%_0] cursor-pointer">
              ResumeLM
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Content with better spacing and animations */}
      <div className="relative z-10">
        {/* Hero Section with Split Layout */}
        <div className="min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:pt-16">
            {/* Left Column - Content */}
            <div className="flex flex-col gap-10 lg:pr-12 pt-8">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
                    <span className="inline-block bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent animate-gradient-x pb-2">
                      Open Source, AI Resume Builder
                    </span>
                    <br />
                    <span className="inline-block bg-gradient-to-r from-violet-500/90 via-blue-500/90 to-violet-500/90 bg-clip-text text-transparent animate-gradient-x relative">
                      that lands you tech jobs
                      <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full" />
                    </span>
                  </h1>
                  
                  <p className="text-xl text-muted-foreground/90 leading-relaxed max-w-2xl font-medium">
                    Create tailored, ATS-optimized resumes powered by AI.
                  </p>
                </div>

                <BenefitsList />
              </div>
              
              <ActionButtons />
            </div>

            {/* Right Column - Floating Resume Preview */}
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
    </main>
  );
}
  