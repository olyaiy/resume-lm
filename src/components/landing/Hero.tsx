import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export function Hero() {
  return (
    <section className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 py-12 md:py-16 lg:py-20">
      {/* Left Content */}
      <div className="w-full lg:w-1/2 space-y-8">
        {/* Tagline with gradient text */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          <span className="block">Open source</span>
          <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">AI Resume Builder</span>
          <span className="block">that lands you tech jobs</span>
        </h1>
        
        {/* Description with quantifiable benefits */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-md">
          Create ATS-optimized tech resumes in under 10 minutes. 3x your interview chances with AI-powered resume tailoring.
        </p>
        
        {/* CTAs with enhanced accessibility and effects */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link 
            href="/dashboard/new" 
            className="relative group px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium transition-all duration-500 hover:-translate-y-1 hover:shadow-xl flex items-center justify-center"
            aria-label="Create your resume now"
          >
            <span>Create Resume</span>
            <svg className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>
          <Link 
            href="/examples" 
            className="px-6 py-3 rounded-lg bg-white/40 backdrop-blur-md border border-white/40 font-medium transition-all duration-500 hover:-translate-y-1 hover:bg-white/50 hover:shadow-xl"
            aria-label="View example resumes"
          >
            View Examples
          </Link>
        </div>
        
        {/* Feature badges with improved visual interest */}
        <div className="flex flex-wrap gap-3 mt-6">
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600/10 to-indigo-600/10 text-sm border border-purple-200/40 text-purple-700">AI-Powered</span>
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-teal-600/10 to-cyan-600/10 text-sm border border-teal-200/40 text-teal-700">ATS-Optimized</span>
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600/10 to-green-600/10 text-sm border border-emerald-200/40 text-emerald-700">100% Free</span>
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600/10 to-sky-600/10 text-sm border border-blue-200/40 text-blue-700">Privacy-First</span>
        </div>
        
        {/* Enhanced social proof section */}
        <div className="relative group mt-8">
          {/* Background blur effect that animates on hover */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/5 to-indigo-600/5 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
          
          {/* Main content container */}
          <div className="relative flex items-center p-5 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 shadow-lg transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br from-purple-600/20 to-indigo-600/20 blur-md"></div>
            <div className="absolute -left-16 -bottom-16 w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-600/10 to-purple-600/10 blur-lg"></div>
            
            {/* Stats highlight with gradient */}
            <div className="flex-shrink-0 mr-5 relative">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border border-purple-600/20 shadow-inner overflow-hidden">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">500+</span>
              </div>
            </div>
            
            {/* Text content with testimonial */}
            <div className="flex-1">
              <h3 className="font-semibold text-base">Join our growing community</h3>
              <p className="text-sm text-muted-foreground">Trusted by over 500 tech professionals</p>
              
              <p className="text-xs italic mt-1 text-purple-600">&ldquo;Landed 3 interviews in my first week using ResumeLM&rdquo; — Sarah K.</p>
              
              {/* Shadcn Avatar stack */}
              <div className="flex items-center mt-3">
                <div className="flex -space-x-2 mr-3">
                  <Avatar className="h-7 w-7 border-2 border-background">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs">JD</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-7 w-7 border-2 border-background">
                    <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white text-xs">SR</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-7 w-7 border-2 border-background">
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-xs">KL</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-7 w-7 border-2 border-background">
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs">MP</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-7 w-7 border-2 border-background">
                    <AvatarFallback className="bg-white text-xs text-indigo-600 font-medium">496+</AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs text-muted-foreground">Active this month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Content - Enhanced resume mockups */}
      <div className="w-full lg:w-1/2 relative">
        {/* Main resume mockup with improved visual details */}
        <div className="relative w-full aspect-[3/4] rounded-2xl bg-white/40 backdrop-blur-md border border-white/40 shadow-xl overflow-hidden transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
          {/* Resume header with more realistic details */}
          <div className="absolute top-0 left-0 w-full h-[15%] bg-gradient-to-r from-purple-600/90 to-indigo-600/90">
            <div className="absolute top-6 left-8 w-[50%] h-[20%] bg-white/90 rounded-sm"></div>
            <div className="absolute bottom-0 left-8 w-[30%] h-[20%] bg-white/80 rounded-t-lg"></div>
          </div>
          
          {/* Resume content with more realistic structure */}
          <div className="absolute top-[20%] left-8 w-[80%] h-[4%] bg-slate-200/70 rounded-md"></div>
          <div className="absolute top-[26%] left-8 w-[60%] h-[3%] bg-slate-200/60 rounded-md"></div>
          <div className="absolute top-[30%] left-8 w-[70%] h-[3%] bg-slate-200/50 rounded-md"></div>
          
          {/* Experience Section */}
          <div className="absolute top-[36%] left-8 w-[35%] h-[4%] bg-purple-200/70 rounded-md"></div>
          <div className="absolute top-[42%] left-8 w-[80%] h-[3%] bg-slate-200/60 rounded-md"></div>
          <div className="absolute top-[46%] left-8 w-[75%] h-[3%] bg-slate-200/60 rounded-md"></div>
          <div className="absolute top-[50%] left-8 w-[70%] h-[3%] bg-slate-200/50 rounded-md"></div>
          
          {/* Skills Section */}
          <div className="absolute top-[56%] left-8 w-[35%] h-[4%] bg-purple-200/70 rounded-md"></div>
          <div className="absolute top-[62%] right-8 flex flex-wrap gap-2 w-[80%]">
            <div className="h-[12px] w-[60px] bg-purple-100/80 rounded-full"></div>
            <div className="h-[12px] w-[70px] bg-indigo-100/80 rounded-full"></div>
            <div className="h-[12px] w-[50px] bg-blue-100/80 rounded-full"></div>
            <div className="h-[12px] w-[80px] bg-teal-100/80 rounded-full"></div>
            <div className="h-[12px] w-[65px] bg-cyan-100/80 rounded-full"></div>
          </div>
          
          {/* Education Section */}
          <div className="absolute top-[70%] left-8 w-[35%] h-[4%] bg-purple-200/70 rounded-md"></div>
          <div className="absolute top-[76%] left-8 w-[80%] h-[3%] bg-slate-200/60 rounded-md"></div>
          <div className="absolute top-[80%] left-8 w-[75%] h-[3%] bg-slate-200/60 rounded-md"></div>
          <div className="absolute top-[84%] left-8 w-[70%] h-[3%] bg-slate-200/50 rounded-md"></div>
          
          {/* AI optimization indicator */}
          <div className="absolute bottom-4 right-4 px-2 py-1 rounded-md bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-300/30 text-[10px] text-purple-700">
            AI Optimized
          </div>
        </div>
        
        {/* Tailored resume variant */}
        <div className="absolute -bottom-12 -left-8 w-[40%] aspect-[3/4] rounded-xl bg-white/30 backdrop-blur-md border border-white/30 shadow-lg overflow-hidden rotate-[-8deg] z-10 transition-all duration-500 hover:rotate-[-4deg] hover:-translate-y-2">
          <div className="w-full h-[10%] bg-gradient-to-r from-pink-600/80 to-rose-600/80">
            <div className="absolute top-2 left-2 w-[40%] h-[5%] bg-white/80 rounded-sm"></div>
          </div>
          <div className="absolute top-[15%] left-2 right-2 h-[80%] flex flex-col gap-1">
            <div className="h-[8px] w-[80%] bg-slate-200/60 rounded-sm"></div>
            <div className="h-[8px] w-[70%] bg-slate-200/60 rounded-sm"></div>
            <div className="mt-2 h-[8px] w-[50%] bg-pink-200/70 rounded-sm"></div>
            <div className="h-[8px] w-[80%] bg-slate-200/50 rounded-sm"></div>
            <div className="h-[8px] w-[75%] bg-slate-200/50 rounded-sm"></div>
          </div>
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-pink-100/50 border border-pink-200/30 text-[8px] text-pink-700">
            Tailored
          </div>
        </div>
        
        {/* Technical role variant */}
        <div className="absolute -top-10 -right-6 w-[40%] aspect-[3/4] rounded-xl bg-white/30 backdrop-blur-md border border-white/30 shadow-lg overflow-hidden rotate-[8deg] z-10 transition-all duration-500 hover:rotate-[4deg] hover:-translate-y-2">
          <div className="w-full h-[10%] bg-gradient-to-r from-teal-600/80 to-cyan-600/80">
            <div className="absolute top-2 left-2 w-[40%] h-[5%] bg-white/80 rounded-sm"></div>
          </div>
          <div className="absolute top-[15%] left-2 right-2 h-[80%] flex flex-col gap-1">
            <div className="h-[8px] w-[80%] bg-slate-200/60 rounded-sm"></div>
            <div className="h-[8px] w-[70%] bg-slate-200/60 rounded-sm"></div>
            <div className="mt-2 h-[8px] w-[50%] bg-teal-200/70 rounded-sm"></div>
            <div className="h-[8px] w-[80%] bg-slate-200/50 rounded-sm"></div>
            <div className="h-[8px] w-[75%] bg-slate-200/50 rounded-sm"></div>
          </div>
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-teal-100/50 border border-teal-200/30 text-[8px] text-teal-700">
            Technical
          </div>
        </div>
      </div>
    </section>
  );
} 