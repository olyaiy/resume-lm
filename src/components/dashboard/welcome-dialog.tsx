'use client';

import { useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";
import { Upload, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreateBaseResumeDialog,
  type ResumeImportOption,
} from "@/components/resume/management/dialogs/create-base-resume-dialog";
import type { Profile } from "@/lib/types";
import { AnalyticsEvents } from "@/lib/analytics/events";

interface WelcomeDialogProps {
  isOpen: boolean;
  profile: Profile;
}

function clearOnboardingIntent() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.searchParams.delete("onboarding");
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

export function WelcomeDialog({ isOpen: initialIsOpen, profile }: WelcomeDialogProps) {
  const posthog = usePostHog();
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [importOption, setImportOption] = useState<ResumeImportOption>("scratch");

  useEffect(() => {
    setWelcomeOpen(initialIsOpen);
  }, [initialIsOpen]);

  const handleDismiss = () => {
    setWelcomeOpen(false);
    clearOnboardingIntent();
  };

  const handleStart = (mode: Extract<ResumeImportOption, "import-resume" | "scratch">) => {
    setImportOption(mode);
    setWelcomeOpen(false);
    setResumeDialogOpen(true);
    clearOnboardingIntent();
    posthog?.capture(AnalyticsEvents.ResumeStartModeSelected, {
      mode: mode === "import-resume" ? "import_resume" : "scratch",
      source: "new_user_onboarding",
    });
  };

  return (
    <>
      <Dialog
        open={welcomeOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) handleDismiss();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              How do you want to start?
            </DialogTitle>
            <DialogDescription>
              Get an editable resume first. You can fill out your profile later.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 pt-4 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-32 flex-col items-start justify-between gap-3 border-purple-200 p-4 text-left hover:border-purple-400 hover:bg-purple-50"
              onClick={() => handleStart("import-resume")}
            >
              <Upload className="h-6 w-6 text-purple-600" />
              <span>
                <span className="block font-semibold text-gray-900">Import a resume</span>
                <span className="mt-1 block text-xs font-normal text-gray-600">
                  Upload a PDF or paste your resume text.
                </span>
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-32 flex-col items-start justify-between gap-3 border-teal-200 p-4 text-left hover:border-teal-400 hover:bg-teal-50"
              onClick={() => handleStart("scratch")}
            >
              <Wand2 className="h-6 w-6 text-teal-600" />
              <span>
                <span className="block font-semibold text-gray-900">Start from scratch</span>
                <span className="mt-1 block text-xs font-normal text-gray-600">
                  Choose a target role and build an empty resume.
                </span>
              </span>
            </Button>
          </div>

          <Button type="button" variant="ghost" className="mt-2 w-full" onClick={handleDismiss}>
            I&apos;ll do this later
          </Button>
        </DialogContent>
      </Dialog>

      <CreateBaseResumeDialog
        key={importOption}
        profile={profile}
        open={resumeDialogOpen}
        onOpenChange={setResumeDialogOpen}
        initialImportOption={importOption}
      />
    </>
  );
}
