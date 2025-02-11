'use client'

import React from 'react'
import { ResumeSortControls, type SortOption, type SortDirection } from '../resume/management/resume-sort-controls';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@radix-ui/react-alert-dialog';
import { Copy, FileText, Link, Trash2 } from 'lucide-react';
import { MiniResumePreview } from '../resume/shared/mini-resume-preview';
import { copyResume, deleteResume } from '@/utils/actions/resumes/actions';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { AlertDialogFooter } from '../ui/alert-dialog';
import { AlertDialogHeader } from '../ui/alert-dialog';
import { CreateResumeDialog } from '../resume/management/dialogs/create-resume-dialog';
import type { Resume, Profile } from '@/lib/types';


interface ResumeRowProps {
  baseResumes: Resume[];
  profile: Profile;
  baseSort: SortOption;
  baseDirection: SortDirection;
}

const resumeRow= ({ baseResumes, profile, baseSort, baseDirection }: ResumeRowProps) => {
    console.log('baseResumes', baseResumes);
    console.log('profile', profile);
    console.log('baseSort', baseSort);
    console.log('baseDirection', baseDirection);
  return (
    <div className="relative">
    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Base Resumes
      </h2>
      <div className="flex items-center gap-2">
        <ResumeSortControls 
          sortParam="baseSort"
          directionParam="baseDirection"
          currentSort={baseSort}
          currentDirection={baseDirection}
        />
      </div>
    </div>
    
    <div className="relative pb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">




        {baseResumes.map((resume) => (
          <div key={resume.id} className="group relative">
            <AlertDialog>
              <div className="relative">
                <Link href={`/resumes/${resume.id}`}>
                  <MiniResumePreview
                    name={resume.name}
                    type="base"
                    target_role={resume.target_role}
                    createdAt={resume.created_at}
                    className="hover:-translate-y-1 transition-transform duration-300"
                  />
                </Link>
                <div className="absolute bottom-2 left-2 flex gap-2">
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={cn(
                        "h-8 w-8 rounded-lg",
                        "bg-rose-50/80 hover:bg-rose-100/80",
                        "text-rose-600 hover:text-rose-700",
                        "border border-rose-200/60",
                        "shadow-sm",
                        "transition-all duration-300",
                        "hover:scale-105 hover:shadow-md",
                        "hover:-translate-y-0.5"
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <form action={async () => {
                    // 'use server';
                    await copyResume(resume.id);
                  }}>
                    <Button
                      size="icon"
                      variant="ghost"
                      type="submit"
                      className={cn(
                        "h-8 w-8 rounded-lg",
                        "bg-teal-50/80 hover:bg-teal-100/80",
                        "text-teal-600 hover:text-teal-700",
                        "border border-teal-200/60",
                        "shadow-sm",
                        "transition-all duration-300",
                        "hover:scale-105 hover:shadow-md",
                        "hover:-translate-y-0.5"
                      )}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &quot;{resume.name}&quot;? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <form action={async () => {
                    // 'use server';
                    await deleteResume(resume.id);
                  }}>
                    <AlertDialogAction
                      type="submit"
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </form>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}




        <CreateResumeDialog type="base" profile={profile}>
          <button className="aspect-[8.5/11] rounded-lg border-2 border-dashed border-purple-300 bg-purple-50/50 hover:bg-purple-100/50 transition-colors flex flex-col items-center justify-center gap-2 group">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600">Create Base Resume</span>
          </button>
        </CreateResumeDialog>
        {baseResumes.length === 0 && baseResumes.length + 1 < 4 && (
          <div className="col-span-2 md:col-span-1" />
        )}
      </div>
    </div>
  </div>
  )
}

export default resumeRow
