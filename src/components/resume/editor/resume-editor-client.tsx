
'use client';


import React from 'react';

import { updateResume, deleteResume } from "@/utils/actions";
import { Resume, Profile } from "@/lib/types";
import { useState, useRef, useEffect, useMemo, useReducer } from "react";
import { WorkExperienceForm } from "@/components/resume/editor/forms/work-experience-form";
import { EducationForm } from "@/components/resume/editor/forms/education-form";
import { SkillsForm } from "@/components/resume/editor/forms/skills-form";
import { ProjectsForm } from "@/components/resume/editor/forms/projects-form";
import { CertificationsForm } from "@/components/resume/editor/forms/certifications-form";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { BasicInfoForm } from "@/components/resume/editor/forms/basic-info-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { DocumentSettingsForm } from "@/components/resume/editor/forms/document-settings-form";
import { ResumeEditorTabs } from "./header/resume-editor-tabs";
import { TailoredJobCard } from "../management/cards/tailored-job-card";
import { ResumeEditorHeader } from "./header/resume-editor-header";
import ChatBot from "../assistant/chatbot";
import { ResumePreview } from "./preview/resume-preview";
import { ResumeContext, resumeReducer } from './resume-editor-context';



interface ResumeEditorClientProps {
  initialResume: Resume;
  profile: Profile;
}

export function ResumeEditorClient({
  initialResume,
  profile,
}: ResumeEditorClientProps) {
  // Convert initial resume data to use single date string format
  const convertedInitialResume = useMemo(() => ({
    ...initialResume,
    work_experience: initialResume.work_experience?.map(exp => ({
      ...exp,
      date: exp.date || ''
    })),
    education: initialResume.education?.map(edu => ({
      ...edu,
      date: edu.date || ''
    })),
    projects: initialResume.projects?.map(project => ({
      ...project,
      date: project.date || ''
    })),
    document_settings: initialResume.document_settings || {
      document_font_size: 10,
      document_line_height: 1.5,
      document_margin_vertical: 36,
      document_margin_horizontal: 36,
      header_name_size: 24,
      header_name_bottom_spacing: 24,
      skills_margin_top: 2,
      skills_margin_bottom: 2,
      skills_margin_horizontal: 0,
      skills_item_spacing: 2,
      experience_margin_top: 2,
      experience_margin_bottom: 2,
      experience_margin_horizontal: 0,
      experience_item_spacing: 4,
      projects_margin_top: 2,
      projects_margin_bottom: 2,
      projects_margin_horizontal: 0,
      projects_item_spacing: 4,
      education_margin_top: 2,
      education_margin_bottom: 2,
      education_margin_horizontal: 0,
      education_item_spacing: 4
    }
  }), [initialResume]);

  const [state, dispatch] = useReducer(resumeReducer, {
    resume: convertedInitialResume,
    isSaving: false,
    isDeleting: false,
    hasUnsavedChanges: false
  });

  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [previewPanelWidth, setPreviewPanelWidth] = useState<number>(0);
  const previewPanelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const debouncedResume = useDebouncedValue(state.resume, 500);

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
      console.error('Delete error:', error);
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
    const hasChanges = JSON.stringify(state.resume) !== JSON.stringify(convertedInitialResume);
    dispatch({ type: 'SET_HAS_CHANGES', value: hasChanges });
  }, [state.resume, convertedInitialResume]);

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

  return (
    <ResumeContext.Provider value={{ state, dispatch }}>
      <main className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50">
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

        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-teal-200/20 to-cyan-200/20 blur-3xl animate-blob opacity-70" />
          <div className="absolute top-[20%] -right-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-200/20 to-indigo-200/20 blur-3xl animate-blob animation-delay-2000 opacity-70" />
          <div className="absolute -bottom-[40%] left-[20%] w-[75%] h-[75%] rounded-full bg-gradient-to-br from-pink-200/20 to-rose-200/20 blur-3xl animate-blob animation-delay-4000 opacity-70" />
        </div>

        <ResumeEditorHeader
          resume={state.resume}
          isSaving={state.isSaving}
          isDeleting={state.isDeleting}
          hasUnsavedChanges={state.hasUnsavedChanges}
          onSave={handleSave}
          onDelete={handleDelete}
          onResumeChange={updateField}
        />

        {/* Main Content */}
        <div className="relative min-h-screen pt-24 px-6 md:px-8 lg:px-10 pb-10">
          <div className="max-w-[2000px] mx-auto h-[calc(100vh-120px)]">
            <ResizablePanelGroup
              direction="horizontal"
              className="h-full rounded-lg"
            >
              {/* Editor Panel */}
              <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                <div className="flex flex-col h-full mr-4">
                  {/* Main Editor Area */}
                  <ScrollArea className="flex-1">
                    <div className="space-y-6 pr-4 pb-6">
                      <Tabs defaultValue="basic" className="w-full">
                        <ResumeEditorTabs />

                        <TabsContent value="basic" className="space-y-6 mt-6">
                          {!state.resume.is_base_resume && (
                            <TailoredJobCard jobId={state.resume.job_id || ''} />
                          )}
                          <BasicInfoForm
                            profile={profile}
                          />
                        </TabsContent>

                        <TabsContent value="work" className="space-y-6 mt-6">
                          <WorkExperienceForm
                            experiences={state.resume.work_experience}
                            onChange={(experiences) => updateField('work_experience', experiences)}
                            profile={profile}
                            targetRole={state.resume.target_role}
                          />
                        </TabsContent>

                        <TabsContent value="projects" className="space-y-6 mt-6">
                          <ProjectsForm
                            projects={state.resume.projects}
                            onChange={(projects) => updateField('projects', projects)}
                            profile={profile}
                          />
                        </TabsContent>

                        <TabsContent value="education" className="space-y-6 mt-6">
                          <EducationForm
                            education={state.resume.education}
                            onChange={(education) => updateField('education', education)}
                            profile={profile}
                          />
                          <CertificationsForm
                            certifications={state.resume.certifications}
                            onChange={(certifications) => updateField('certifications', certifications)}
                          />
                        </TabsContent>

                        <TabsContent value="skills" className="space-y-6 mt-6">
                          <SkillsForm
                            skills={state.resume.skills}
                            onChange={(skills) => updateField('skills', skills)}
                            profile={profile}
                          />
                        </TabsContent>

                        <TabsContent value="settings" className="space-y-6 mt-6">
                          <DocumentSettingsForm
                            resume={state.resume}
                            onChange={updateField}
                          />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </ScrollArea>
                  <ChatBot resume={state.resume} onResumeChange={updateField} />
                </div>
              </ResizablePanel>

              {/* Resize Handle */}
              <ResizableHandle withHandle />

              {/* Preview Panel */}
              <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                <ScrollArea className="h-full pr-4">
                  <div className="relative pb-[129.4%] w-full" ref={previewPanelRef}>
                    <div className="absolute inset-0">
                      <ResumePreview resume={debouncedResume} containerWidth={previewPanelWidth} />
                    </div>
                  </div>
                </ScrollArea>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </main>
    </ResumeContext.Provider>
  );
} 