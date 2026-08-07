'use client';

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { GITHUB_REPO_URL } from "@/lib/site-config";
import { withUtmParameters } from "@/lib/analytics/attribution";
// import { WaitlistDialog } from "@/components/waitlist/waitlist-dialog";

export function ActionButtons() {
  const trackedRepoUrl = withUtmParameters(GITHUB_REPO_URL, {
    utm_source: "resumelm",
    utm_medium: "referral",
    utm_campaign: "landing",
  });

  return (
    <div className="flex flex-col gap-6 z-[1000]">
      <div className="flex justify-start">
        <AuthDialog />
        {/* <WaitlistDialog /> */}
      </div>
      
      <Button
        asChild
        size="sm"
        variant="ghost"
        className="text-xs text-muted-foreground hover:text-foreground border-none px-4 py-2 transition-colors duration-300 self-start"
      >
        <a
          href={trackedRepoUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-analytics-id="outbound-github-repo"
          data-analytics-placement="landing_action_buttons"
        >
          <Github className="mr-2 w-3.5 h-3.5" />
          Source Code on GitHub
        </a>
      </Button>
    </div>
  );
}
