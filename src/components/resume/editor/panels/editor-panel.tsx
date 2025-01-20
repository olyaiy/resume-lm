'use client';

import { Resume, Profile, Job } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { ResumeEditorActions } from "../actions/resume-editor-actions";
import { ResumeEditorTabs } from "../header/resume-editor-tabs";
import { TailoredJobCard } from "../../management/cards/tailored-job-card";
import { BasicInfoForm } from "../forms/basic-info-form";
import ChatBot from "../../assistant/chatbot";
import {
  WorkExperienceForm,
  EducationForm,
  SkillsForm,
  ProjectsForm,
  CertificationsForm,
  DocumentSettingsForm
} from '../dynamic-components';

interface EditorPanelProps {
  resume: Resume;
  profile: Profile;
  job: Job | null;
  isLoadingJob: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onSave: () => Promise<void>;
  onDelete: () => Promise<void>;
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
  onJobCreate: (jobId: string) => void;
}

export function EditorPanel({
  resume,
  profile,
  job,
  isLoadingJob,
  isSaving,
  isDeleting,
  onSave,
  onDelete,
  onResumeChange,
  onJobCreate
}: EditorPanelProps) {
  return (
    <div className="flex flex-col h-full mr-4">
      {/* Main Editor Area */}
      <div className="flex-1 overflow-hidden flex flex-col h-full">
        <ScrollArea className="flex-1 pr-2">
          <Tabs defaultValue="basic" className="relative pb-12 ">
            {/* Make the actions and tabs sticky */}
            <div className={cn(
              "sticky top-0 z-20 backdrop-blur-sm",
              resume.is_base_resume
                ? "bg-purple-50/80"
                : "bg-pink-100/90 shadow-sm shadow-pink-200/50"
            )}>
              <ResumeEditorActions
                resume={resume}
                isSaving={isSaving}
                isDeleting={isDeleting}
                onSave={onSave}
                onDelete={onDelete}
                onResumeChange={onResumeChange}
              />
              <ResumeEditorTabs />
            </div>

            {/* Tab content below */}
            <TabsContent value="basic" className={cn(
              "space-y-6 mt-6 rounded-lg ",
              resume.is_base_resume
                ? "bg-purple-50/30"
                : "bg-pink-50/60 shadow-sm shadow-pink-200/20"
            )}>
              {!resume.is_base_resume && (
                <TailoredJobCard 
                  jobId={resume.job_id || null}
                  onJobCreate={onJobCreate}
                  job={job}
                  isLoading={isLoadingJob}
                />
              )}
              <BasicInfoForm
                profile={profile}
              />
            </TabsContent>

            <TabsContent value="work" className={cn(
              "space-y-6 mt-6 rounded-lg ",
              resume.is_base_resume
                ? "bg-purple-50/30"
                : "bg-pink-50/60 shadow-sm shadow-pink-200/20"
            )}>
              <Suspense fallback={
                <div className="space-y-4 animate-pulse">
                  <div className="h-8 bg-muted rounded-md w-1/3" />
                  <div className="h-24 bg-muted rounded-md" />
                  <div className="h-24 bg-muted rounded-md" />
                </div>
              }>
                <WorkExperienceForm
                  experiences={resume.work_experience}
                  onChange={(experiences) => onResumeChange('work_experience', experiences)}
                  profile={profile}
                  targetRole={resume.target_role}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="projects" className={cn(
              "space-y-6 mt-6 rounded-lg ",
              resume.is_base_resume
                ? "bg-purple-50/30"
                : "bg-pink-50/60 shadow-sm shadow-pink-200/20"
            )}>
              <Suspense fallback={
                <div className="space-y-4 animate-pulse">
                  <div className="h-8 bg-muted rounded-md w-1/3" />
                  <div className="h-24 bg-muted rounded-md" />
                </div>
              }>
                <ProjectsForm
                  projects={resume.projects}
                  onChange={(projects) => onResumeChange('projects', projects)}
                  profile={profile}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="education" className={cn(
              "space-y-6 mt-6 rounded-lg ",
              resume.is_base_resume
                ? "bg-purple-50/30"
                : "bg-pink-50/60 shadow-sm shadow-pink-200/20"
            )}>
              <Suspense fallback={
                <div className="space-y-4 animate-pulse">
                  <div className="h-8 bg-muted rounded-md w-1/3" />
                  <div className="h-24 bg-muted rounded-md" />
                </div>
              }>
                <EducationForm
                  education={resume.education}
                  onChange={(education) => onResumeChange('education', education)}
                  profile={profile}
                />
              </Suspense>
              <CertificationsForm
                certifications={resume.certifications}
                onChange={(certifications) => onResumeChange('certifications', certifications)}
              />
            </TabsContent>

            <TabsContent value="skills" className={cn(
              "space-y-6 mt-6 rounded-lg ",
              resume.is_base_resume
                ? "bg-purple-50/30"
                : "bg-pink-50/60 shadow-sm shadow-pink-200/20"
            )}>
              <Suspense fallback={
                <div className="space-y-4 animate-pulse">
                  <div className="h-8 bg-muted rounded-md w-1/3" />
                  <div className="h-24 bg-muted rounded-md" />
                </div>
              }>
                <SkillsForm
                  skills={resume.skills}
                  onChange={(skills) => onResumeChange('skills', skills)}
                  profile={profile}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="settings" className={cn(
              "space-y-6 mt-6 rounded-lg ",
              resume.is_base_resume
                ? "bg-purple-50/30"
                : "bg-pink-50/60 shadow-sm shadow-pink-200/20"
            )}>
              <Suspense fallback={
                <div className="space-y-4 animate-pulse">
                  <div className="h-8 bg-muted rounded-md w-1/3" />
                  <div className="h-24 bg-muted rounded-md" />
                </div>
              }>
                <DocumentSettingsForm
                  resume={resume}
                  onChange={onResumeChange}
                />
              </Suspense>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>
      {/* Fixed ChatBot at bottom */}
      <div className={cn(
        "mt-auto mb-[9rem] rounded-lg border",
        resume.is_base_resume
          ? "bg-purple-50/50 border-purple-200/40"
          : "bg-pink-50/80 border-pink-300/50 shadow-sm shadow-pink-200/20"
      )}>
        <ChatBot 
          resume={resume} 
          onResumeChange={onResumeChange}
          job={job}
        />
      </div>
    </div>
  );
} 