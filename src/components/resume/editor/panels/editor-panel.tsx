'use client';

import { Resume, Profile, Job, DocumentSettings } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Suspense, useRef } from "react";
import { cn } from "@/lib/utils";
import { ResumeEditorActions } from "../actions/resume-editor-actions";
import { TailoredJobAccordion } from "../../management/cards/tailored-job-card";
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
import { User, Briefcase, FolderGit2, GraduationCap, Wrench, LayoutTemplate, LucideIcon } from "lucide-react";

interface AccordionHeaderProps {
  icon: LucideIcon;
  label: string;
  iconColor: string;
  bgColor: string;
  textColor: string;
}

function AccordionHeader({ icon: Icon, label, iconColor, bgColor, textColor }: AccordionHeaderProps) {
  return (
    <AccordionTrigger className="px-4 py-2 hover:no-underline group">
      <div className="flex items-center gap-2">
        <div className={cn("p-1 rounded-md transition-transform duration-300 group-data-[state=open]:scale-105", bgColor)}>
          <Icon className={cn("h-3.5 w-3.5", iconColor)} />
        </div>
        <span className={cn("text-sm font-medium", textColor)}>{label}</span>
      </div>
    </AccordionTrigger>
  );
}

interface EditorPanelProps {
  resume: Resume;
  profile: Profile;
  job: Job | null;
  isLoadingJob: boolean;
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
}

export function EditorPanel({
  resume,
  profile,
  job,
  isLoadingJob,
  onResumeChange,
}: EditorPanelProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);


  return (
    <div className="flex flex-col mr-4  relative h-full max-h-full">
      
      {/* Main Editor Area */}
      <div className="flex-1  flex flex-col overflow-scroll">
        
        {/* Scroll Area */}
        <ScrollArea className="flex-1 pr-2" ref={scrollAreaRef}>
          <div className="relative pb-12">
            {/* Make the actions sticky */}
            <div className={cn(
              "sticky top-0 z-20 backdrop-blur-sm",
              resume.is_base_resume
                ? "bg-purple-50/80"
                : "bg-pink-100/90 shadow-sm shadow-pink-200/50"
            )}>
              <div className="flex flex-col gap-4">
                <ResumeEditorActions
                  onResumeChange={onResumeChange}
                />
              </div>
            </div>

            <Accordion type="single" collapsible defaultValue="basic" className="mt-6">
              {/* Tailored Job Section */}
              <TailoredJobAccordion
                resume={resume}
                job={job}
                isLoading={isLoadingJob}
              />

              {/* Basic Info */}
              <AccordionItem value="basic" className="mb-4 backdrop-blur-xl rounded-lg shadow-lg bg-white border border-purple-600/50 border-2">
                <AccordionHeader
                  icon={User}
                  label="Basic Info"
                  iconColor="text-purple-600"
                  bgColor="bg-purple-100/80"
                  textColor="text-purple-900"
                />
                <AccordionContent className="px-4 pt-2 pb-4">
                  <BasicInfoForm
                    profile={profile}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Work Experience */}
              <AccordionItem value="work" className="mb-4 backdrop-blur-xl rounded-lg shadow-lg bg-white border border-cyan-600/50 border-2">
                <AccordionHeader
                  icon={Briefcase}
                  label="Work Experience"
                  iconColor="text-cyan-600"
                  bgColor="bg-cyan-100/80"
                  textColor="text-cyan-900"
                />
                <AccordionContent className="px-4 pt-2 pb-4">
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
              <AccordionItem value="projects" className="mb-4 backdrop-blur-xl rounded-lg shadow-lg bg-white border border-violet-600/50 border-2">
                <AccordionHeader
                  icon={FolderGit2}
                  label="Projects"
                  iconColor="text-violet-600"
                  bgColor="bg-violet-100/80"
                  textColor="text-violet-900"
                />
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
              <AccordionItem value="education" className="mb-4 backdrop-blur-xl rounded-lg shadow-lg bg-white border border-indigo-600/50 border-2">
                <AccordionHeader
                  icon={GraduationCap}
                  label="Education"
                  iconColor="text-indigo-600"
                  bgColor="bg-indigo-100/80"
                  textColor="text-indigo-900"
                />
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
              <AccordionItem value="skills" className="mb-4 backdrop-blur-xl rounded-lg shadow-lg bg-white border border-rose-600/50 border-2">
                <AccordionHeader
                  icon={Wrench}
                  label="Skills"
                  iconColor="text-rose-600"
                  bgColor="bg-rose-100/80"
                  textColor="text-rose-900"
                />
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
              <AccordionItem value="settings" className="mb-4 backdrop-blur-xl rounded-lg shadow-lg bg-white border border-gray-600/50 border-2">
                <AccordionHeader
                  icon={LayoutTemplate}
                  label="Document Settings"
                  iconColor="text-gray-600"
                  bgColor="bg-gray-100/80"
                  textColor="text-gray-900"
                />
                <AccordionContent className="px-4 pt-2 pb-4">
                  <Suspense fallback={
                    <div className="space-y-4 animate-pulse">
                      <div className="h-8 bg-muted rounded-md w-1/3" />
                      <div className="h-24 bg-muted rounded-md" />
                    </div>
                  }>

       


              <DocumentSettingsForm
                documentSettings={resume.document_settings!}
                    onChange={(_field: 'document_settings', value: DocumentSettings) => {
                      onResumeChange('document_settings', value);
                    }}
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
        "absolute w-full bottom-0 rounded-lg border`", 
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