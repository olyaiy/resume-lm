'use client';

import { Resume, Profile, Job } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { ResumeEditorActions } from "../actions/resume-editor-actions";
import { TailoredJobCard } from "../../management/cards/tailored-job-card";
import { BasicInfoForm } from "../forms/basic-info-form";
import ChatBot from "../../assistant/chatbot";
import { CoverLetterPanel } from "./cover-letter-panel";
import {
  WorkExperienceForm,
  EducationForm,
  SkillsForm,
  ProjectsForm,
  CertificationsForm,
  DocumentSettingsForm
} from '../dynamic-components';
import { User, Briefcase, FolderGit2, GraduationCap, Wrench, LayoutTemplate, Briefcase as BriefcaseIcon, FileText, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCoverLetter } from "@/components/cover-letter/ai";


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
          <div className="relative pb-12">
            {/* Make the actions sticky */}
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
            </div>

            <Accordion type="single" collapsible defaultValue="basic" className="mt-6">
              {/* Tailored Job Section */}
              {!resume.is_base_resume && (
                <AccordionItem value="job" className={cn(
                  "mb-4 backdrop-blur-xl rounded-lg shadow-lg bg-white border border-pink-600/50 border-2"
                )}>
                  <AccordionTrigger className="px-4 py-2 hover:no-underline group">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-pink-100/80 transition-transform duration-300 group-data-[state=open]:scale-105">
                        <BriefcaseIcon className="h-3.5 w-3.5 text-pink-600" />
                      </div>
                      <span className="text-sm font-medium text-pink-900">Target Job</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-2 pb-4">
                    <TailoredJobCard 
                      jobId={resume.job_id || null}
                      onJobCreate={onJobCreate}
                      job={job}
                      isLoading={isLoadingJob}
                    />
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Basic Info */}
              <AccordionItem value="basic" className={cn(
                "mb-4 backdrop-blur-xl rounded-lg shadow-lg bg-white border border-purple-600/50 border-2"
              )}>
                <AccordionTrigger className="px-4 py-2 hover:no-underline group">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-purple-100/80 transition-transform duration-300 group-data-[state=open]:scale-105">
                      <User className="h-3.5 w-3.5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-purple-900">Basic Info</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2 pb-4">
                  <BasicInfoForm
                    profile={profile}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Work Experience */}
              <AccordionItem value="work" className={cn(
                "mb-4 backdrop-blur-xl rounded-lg shadow-lg bg-white border border-cyan-600/50 border-2"
              )}>
                <AccordionTrigger className="px-4 py-2 hover:no-underline group">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-cyan-100/80 transition-transform duration-300 group-data-[state=open]:scale-105">
                      <Briefcase className="h-3.5 w-3.5 text-cyan-600" />
                    </div>
                    <span className="text-sm font-medium text-cyan-900">Work Experience</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2 pb-4 ">
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
                </AccordionContent>
              </AccordionItem>

              {/* Projects */}
              <AccordionItem value="projects" className={cn(
                "mb-4 backdrop-blur-xl rounded-lg shadow-lg bg-white border border-violet-600/50 border-2"
              )}>
                <AccordionTrigger className="px-4 py-2 hover:no-underline group">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-violet-100/80 transition-transform duration-300 group-data-[state=open]:scale-105">
                      <FolderGit2 className="h-3.5 w-3.5 text-violet-600" />
                    </div>
                    <span className="text-sm font-medium text-violet-900">Projects</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2 pb-4">
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
                </AccordionContent>
              </AccordionItem>

              {/* Education */}
              <AccordionItem value="education" className={cn(
                "mb-4 backdrop-blur-xl rounded-lg shadow-lg bg-white border border-indigo-600/50 border-2"
              )}>
                <AccordionTrigger className="px-4 py-2 hover:no-underline group">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-indigo-100/80 transition-transform duration-300 group-data-[state=open]:scale-105">
                      <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
                    </div>
                    <span className="text-sm font-medium text-indigo-900">Education</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2 pb-4">
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
                </AccordionContent>
              </AccordionItem>

              {/* Skills */}
              <AccordionItem value="skills" className={cn(
                "mb-4 backdrop-blur-xl rounded-lg shadow-lg bg-white border border-rose-600/50 border-2"
              )}>
                <AccordionTrigger className="px-4 py-2 hover:no-underline group">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-rose-100/80 transition-transform duration-300 group-data-[state=open]:scale-105">
                      <Wrench className="h-3.5 w-3.5 text-rose-600" />
                    </div>
                    <span className="text-sm font-medium text-rose-900">Skills</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2 pb-4">
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
                </AccordionContent>
              </AccordionItem>

              {/* Settings */}
              <AccordionItem value="settings" className={cn(
                "mb-4 backdrop-blur-xl rounded-lg shadow-lg bg-white border border-gray-600/50 border-2"
              )}>
                <AccordionTrigger className="px-4 py-2 hover:no-underline group">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-gray-100/80 transition-transform duration-300 group-data-[state=open]:scale-105">
                      <LayoutTemplate className="h-3.5 w-3.5 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Document Settings</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2 pb-4">
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
                </AccordionContent>
              </AccordionItem>

              {/* Cover Letter */}
              <CoverLetterPanel
                resume={resume}
                job={job}
                onResumeChange={onResumeChange}
              />

            </Accordion>
          </div>
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