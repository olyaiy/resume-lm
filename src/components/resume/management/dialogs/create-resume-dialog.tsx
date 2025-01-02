'use client';

import { CreateBaseResumeDialog } from "./create-base-resume-dialog";
import { CreateTailoredResumeDialog } from "./create-tailored-resume-dialog";
import { Resume, Profile } from "@/lib/types";

interface CreateResumeDialogProps {
  children: React.ReactNode;
  type: 'base' | 'tailored';
  baseResumes?: Resume[];
  profile: Profile;
}

export function CreateResumeDialog({ children, type, baseResumes, profile }: CreateResumeDialogProps) {
  if (type === 'base') {
    return <CreateBaseResumeDialog profile={profile}>{children}</CreateBaseResumeDialog>;
  }

  return (
    <CreateTailoredResumeDialog baseResumes={baseResumes} profile={profile}>
      {children}
    </CreateTailoredResumeDialog>
  );
} 