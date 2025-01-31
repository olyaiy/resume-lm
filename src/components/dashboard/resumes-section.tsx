'use client';

import { Trash2, Copy, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { MiniResumePreview } from '@/components/resume/shared/mini-resume-preview';
import { CreateResumeDialog } from '@/components/resume/management/dialogs/create-resume-dialog';
import { ResumeSortControls, type SortOption, type SortDirection } from '@/components/resume/management/resume-sort-controls';
import type { Profile, Resume } from '@/lib/types';
import { deleteResume, copyResume } from '@/utils/actions';

interface ResumesSectionProps {
  type: 'base' | 'tailored';
  resumes: Resume[];
  profile: Profile;
  sortParam: string;
  directionParam: string;
  currentSort: SortOption;
  currentDirection: SortDirection;
  baseResumes?: Resume[]; // Only needed for tailored type
}

export function ResumesSection({ 
  type,
  resumes,
  profile,
  sortParam,
  directionParam,
  currentSort,
  currentDirection,
  baseResumes = []
}: ResumesSectionProps) {
  const config = {
    base: {
      gradient: 'from-purple-600 to-indigo-600',
      border: 'border-purple-300',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      icon: FileText,
      accent: {
        bg: 'purple-100',
        hover: 'purple-100/50'
      }
    },
    tailored: {
      gradient: 'from-pink-600 to-rose-600',
      border: 'border-pink-300',
      bg: 'bg-pink-50',
      text: 'text-pink-600',
      icon: Sparkles,
      accent: {
        bg: 'pink-100',
        hover: 'pink-100/50'
      }
    }
  }[type];

  return (
    <div className="relative">
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
        <h2 className={`text-2xl sm:text-3xl font-semibold tracking-tight bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
          {type === 'base' ? 'Base' : 'Tailored'} Resumes
        </h2>
        <div className="flex items-center gap-2">
          <ResumeSortControls 
            sortParam={sortParam}
            directionParam={directionParam}
            currentSort={currentSort}
            currentDirection={currentDirection}
          />
        </div>
      </div>

      <div className="relative pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {resumes.map((resume) => (
            <div key={resume.id} className="group relative">
              <AlertDialog>
                <div className="relative">
                  <Link href={`/resumes/${resume.id}`}>
                    <MiniResumePreview
                      name={resume.name}
                      type={type}
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
          <CreateResumeDialog 
            type={type} 
            profile={profile}
            {...(type === 'tailored' && { baseResumes })}
          >
            <button className={`aspect-[8.5/11] rounded-lg border-2 border-dashed ${config.border} ${config.bg}/50 hover:${config.accent.hover} transition-colors flex flex-col items-center justify-center gap-2 group`}>
              <div className={`h-8 w-8 rounded-full ${config.accent.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <config.icon className={`h-4 w-4 ${config.text}`} />
              </div>
              <span className={`text-sm font-medium ${config.text}`}>
                Create {type === 'base' ? 'Base' : 'Tailored'} Resume
              </span>
            </button>
          </CreateResumeDialog>
          {resumes.length === 0 && resumes.length + 1 < 4 && (
            <div className="col-span-2 md:col-span-1" />
          )}
        </div>
      </div>
    </div>
  );
} 