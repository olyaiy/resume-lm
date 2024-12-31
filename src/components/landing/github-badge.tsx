'use client';

import { Github, ChevronRight } from "lucide-react";

export function GitHubBadge() {
  return (
    <div 
      onClick={() => window.open('https://github.com/olyaiy/resume-ai', '_blank')}
      className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-purple-50/80 border border-purple-200 text-purple-600 w-fit cursor-pointer hover:bg-purple-100/80 transition-colors">
      <Github className="w-4 h-4" />
      <span className="text-sm font-medium">Open Source on GitHub</span>
      <ChevronRight className="w-4 h-4" />
    </div>
  );
} 