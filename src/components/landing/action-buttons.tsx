'use client';

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { AuthDialog } from "@/components/auth/auth-dialog";
// import { WaitlistDialog } from "@/components/waitlist/waitlist-dialog";

export function ActionButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-5">
      <AuthDialog />
      {/* <WaitlistDialog /> */}
      <Button size="lg" variant="outline" 
        className="border-purple-200 px-8"
        onClick={() => window.open('https://github.com/olyaiy/resume-ai', '_blank')}>
        <Github className="mr-2.5 w-4 h-4" />
        Source Code on Github
      </Button>
    </div>
  );
} 