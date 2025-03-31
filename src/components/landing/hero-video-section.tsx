'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { PlayCircle, Sparkles } from 'lucide-react';
import Image from 'next/image';
export function HeroVideoSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto ">
      {/* Section Header */}
      <div className="text-center mb-12 max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4 bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
          See ResumeLM in Action
        </h2>
        <p className="text-muted-foreground text-lg">
          Watch how our AI-powered platform transforms your resume in minutes
        </p>
      </div>

      {/* Main Video Container */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="group relative mx-auto max-w-5xl">
            {/* Enhanced Container with Layered Design */}
            <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-gradient-to-br from-violet-50/30 via-white/30 to-blue-50/30 backdrop-blur-xl shadow-2xl">
              {/* Video Thumbnail */}
              <div className="relative aspect-video">
                <Image
                  src="/thumbnail.png"
                  alt="ResumeLM Demo Video"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  width={1000}
                  height={1000}
                />
                
                {/* Enhanced Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-transparent to-blue-500/20 mix-blend-overlay" />
                
                {/* Improved Play Button */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                  <div className="relative group-hover:scale-105 transition-transform duration-500">
                    <div className="absolute -inset-4 rounded-full bg-white/10 backdrop-blur-sm" />
                    <PlayCircle className="h-16 w-16 relative text-white drop-shadow-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -inset-1 bg-gradient-to-br from-violet-500/5 via-blue-500/5 to-violet-500/5 rounded-3xl -z-10" />
            <div className="absolute -inset-2 bg-gradient-to-br from-violet-500/5 via-blue-500/5 to-violet-500/5 rounded-3xl -z-20" />
          </div>
        </DialogTrigger>

        {/* Enhanced Video Dialog */}
        <DialogContent className="max-w-6xl border-0 bg-transparent p-0">
          <DialogTitle className="sr-only">Demo Video</DialogTitle>
          <DialogDescription className="sr-only">
            Watch how ResumeLM transforms your resume with AI
          </DialogDescription>
          <div className="aspect-video rounded-2xl overflow-hidden bg-black/95 shadow-2xl border border-white/10">
            <video
              controls
              autoPlay={isOpen}
              className="h-full w-full"
              src="/ResumeLM.mp4"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Feature Highlight */}
      <div className="mt-8 flex justify-center items-center gap-2 text-muted-foreground">
        <Sparkles className="h-4 w-4 text-violet-500" />
        <span className="text-sm">
          Powered by advanced AI to create ATS-optimized resumes in minutes
        </span>
      </div>
    </section>
  );
} 