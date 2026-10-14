"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SUNSET_DATE_LABEL, SUNSET_REPO_URL } from "@/lib/sunset";

export function SunsetBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-[1100] border-t border-amber-200 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 shadow-lg backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl items-start gap-3">
        <p className="flex-1 leading-relaxed">
          <strong>ResumeLM is shutting down on {SUNSET_DATE_LABEL}.</strong>{" "}
          Please download any resumes you want to keep before then. New subscriptions are closed.
          The project stays{" "}
          <a
            href={SUNSET_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            open source on GitHub
          </a>{" "}
          if you want to self-host it. Thank you for using ResumeLM.
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss shutdown notice"
          className="rounded p-1 text-amber-900 hover:bg-amber-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
