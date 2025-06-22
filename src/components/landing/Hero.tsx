import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { AuthDialog } from "@/components/auth/auth-dialog";

export function Hero() {
  return (
    <section className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 py-12 md:py-16 lg:py-20">
      {/* Left Content */}
      <div className="w-full lg:w-1/2 space-y-8">
        {/* Product Hunt Badge */}
        <div className="flex justify-start">
          <a 
            href="https://www.producthunt.com/products/resumelm?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-resumelm" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transition-transform duration-300 hover:-translate-y-1"
          >
            <img 
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=982199&theme=light&t=1750633039421" 
              alt="ResumeLM - Open Source AI Resume Builder for Tech Jobs | Product Hunt" 
              style={{ width: '250px', height: '54px' }}
              width={250} 
              height={54} 
            />
          </a>
        </div>
        
        {/* Tagline with simplified gradient text */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          <span className="block">Open source</span>
          <span className="block text-indigo-600">AI Resume Builder</span>
          <span className="block">that lands you tech jobs</span>
        </h1>
        
        {/* Description with quantifiable benefits */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-md">
          Create ATS-optimized tech resumes in under 10 minutes. 3x your interview chances with AI-powered resume tailoring.
        </p>
        
        {/* CTAs with simplified effects */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <AuthDialog>
            <button 
              className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium transition-all duration-300 hover:-translate-y-1 flex items-center justify-center"
              aria-label="Create your resume now"
            >
              <span>Create Resume</span>
              <svg className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </AuthDialog>
          <Link 
            href="https://github.com/olyaiy/resume-lm" 
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg bg-white/40 border border-gray-200 font-medium transition-all duration-300 hover:-translate-y-1"
            aria-label="View source code on GitHub"
          >
            Open Source on Github
          </Link>
        </div>
        
        {/* Feature badges with simplified styling */}
        <div className="flex flex-wrap gap-3 mt-6">
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-sm border border-indigo-200 text-indigo-700">AI-Powered</span>
          <span className="px-3 py-1 rounded-full bg-teal-50 text-sm border border-teal-200 text-teal-700">ATS-Optimized</span>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-sm border border-emerald-200 text-emerald-700">100% Free</span>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-sm border border-blue-200 text-blue-700">Privacy-First</span>
        </div>
        
        {/* Simplified social proof section */}
        <div className="mt-8">
          <div className="flex items-center p-4 rounded-xl bg-white border border-gray-200 shadow-sm transition-all duration-300 hover:-translate-y-1">
            {/* Stats highlight with simplified styling */}
            <div className="flex-shrink-0 mr-5">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-50 border border-indigo-100">
                <span className="text-2xl font-bold text-indigo-600">500+</span>
              </div>
            </div>
            
            {/* Text content with testimonial */}
            <div className="flex-1">
              <h3 className="font-semibold text-base">Join our growing community</h3>
              <p className="text-sm text-muted-foreground">Trusted by over 500 tech professionals</p>
              
              <p className="text-xs italic mt-1 text-indigo-600">&ldquo;Landed 3 interviews in my first week using ResumeLM&rdquo; — Sarah K.</p>
              
              {/* Shadcn Avatar stack */}
              <div className="flex items-center mt-3">
                <div className="flex -space-x-2 mr-3">
                  <Avatar className="h-7 w-7 border-2 border-background">
                    <AvatarFallback className="bg-indigo-500 text-white text-xs">JD</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-7 w-7 border-2 border-background">
                    <AvatarFallback className="bg-pink-500 text-white text-xs">SR</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-7 w-7 border-2 border-background">
                    <AvatarFallback className="bg-teal-500 text-white text-xs">KL</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-7 w-7 border-2 border-background">
                    <AvatarFallback className="bg-amber-500 text-white text-xs">MP</AvatarFallback>
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
      
      {/* Right Content - Simplified resume mockups */}
      <div className="w-full lg:w-1/2 relative">
        {/* Main resume mockup with simplified visuals */}
        <div className="relative w-full aspect-[3/4] rounded-2xl bg-white border border-gray-200 shadow-md overflow-hidden transform transition-all duration-300 hover:-translate-y-2">
          {/* Resume header with simplified colors */}
          <div className="absolute top-0 left-0 w-full h-[15%] bg-indigo-600">
            <div className="absolute top-6 left-8 w-[50%] h-[20%] bg-white/90 rounded-sm"></div>
            <div className="absolute bottom-0 left-8 w-[30%] h-[20%] bg-white/80 rounded-t-lg"></div>
          </div>
          
          {/* Resume content with simplified styling */}
          <div className="absolute top-[20%] left-8 w-[80%] h-[4%] bg-slate-200 rounded-md"></div>
          <div className="absolute top-[26%] left-8 w-[60%] h-[3%] bg-slate-200 rounded-md"></div>
          <div className="absolute top-[30%] left-8 w-[70%] h-[3%] bg-slate-200 rounded-md"></div>
          
          {/* Experience Section */}
          <div className="absolute top-[36%] left-8 w-[35%] h-[4%] bg-indigo-100 rounded-md"></div>
          <div className="absolute top-[42%] left-8 w-[80%] h-[3%] bg-slate-200 rounded-md"></div>
          <div className="absolute top-[46%] left-8 w-[75%] h-[3%] bg-slate-200 rounded-md"></div>
          <div className="absolute top-[50%] left-8 w-[70%] h-[3%] bg-slate-200 rounded-md"></div>
          
          {/* Skills Section */}
          <div className="absolute top-[56%] left-8 w-[35%] h-[4%] bg-indigo-100 rounded-md"></div>
          <div className="absolute top-[62%] right-8 flex flex-wrap gap-2 w-[80%]">
            <div className="h-[12px] w-[60px] bg-indigo-100 rounded-full"></div>
            <div className="h-[12px] w-[70px] bg-indigo-100 rounded-full"></div>
            <div className="h-[12px] w-[50px] bg-blue-100 rounded-full"></div>
            <div className="h-[12px] w-[80px] bg-teal-100 rounded-full"></div>
            <div className="h-[12px] w-[65px] bg-cyan-100 rounded-full"></div>
          </div>
          
          {/* Education Section */}
          <div className="absolute top-[70%] left-8 w-[35%] h-[4%] bg-indigo-100 rounded-md"></div>
          <div className="absolute top-[76%] left-8 w-[80%] h-[3%] bg-slate-200 rounded-md"></div>
          <div className="absolute top-[80%] left-8 w-[75%] h-[3%] bg-slate-200 rounded-md"></div>
          <div className="absolute top-[84%] left-8 w-[70%] h-[3%] bg-slate-200 rounded-md"></div>
          
          {/* AI optimization indicator */}
          <div className="absolute bottom-4 right-4 px-2 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-[10px] text-indigo-700">
            AI Optimized
          </div>
        </div>
        
        {/* Tailored resume variant - simplified */}
        <div className="absolute -bottom-12 -left-8 w-[40%] aspect-[3/4] rounded-xl bg-white border border-gray-200 shadow-md overflow-hidden rotate-[-8deg] z-10 transition-all duration-300 hover:rotate-[-4deg]">
          <div className="w-full h-[10%] bg-pink-600">
            <div className="absolute top-2 left-2 w-[40%] h-[5%] bg-white/80 rounded-sm"></div>
          </div>
          <div className="absolute top-[15%] left-2 right-2 h-[80%] flex flex-col gap-1">
            <div className="h-[8px] w-[80%] bg-slate-200 rounded-sm"></div>
            <div className="h-[8px] w-[70%] bg-slate-200 rounded-sm"></div>
            <div className="mt-2 h-[8px] w-[50%] bg-pink-100 rounded-sm"></div>
            <div className="h-[8px] w-[80%] bg-slate-200 rounded-sm"></div>
            <div className="h-[8px] w-[75%] bg-slate-200 rounded-sm"></div>
          </div>
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-pink-50 border border-pink-200 text-[8px] text-pink-700">
            Tailored
          </div>
        </div>
        
        {/* Technical role variant - simplified */}
        <div className="absolute -top-10 -right-6 w-[40%] aspect-[3/4] rounded-xl bg-white border border-gray-200 shadow-md overflow-hidden rotate-[8deg] z-10 transition-all duration-300 hover:rotate-[4deg]">
          <div className="w-full h-[10%] bg-teal-600">
            <div className="absolute top-2 left-2 w-[40%] h-[5%] bg-white/80 rounded-sm"></div>
          </div>
          <div className="absolute top-[15%] left-2 right-2 h-[80%] flex flex-col gap-1">
            <div className="h-[8px] w-[80%] bg-slate-200 rounded-sm"></div>
            <div className="h-[8px] w-[70%] bg-slate-200 rounded-sm"></div>
            <div className="mt-2 h-[8px] w-[50%] bg-teal-100 rounded-sm"></div>
            <div className="h-[8px] w-[80%] bg-slate-200 rounded-sm"></div>
            <div className="h-[8px] w-[75%] bg-slate-200 rounded-sm"></div>
          </div>
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200 text-[8px] text-teal-700">
            Technical
          </div>
        </div>
      </div>
    </section>
  );
} 