'use client';

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export function SuggestionSkeleton() {
  return (
    <Card className={cn(
      "group relative overflow-hidden",
      "p-4",
      "bg-gradient-to-br from-white/95 via-purple-50/30 to-indigo-50/40 border-white/60",
      "shadow-xl shadow-purple-500/10",
      "backdrop-blur-xl"
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_14px] [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)] opacity-[0.15]" />
      
      {/* Floating Gradient Orbs */}
      <div className="absolute -top-1/2 -right-1/2 w-[150%] h-[150%] rounded-full bg-gradient-to-br from-purple-200/20 via-indigo-200/20 to-transparent blur-3xl animate-float opacity-60" />
      <div className="absolute -bottom-1/2 -left-1/2 w-[150%] h-[150%] rounded-full bg-gradient-to-br from-indigo-200/20 via-purple-200/20 to-transparent blur-3xl animate-float-delayed opacity-60" />

      {/* Content */}
      <div className="relative space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-100/90 to-indigo-100/90 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
          </div>
          <div className="h-4 w-24 bg-gradient-to-r from-purple-200/60 to-indigo-200/60 rounded animate-pulse" />
        </div>

        {/* Main Content */}
        <div className="bg-gradient-to-br from-white/80 to-white/60 rounded-lg p-3 backdrop-blur-md border border-white/60 shadow-sm space-y-3">
          {/* Title Area */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-5 w-48 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse" />
            </div>
            <div className="h-3 w-16 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse" />
          </div>

          {/* Description Lines */}
          <div className="space-y-2 pt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="h-2 w-2 mt-1.5 rounded-full bg-gray-200" />
                <div className="h-4 flex-1 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className="h-5 w-16 rounded-full bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-0.5">
          <div className="h-8 w-20 rounded-md bg-gradient-to-r from-rose-100 to-rose-50 animate-pulse" />
          <div className="h-8 w-20 rounded-md bg-gradient-to-r from-emerald-100 to-emerald-50 animate-pulse" />
        </div>
      </div>
    </Card>
  );
} 