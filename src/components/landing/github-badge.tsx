'use client';

import { Github, ChevronRight } from "lucide-react";
import { GITHUB_REPO_URL } from "@/lib/site-config";
import { withUtmParameters } from "@/lib/analytics/attribution";

export function GitHubBadge() {
  const trackedRepoUrl = withUtmParameters(GITHUB_REPO_URL, {
    utm_source: "resumelm",
    utm_medium: "referral",
    utm_campaign: "landing",
  });

  return (
    <a
      href={trackedRepoUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open ResumeLM source code on GitHub"
      data-analytics-id="outbound-github-repo"
      data-analytics-placement="landing_github_badge"
      className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-purple-50/80 border border-purple-200 text-purple-600 w-fit cursor-pointer hover:bg-purple-100/80 transition-colors">
      <Github className="w-4 h-4" />
      <span className="text-sm font-medium">Open Source on GitHub</span>
      <ChevronRight className="w-4 h-4" />
    </a>
  );
}
