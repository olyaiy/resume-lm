'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlayCircle } from 'lucide-react';

export function HeroVideoSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative mt-12 mb-8 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-blue-500/5 to-violet-500/5 rounded-3xl transform rotate-3 scale-105 animate-gradient-slow" />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-blue-500/5 to-violet-500/5 rounded-3xl transform -rotate-3 scale-105 animate-gradient-delayed" />
      </div>

      {/* Main Container */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="group relative overflow-hidden rounded-3xl border-black/80 border-2 bg-gradient-to-br from-violet-50/20 via-blue-50/20 to-violet-50/20 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:shadow-violet-500/10 cursor-pointer">
            {/* Video Thumbnail Container */}
            <div className="relative aspect-video">
              {/* Thumbnail Image */}
              <img
                src="/thumbnail.png"
                alt="ResumeLM Demo Video"
                
                className="h-full w-full object-cover opacity-90 transition-all duration-500 group-hover:opacity-95 group-hover:scale-105 "
              />
              
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-violet-500/20 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-violet-500/10 mix-blend-overlay" />
              
              {/* Play Button Visual (non-interactive) */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full p-8 transition-all duration-500 group-hover:scale-105">
                <div className="relative">
                  {/* Animated Rings */}
                  <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-violet-500/20 to-blue-500/20 blur-md animate-pulse" />
                  <div className="absolute -inset-8 animate-ping rounded-full bg-gradient-to-r from-violet-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100" />
                  <div className="absolute -inset-12 animate-ping rounded-full bg-gradient-to-r from-violet-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100" />
                  
                  {/* Play Icon */}
                  <PlayCircle className="h-16 w-16 relative z-10 text-white drop-shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:text-violet-100" />
                </div>
              </div>
            </div>

            {/* Bottom Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-violet-500/10 via-blue-500/5 to-transparent pointer-events-none mix-blend-overlay" />
            
            {/* Mesh Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] opacity-20" />
          </div>
        </DialogTrigger>

        {/* Video Dialog */}
        <DialogContent className="max-w-5xl border-0 bg-transparent p-0 shadow-none">
          <DialogTitle className="VisuallyHidden"/>
          <div className="aspect-video overflow-hidden rounded-3xl bg-black/95 shadow-2xl relative">
            {/* Enhanced Border */}
            <div className="absolute inset-0 rounded-3xl border-2 border-white/20 pointer-events-none" />
            <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none" />
            <div className="absolute inset-0 rounded-3xl border-4 border-transparent bg-gradient-to-br from-violet-500/20 via-blue-500/20 to-violet-500/20 pointer-events-none mix-blend-overlay" />
            
            <video
              controls
              autoPlay={isOpen}
              className="h-full w-full object-cover"
              src="/ResumeLM.mp4"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 