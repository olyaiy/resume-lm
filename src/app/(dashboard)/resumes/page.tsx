import { getDashboardData } from "@/utils/actions";
import { ResumeList } from "@/components/resume/management/cards/resume-list";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { cn } from "@/lib/utils";

// Constants for styling
const BASE_ACCENT = {
  bg: "purple-50",
  border: "purple-200",
  hover: "purple-300",
  text: "purple-600"
};

const TAILORED_ACCENT = {
  bg: "pink-50",
  border: "pink-200",
  hover: "pink-300",
  text: "pink-600"
};

export default async function ResumesPage() {
  const { baseResumes, tailoredResumes } = await getDashboardData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50">
      <DashboardHeader />
      
      {/* Main Content */}
      <div className="container max-w-7xl mx-auto p-6 space-y-8 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#f3e8ff20_0%,transparent_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_0%_400px,#fce7f320_0%,transparent_100%)] pointer-events-none" />
        
        {/* Resume Grid Container */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Base Resumes Section */}
          <section className="space-y-6 relative group">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className={cn(
                  "text-2xl font-semibold tracking-tight",
                  "bg-gradient-to-r from-purple-600 to-indigo-600",
                  "bg-clip-text text-transparent"
                )}>Base Resumes</h2>
                <p className="text-sm text-purple-600/60">Your foundation templates</p>
              </div>
              <Link
                href="/"
                className={cn(
                  "inline-flex items-center justify-center",
                  "rounded-full text-sm font-medium",
                  "transition-all duration-500",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-purple-500 focus-visible:ring-offset-2",
                  "disabled:opacity-50 disabled:pointer-events-none",
                  "bg-gradient-to-r from-purple-600 to-indigo-600",
                  "text-white hover:shadow-lg hover:shadow-purple-500/25",
                  "hover:-translate-y-0.5",
                  "h-10 px-6"
                )}
              >
                Create Base Resume
              </Link>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-white/40 border border-purple-200/50 shadow-xl shadow-purple-500/10 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-purple-500/20">
              <Suspense fallback={<ResumesLoadingSkeleton />}>
                <ResumeList
                  resumes={baseResumes}
                  type="base"
                  accentColor={BASE_ACCENT}
                  title="Base Resumes"
                  emptyMessage={
                    <div className="text-center p-8 border border-dashed rounded-xl border-purple-200 bg-purple-50/50">
                      <p className="text-purple-600 font-medium">No base resumes yet</p>
                      <p className="text-sm text-purple-600/60 mt-1">
                        Create a base resume to get started
                      </p>
                    </div>
                  }
                  className="grid gap-4 grid-cols-1 p-6"
                  itemClassName="h-[200px]"
                />
              </Suspense>
            </div>
          </section>

          {/* Tailored Resumes Section */}
          <section className="space-y-6 relative group">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className={cn(
                  "text-2xl font-semibold tracking-tight",
                  "bg-gradient-to-r from-pink-600 to-rose-600",
                  "bg-clip-text text-transparent"
                )}>Tailored Resumes</h2>
                <p className="text-sm text-pink-600/60">Job-specific versions</p>
              </div>
              <Link
                href="/jobs"
                className={cn(
                  "inline-flex items-center justify-center",
                  "rounded-full text-sm font-medium",
                  "transition-all duration-500",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-pink-500 focus-visible:ring-offset-2",
                  "disabled:opacity-50 disabled:pointer-events-none",
                  "bg-gradient-to-r from-pink-600 to-rose-600",
                  "text-white hover:shadow-lg hover:shadow-pink-500/25",
                  "hover:-translate-y-0.5",
                  "h-10 px-6"
                )}
              >
                Browse Jobs
              </Link>
            </div>

            <div className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-white/40 border border-pink-200/50 shadow-xl shadow-pink-500/10 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-pink-500/20">
              <Suspense fallback={<ResumesLoadingSkeleton />}>
                <ResumeList
                  resumes={tailoredResumes}
                  type="tailored"
                  accentColor={TAILORED_ACCENT}
                  title="Tailored Resumes"
                  emptyMessage={
                    <div className="text-center p-8 border border-dashed rounded-xl border-pink-200 bg-pink-50/50">
                      <p className="text-pink-600 font-medium">No tailored resumes yet</p>
                      <p className="text-sm text-pink-600/60 mt-1">
                        Browse jobs to create tailored resumes
                      </p>
                    </div>
                  }
                  className="grid gap-4 grid-cols-1 p-6"
                  itemClassName="h-[200px]"
                />
              </Suspense>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ResumesLoadingSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {[1, 2, 3].map((i) => (
        <Skeleton 
          key={i} 
          className="w-full h-[200px] rounded-xl bg-gradient-to-r from-gray-200/50 to-gray-100/50" 
        />
      ))}
    </div>
  );
}
