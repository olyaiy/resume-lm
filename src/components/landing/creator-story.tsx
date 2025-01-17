import Image from "next/image";

export function CreatorStory() {
  return (
    <div className=" py-8 border-y border-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-[400px_1fr] gap-8 items-center">
          {/* Image Area */}
          <div className="relative aspect-square w-64 md:w-96 mx-auto md:mx-0 rounded-2xl overflow-hidden">
            <Image
              src="/alex.webp"
              alt="Alex, creator of ResumeLM"
              fill
              sizes="(max-width: 768px) 256px, 384px"
              className="object-cover"
              priority
            />
          </div>

          {/* Story Content */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold tracking-tight sm:text-uxl bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
              Why I Built ResumeLM
            </h2>
            
            <div className="space-y-4 text-lg text-muted-foreground/90 leading-relaxed">
              <p>
                Hi, I&apos;m Alex! I&apos;m a Computer Science student at the University of British Columbia in Vancouver, 
                and like many students, I&apos;ve been through the challenging journey of searching for tech internships.
              </p>
              
              <p>
                ResumeLM is my passion project - a free, open-source resume builder designed to help students and developers 
                create ATS-optimized resumes without the hefty subscription costs. Because everyone deserves access to great tools.
              </p>

              <div className="flex gap-4 pt-2">
                <a 
                  href="https://x.com/alexfromvan" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-violet-600 transition-colors"
                >
                  Twitter ↗
                </a>
                <a 
                  href="https://github.com/olyaiy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-violet-600 transition-colors"
                >
                  GitHub ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 