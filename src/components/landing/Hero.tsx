export function Hero() {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
      {/* Left Content */}
      <div className="w-full lg:w-1/2 space-y-8">
        {/* Tagline with gradient text */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          <span className="block">Open source</span>
          <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Resume Builder</span>
          <span className="block">that lands you tech jobs</span>
        </h1>
        
        {/* Description with subtle animation */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-md">
          Create stunning resumes tailored to tech roles using AI-powered tools that highlight your skills and experience.
        </p>
        
        {/* CTAs with glass effect and gradient */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="relative group px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
            Create Resume
            <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
          <button className="px-6 py-3 rounded-lg bg-white/40 backdrop-blur-md border border-white/40 font-medium transition-all duration-500 hover:-translate-y-1 hover:bg-white/50 hover:shadow-xl">
            View Examples
          </button>
        </div>
        
        {/* Feature badges with glass card effect */}
        <div className="flex flex-wrap gap-3 mt-6">
          <span className="px-3 py-1 rounded-full bg-white/30 backdrop-blur-sm text-sm border border-white/40">AI-Powered</span>
          <span className="px-3 py-1 rounded-full bg-white/30 backdrop-blur-sm text-sm border border-white/40">ATS-Optimized</span>
          <span className="px-3 py-1 rounded-full bg-white/30 backdrop-blur-sm text-sm border border-white/40">100% Free</span>
          <span className="px-3 py-1 rounded-full bg-white/30 backdrop-blur-sm text-sm border border-white/40">Privacy-First</span>
        </div>
      </div>
      
      {/* Right Content - Placeholder images/mockups */}
      <div className="w-full lg:w-1/2 relative">
        {/* Main resume mockup placeholder */}
        <div className="relative w-full aspect-[3/4] rounded-2xl bg-white/40 backdrop-blur-md border border-white/40 shadow-xl overflow-hidden transform transition-all duration-500 hover:-translate-y-1">
          {/* Resume header placeholder */}
          <div className="absolute top-0 left-0 w-full h-[15%] bg-gradient-to-r from-purple-600/90 to-indigo-600/90">
            <div className="absolute bottom-0 left-8 w-[30%] h-[20%] bg-white/80 rounded-t-lg"></div>
          </div>
          
          {/* Resume content placeholders */}
          <div className="absolute top-[20%] left-8 w-[80%] h-[5%] bg-slate-200/60 rounded-md"></div>
          <div className="absolute top-[28%] left-8 w-[60%] h-[4%] bg-slate-200/60 rounded-md"></div>
          
          {/* Section headers */}
          <div className="absolute top-[35%] left-8 w-[40%] h-[5%] bg-purple-200/60 rounded-md"></div>
          <div className="absolute top-[42%] left-8 w-[80%] h-[4%] bg-slate-200/40 rounded-md"></div>
          <div className="absolute top-[48%] left-8 w-[75%] h-[4%] bg-slate-200/40 rounded-md"></div>
          
          <div className="absolute top-[55%] left-8 w-[40%] h-[5%] bg-purple-200/60 rounded-md"></div>
          <div className="absolute top-[62%] left-8 w-[80%] h-[4%] bg-slate-200/40 rounded-md"></div>
          <div className="absolute top-[68%] left-8 w-[75%] h-[4%] bg-slate-200/40 rounded-md"></div>
          
          <div className="absolute top-[75%] left-8 w-[40%] h-[5%] bg-purple-200/60 rounded-md"></div>
          <div className="absolute top-[82%] left-8 w-[80%] h-[4%] bg-slate-200/40 rounded-md"></div>
          <div className="absolute top-[88%] left-8 w-[75%] h-[4%] bg-slate-200/40 rounded-md"></div>
        </div>
        
        {/* Floating smaller resume variants */}
        <div className="absolute -bottom-8 -left-8 w-[40%] aspect-[3/4] rounded-xl bg-white/30 backdrop-blur-md border border-white/30 shadow-lg overflow-hidden rotate-[-8deg] z-10">
          <div className="w-full h-[10%] bg-gradient-to-r from-pink-600/80 to-rose-600/80"></div>
        </div>
        
        <div className="absolute -top-6 -right-6 w-[40%] aspect-[3/4] rounded-xl bg-white/30 backdrop-blur-md border border-white/30 shadow-lg overflow-hidden rotate-[8deg] z-10">
          <div className="w-full h-[10%] bg-gradient-to-r from-teal-600/80 to-cyan-600/80"></div>
        </div>
      </div>
    </div>
  );
} 