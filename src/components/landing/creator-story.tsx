"use client"
import Image from "next/image";
import { motion } from "framer-motion";

export function CreatorStory() {
  return (
    <section className="py-20 md:py-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-200/30 to-indigo-200/30 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-tl from-teal-200/30 to-cyan-200/30 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-gradient-to-r from-pink-200/20 to-rose-200/20 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section heading with gradient */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border border-purple-200/40 text-sm text-purple-700 inline-block mb-4"
          >
            The Story Behind ResumeLM
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
            Meet the Creator
          </h2>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-[400px_1fr] gap-10 items-center"
        >
          {/* Image Area with enhanced styling */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative mx-auto md:mx-0"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-200/30 to-indigo-200/30 rounded-2xl blur-lg transform -rotate-3"></div>
            <div className="absolute inset-0 bg-gradient-to-bl from-violet-200/20 to-indigo-200/20 rounded-2xl blur-lg transform rotate-3"></div>
            
            <div className="relative aspect-square w-64 md:w-96 rounded-2xl overflow-hidden bg-white/30 backdrop-blur-md border border-white/40 shadow-xl transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
              <Image
                src="/alex.webp"
                alt="Alex, creator of ResumeLM"
                fill
                sizes="(max-width: 768px) 256px, 384px"
                className="object-cover"
                priority
              />
              
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 transform rotate-12 -translate-x-5 translate-y-5 rounded-full blur-xl"></div>
            </div>
          </motion.div>

          {/* Story Content with enhanced styling - no card background */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="relative"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-tr from-indigo-600/5 to-purple-600/5 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-violet-600/5 to-indigo-600/5 rounded-full blur-xl"></div>
            
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl text-violet-800">
                Why I Built ResumeLM
              </h2>
              
              <div className="space-y-4 text-lg text-slate-800 leading-relaxed">
                <p>
                  Hi, I&apos;m Alex! I&apos;m a Computer Science student at the University of British Columbia in Vancouver, 
                  and like many students, I&apos;ve been through the challenging journey of searching for tech internships.
                </p>
                
                <p>
                  ResumeLM is my passion project - a free, open-source resume builder designed to help students and developers 
                  create ATS-optimized resumes without the hefty subscription costs. Because everyone deserves access to great tools.
                </p>

                <div className="flex gap-6 pt-4">
                  <motion.a 
                    href="https://x.com/alexfromvan" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border border-purple-200/40 text-purple-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Twitter
                  </motion.a>
                  <motion.a 
                    href="https://github.com/olyaiy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600/10 to-cyan-600/10 border border-teal-200/40 text-teal-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 