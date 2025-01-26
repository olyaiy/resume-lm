/**
 * Home Page Component
 * 
 * This is the main dashboard page of the Resume AI application. It displays:
 * - User profile information
 * - Quick stats (profile score, resume counts, job postings)
 * - Base resume management
 * - Tailored resume management
 * 
 * The page implements a soft gradient minimalism design with floating orbs
 * and mesh overlay for visual interest.
 */

import { redirect } from "next/navigation";

import { getDashboardData, deleteResume, copyResume } from "../utils/actions";
import { FileText, Sparkles, User, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MiniResumePreview } from "@/components/resume/shared/mini-resume-preview";
import { ProfileRow } from "@/components/dashboard/profile-row";
import Link from "next/link";
import { CreateResumeDialog } from "@/components/resume/management/dialogs/create-resume-dialog";
import { WelcomeDialog } from "@/components/dashboard/welcome-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { ApiKeyAlert } from "@/components/dashboard/api-key-alert";
import { ResumeSortControls, type SortOption, type SortDirection } from "@/components/resume/management/resume-sort-controls";
import type { Resume } from "@/lib/types";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  // Check if user is coming from confirmation
  const params = await searchParams;
  const isNewSignup = params?.type === 'signup' && params?.token_hash;

  // Fetch dashboard data and handle authentication
  let data;
  try {
    data = await getDashboardData();
    if (!data.profile) {
      redirect("/auth/login");
    }
  } catch {
    // Redirect to login if error occurs
    redirect("/auth/login");
  }

  const { profile, baseResumes: unsortedBaseResumes, tailoredResumes: unsortedTailoredResumes } = data;

  // Get sort parameters for both sections
  const baseSort = (params.baseSort as SortOption) || 'updatedAt';
  const baseDirection = (params.baseDirection as SortDirection) || 'desc';
  const tailoredSort = (params.tailoredSort as SortOption) || 'updatedAt';
  const tailoredDirection = (params.tailoredDirection as SortDirection) || 'desc';

  // Sort function
  function sortResumes(resumes: Resume[], sort: SortOption, direction: SortDirection) {
    return [...resumes].sort((a, b) => {
      const modifier = direction === 'asc' ? 1 : -1;
      switch (sort) {
        case 'name':
          return modifier * a.name.localeCompare(b.name);
        case 'jobTitle':
          return modifier * ((a.target_role || '').localeCompare(b.target_role || '') || 0);
        case 'updatedAt':
        default:
          return modifier * (new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      }
    });
  }

  // Sort both resume lists
  const baseResumes = sortResumes(unsortedBaseResumes, baseSort, baseDirection);
  const tailoredResumes = sortResumes(unsortedTailoredResumes, tailoredSort, tailoredDirection);

  // Display a friendly message if no profile exists
  if (!profile) {
    return (
      <main className="min-h-screen p-6 md:p-8 lg:p-10 relative flex items-center justify-center">
        <Card className="max-w-md w-full p-8 bg-white/80 backdrop-blur-xl border-white/40 shadow-2xl">
          <div className="text-center space-y-4">
            <User className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-semibold text-gray-800">Profile Not Found</h2>
            <p className="text-muted-foreground">
              We couldn&apos;t find your profile information. Please contact support for assistance.
            </p>
            <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
              Contact Support
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    
    <main className="min-h-screen relative">

      {/* Welcome Dialog for New Signups */}
      <WelcomeDialog isOpen={!!isNewSignup} />
      
      {/* Gradient Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px]" />
        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-indigo-200/20 rounded-full blur-3xl animate-float-slower" />
      </div>

      {/* Content */}
      <div className="relative z-10">
      {/* Profile Row Component */}
      <ProfileRow profile={profile} />
        
        <div className="container max-w-7xl mx-auto xl:px-0 lg:px-4 md:px-4 sm:px-6 pt-4 ">  
          {/* Profile Overview */}
          <div className="mb-6 space-y-4">
            {/* API Key Alert */}
            <ApiKeyAlert />
            
            {/* Greeting & Edit Button */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  {getGreeting()}, {profile.first_name}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Welcome to your resume dashboard
                </p>
              </div>
            </div>

            

            {/* Resume Bookshelf */}
            <div className="">
              {/* Base Resumes Section */}
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
                                'use server';
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
                                'use server';
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

              {/* Thin Divider */}
              <div className="relative py-2">
                <div className="h-px bg-gradient-to-r from-transparent via-purple-300/30 to-transparent" />
              </div>

              {/* Tailored Resumes Section */}
              <div className="relative rounded-xl bg-gradient-to-br from-pink-50/50 to-rose-50/50">
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                    Tailored Resumes
                  </h2>
                  <div className="flex items-center gap-2">
                    <ResumeSortControls 
                      sortParam="tailoredSort"
                      directionParam="tailoredDirection"
                      currentSort={tailoredSort}
                      currentDirection={tailoredDirection}
                    />
                  </div>
                </div>

                <div className="relative pb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {tailoredResumes.map((resume) => (
                      <div key={resume.id} className="group relative">
                        <AlertDialog>
                          <div className="relative">
                            <Link href={`/resumes/${resume.id}`}>
                              <MiniResumePreview
                                name={resume.name}
                                type="tailored"
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
                                'use server';
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
                                'use server';
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
                    <CreateResumeDialog type="tailored" baseResumes={baseResumes} profile={profile}>
                      <button className="aspect-[8.5/11] rounded-lg border-2 border-dashed border-pink-300 bg-pink-50/50 hover:bg-pink-100/50 transition-colors flex flex-col items-center justify-center gap-2 group">
                        <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Sparkles className="h-4 w-4 text-pink-600" />
                        </div>
                        <span className="text-sm font-medium text-pink-600">Create Tailored Resume</span>
                      </button>
                    </CreateResumeDialog>
                    {tailoredResumes.length === 0 && tailoredResumes.length + 1 < 4 && (
                      <div className="col-span-2 md:col-span-1" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
