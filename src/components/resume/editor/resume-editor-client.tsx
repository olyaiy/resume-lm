'use client';

import React from 'react';
import { Resume, Profile, Job } from "@/lib/types";
import { useState, useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ResumeContext, resumeReducer } from './resume-editor-context';
import { createClient } from "@/utils/supabase/client";
import { EditorLayout } from "./layout/EditorLayout";
import { EditorPanel } from './panels/editor-panel';
import { PreviewPanel } from './panels/preview-panel';
import { UnsavedChangesDialog } from './dialogs/unsaved-changes-dialog';

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

  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const debouncedResume = useDebouncedValue(state.resume, 100);
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
          void error
          setJob(null);
          return;
        }

        setJob(jobData);
      } catch {
        setJob(null);
      } finally {
        setIsLoadingJob(false);
      }
    }
    fetchJob();
  }, [state.resume.job_id]);

  const updateField = <K extends keyof Resume>(field: K, value: Resume[K]) => {
    
    if (field === 'document_settings') {
      // Ensure we're passing a valid DocumentSettings object
      if (typeof value === 'object' && value !== null) {
        dispatch({ type: 'UPDATE_FIELD', field, value });
      } else {
        console.error('Invalid document settings:', value);
      }
    } else {
      dispatch({ type: 'UPDATE_FIELD', field, value });
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



  // Editor Panel
  const editorPanel = (
    <EditorPanel
      resume={state.resume}
      profile={profile}
      job={job}
      isLoadingJob={isLoadingJob}
      onResumeChange={updateField}
    />
  );

  // Preview Panel
  const previewPanel = (width: number) => (
    <PreviewPanel
      resume={debouncedResume}
      onResumeChange={updateField}
      width={width}
    />
  );

  return (
    <ResumeContext.Provider value={{ state, dispatch }}>
      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        isOpen={showExitDialog}
        onOpenChange={setShowExitDialog}
        // pendingNavigation={pendingNavigation}
        onConfirm={() => {
          if (pendingNavigation) {
            router.push(pendingNavigation);
          }
          setShowExitDialog(false);
          setPendingNavigation(null);
        }}
      />

      {/* Editor Layout */}
      <EditorLayout
        isBaseResume={state.resume.is_base_resume}
        editorPanel={editorPanel}
        previewPanel={previewPanel}
      />
    </ResumeContext.Provider>
  );
} 