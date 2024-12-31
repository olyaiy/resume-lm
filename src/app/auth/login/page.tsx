import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { MockResume } from "@/components/landing/mock-resume";

export default async function LoginPage() {
  return (
    <main className="min-h-screen relative overflow-hidden selection:bg-purple-200/50">
      {/* Enhanced Gradient Background Elements */}
      <div className="fixed inset-0 z-0">
        {/* Primary gradient mesh with improved colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/60 via-sky-50/60 to-violet-50/60 animate-gradient-slow" />
        
        {/* Enhanced animated gradient orbs with better positioning and animations */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-pink-200/30 to-violet-200/30 rounded-full blur-3xl animate-float-slow opacity-80 mix-blend-multiply" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-blue-200/30 to-teal-200/30 rounded-full blur-3xl animate-float-delayed opacity-80 mix-blend-multiply" />
        <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-gradient-to-r from-purple-200/30 to-indigo-200/30 rounded-full blur-3xl animate-float opacity-80 mix-blend-multiply" />
        
        {/* Enhanced mesh grid overlay with subtle animation */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] animate-mesh-slow" />
      </div>

      {/* Enhanced Navigation with backdrop blur and border */}
      <nav className="relative z-10 border-b border-white/20 backdrop-blur-md bg-white/5 sticky top-0">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              ResumeLM
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" 
                className="p-2 rounded-full">
                <Github className="w-5 h-5 text-purple-600" />
              </a>
              <Button variant="ghost" 
                className="text-purple-600">
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Content with better spacing and animations */}
      <div className="relative z-10 container mx-auto px-4">
        {/* Hero Section with Split Layout */}
        <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2 gap-8 items-center py-12">
          {/* Left Column - Content */}
          <div className="flex flex-col gap-8 lg:pr-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50/80 border border-purple-200 text-purple-600 w-fit">
              <Github className="w-4 h-4" />
              <span className="text-sm font-medium">Open Source on GitHub</span>
              <ChevronRight className="w-4 h-4" />
            </div>
            
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold space-y-2 mb-6">
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent inline-block">
                  Open Source, AI Resume Builder
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent inline-block">
                  that lands you tech jobs
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Create tailored, ATS-optimized resumes powered by AI. 
                <span className="block mt-2 opacity-90">Stand out to recruiters and increase your interview chances by 3x.</span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/25">
                Get Started Free 
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" 
                className="border-purple-200">
                View Demo
              </Button>
            </div>

            {/* Quick Benefits */}
            <div className="flex flex-col sm:flex-row gap-6 text-sm text-muted-foreground">
              {[
                "AI-Powered Resume Analysis",
                "ATS-Optimized Templates",
                "Tech-Focused Design"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="p-6 rounded-xl bg-white/40 backdrop-blur-md border border-white/40 shadow-xl shadow-purple-500/5">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} 
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 border-2 border-white p-0.5">
                        <div className="w-full h-full rounded-full bg-white" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm">
                    <span className="font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">2,000+</span>
                    <span className="text-muted-foreground"> resumes created</span>
                  </p>
                </div>
                <div className="h-8 w-px bg-purple-200/80 hidden sm:block" />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Sparkles key={i} className="w-5 h-5 text-yellow-400 transition-transform group-hover:scale-110" />
                    ))}
                  </div>
                  <p className="text-sm">
                    <span className="font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">4.9/5</span>
                    <span className="text-muted-foreground"> user rating</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Floating Resume Preview */}
          <div className="relative hidden lg:block">
            {/* Decorative Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-3xl transform rotate-3 scale-105" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-3xl transform -rotate-3 scale-105" />
            
            {/* Resume Preview */}
            <div className="relative">
              <MockResume />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
  