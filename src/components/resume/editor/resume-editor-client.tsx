'use client';

import React from 'react';
import { Suspense } from 'react';
import { updateResume, deleteResume } from "@/utils/actions";
import { Resume, Profile, Job } from "@/lib/types";
import { useState, useRef, useEffect, useMemo, useReducer } from "react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { BasicInfoForm } from "@/components/resume/editor/forms/basic-info-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ResumeEditorTabs } from "./header/resume-editor-tabs";
import { TailoredJobCard } from "../management/cards/tailored-job-card";
import ChatBot from "../assistant/chatbot";
import { ResumePreview } from "./preview/resume-preview";
import { ResumeContext, resumeReducer } from './resume-editor-context';
import { ResumeEditorActions } from './actions/resume-editor-actions';
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { ResumeContextMenu } from "./preview/resume-context-menu";
import { EditorLayout } from "./layout/EditorLayout";
import { LoadingFallback } from './shared/LoadingFallback';
import {
  WorkExperienceForm,
  EducationForm,
  SkillsForm,
  ProjectsForm,
  CertificationsForm,
  DocumentSettingsForm
} from './dynamic-components';

interface ResumeEditorClientProps {
  initialResume: Resume;
  profile: Profile;
}

export function ResumeEditorClient({
  initialResume,
  profile,
}: ResumeEditorClientProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(resumeReducer, {
    resume: initialResume,
    isSaving: false,
    isDeleting: false,
    hasUnsavedChanges: false
  });

  const [previewPanelWidth, setPreviewPanelWidth] = useState(0);
  const previewPanelRef = useRef<HTMLDivElement>(null);

  // Track PDF preview initialization
  useEffect(() => {
    if (previewPanelRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setPreviewPanelWidth(entry.contentRect.width);
        }
      });

      resizeObserver.observe(previewPanelRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const debouncedResume = useDebouncedValue(state.resume, 500);

  const [job, setJob] = useState<Job | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(false);

  // Single job fetching effect
  useEffect(() => {
    async function fetchJob() {
      if (!state.resume.job_id) {
        setJob(null);
        return;
      }

      try {
        setIsLoadingJob(true);
        const supabase = createClient();
        const { data: jobData, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', state.resume.job_id)
          .single();

        if (error) {
          setJob(null);
          return;
        }

        setJob(jobData);
      } catch (error) {
        setJob(null);
      } finally {
        setIsLoadingJob(false);
      }
    }
    fetchJob();
  }, [state.resume.job_id]);

  const updateField = <K extends keyof Resume>(field: K, value: Resume[K]) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  const handleSave = async () => {
    try {
      dispatch({ type: 'SET_SAVING', value: true });
      await updateResume(state.resume.id, state.resume);
      toast({
        title: "Changes saved",
        description: "Your resume has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unable to save your changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: 'SET_SAVING', value: false });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch({ type: 'SET_DELETING', value: true });
      await deleteResume(state.resume.id);
      toast({
        title: "Resume deleted",
        description: "Your resume has been permanently removed.",
      });
      router.push('/');
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unable to delete your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: 'SET_DELETING', value: false });
    }
  };

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(state.resume) !== JSON.stringify(initialResume);
    dispatch({ type: 'SET_HAS_CHANGES', value: hasChanges });
  }, [state.resume, initialResume]);

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.hasUnsavedChanges]);

  const handleJobCreate = (jobId: string) => {
    // Update the resume with the new job ID
    const updatedResume = {
      ...state.resume,
      job_id: jobId
    };
    dispatch({ type: 'UPDATE_FIELD', field: 'job_id', value: jobId });
    
    // Save the changes to the database
    updateResume(state.resume.id, updatedResume).catch(error => {
      toast({
        title: "Update failed",
        description: "Failed to link the new job to your resume.",
        variant: "destructive",
      });
    });
  };

  const editorPanel = (
    <div className="flex flex-col h-full mr-4">
      {/* Main Editor Area */}
      <div className="flex-1 overflow-hidden flex flex-col h-full">
        <ScrollArea className="flex-1 pr-2">
          <Tabs defaultValue="basic" className="relative">
            {/* Make the actions and tabs sticky */}
            <div className={cn(
              "sticky top-0 z-20 backdrop-blur-sm",
              state.resume.is_base_resume
                ? "bg-purple-50/80"
                : "bg-pink-100/90 shadow-sm shadow-pink-200/50"
            )}>
              <ResumeEditorActions
                resume={state.resume}
                isSaving={state.isSaving}
                isDeleting={state.isDeleting}
                onSave={handleSave}
                onDelete={handleDelete}
                onResumeChange={updateField}
              />
              <ResumeEditorTabs />
            </div>

            {/* Tab content below */}
            <TabsContent value="basic" className={cn(
              "space-y-6 mt-6 rounded-lg p-4",
              state.resume.is_base_resume
                ? "bg-purple-50/30"
                : "bg-pink-50/60 shadow-sm shadow-pink-200/20"
            )}>
              {!state.resume.is_base_resume && (
                <TailoredJobCard 
                  jobId={state.resume.job_id || null}
                  onJobCreate={handleJobCreate}
                  job={job}
                  isLoading={isLoadingJob}
                />
              )}
              <BasicInfoForm
                profile={profile}
              />
            </TabsContent>

            <TabsContent value="work" className={cn(
              "space-y-6 mt-6 rounded-lg p-4",
              state.resume.is_base_resume
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
                  experiences={state.resume.work_experience}
                  onChange={(experiences) => updateField('work_experience', experiences)}
                  profile={profile}
                  targetRole={state.resume.target_role}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="projects" className={cn(
              "space-y-6 mt-6 rounded-lg p-4",
              state.resume.is_base_resume
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
                  projects={state.resume.projects}
                  onChange={(projects) => updateField('projects', projects)}
                  profile={profile}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="education" className={cn(
              "space-y-6 mt-6 rounded-lg p-4",
              state.resume.is_base_resume
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
                  education={state.resume.education}
                  onChange={(education) => updateField('education', education)}
                  profile={profile}
                />
              </Suspense>
              <CertificationsForm
                certifications={state.resume.certifications}
                onChange={(certifications) => updateField('certifications', certifications)}
              />
            </TabsContent>

            <TabsContent value="skills" className={cn(
              "space-y-6 mt-6 rounded-lg p-4",
              state.resume.is_base_resume
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
                  skills={state.resume.skills}
                  onChange={(skills) => updateField('skills', skills)}
                  profile={profile}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="settings" className={cn(
              "space-y-6 mt-6 rounded-lg p-4",
              state.resume.is_base_resume
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
                  resume={state.resume}
                  onChange={updateField}
                />
              </Suspense>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>
      {/* Fixed ChatBot at bottom */}
      <div className={cn(
        "mt-auto mb-4 rounded-lg border",
        state.resume.is_base_resume
          ? "bg-purple-50/50 border-purple-200/40"
          : "bg-pink-50/80 border-pink-300/50 shadow-sm shadow-pink-200/20"
      )}>
        <ChatBot 
          resume={state.resume} 
          onResumeChange={updateField}
          job={job}
        />
      </div>
    </div>
  );

  const previewPanel = (
    <ScrollArea className={cn(
      "h-full pr-4 rounded-lg",
      state.resume.is_base_resume
        ? "bg-purple-50/30"
        : "bg-pink-50/60 shadow-sm shadow-pink-200/20"
    )}>
      <div className="relative pb-[129.4%] w-full" ref={previewPanelRef}>
        <div className="absolute inset-0">
          <ResumeContextMenu resume={debouncedResume}>
            <ResumePreview resume={debouncedResume} containerWidth={previewPanelWidth} />
          </ResumeContextMenu>
        </div>
      </div>
    </ScrollArea>
  );

  return (
    <ResumeContext.Provider value={{ state, dispatch }}>
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowExitDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingNavigation) {
                  router.push(pendingNavigation);
                }
                setShowExitDialog(false);
                setPendingNavigation(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Leave Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditorLayout
        isBaseResume={state.resume.is_base_resume}
        editorPanel={editorPanel}
        previewPanel={previewPanel}
      />
    </ResumeContext.Provider>
  );
} 