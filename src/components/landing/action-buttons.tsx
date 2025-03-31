'use client';

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { AuthDialog } from "@/components/auth/auth-dialog";
// import { WaitlistDialog } from "@/components/waitlist/waitlist-dialog";

export function ActionButtons() {
  return (
    <div className="flex flex-col gap-6 z-[1000]">
      <div className="flex justify-start">
        <AuthDialog />
        {/* <WaitlistDialog /> */}
      </div>
      
      <Button 
        size="sm" 
        variant="ghost" 
        className="text-xs text-muted-foreground hover:text-foreground border-none px-4 py-2 transition-colors duration-300 self-start"
        onClick={() => window.open('https://github.com/olyaiy/resume-ai', '_blank')}
      >
        <Github className="mr-2 w-3.5 h-3.5" />
        Source Code on GitHub
      </Button>
    </div>
  );
} 