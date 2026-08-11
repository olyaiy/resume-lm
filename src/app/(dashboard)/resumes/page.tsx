import { getResumesPageData } from "@/utils/actions";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { MiniResumePreview } from "@/components/resume/shared/mini-resume-preview";
import { ResumeSortControls } from "@/components/resume/management/resume-sort-controls";
import type { SortOption, SortDirection } from "@/components/resume/management/resume-sort-controls";

const RESUMES_PER_PAGE = 12;

type SearchParams = { [key: string]: string | string[] | undefined }

export default async function ResumesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams;
  
  const currentPage = Number(params.page) || 1;
  const sort: SortOption = params.sort === 'name' || params.sort === 'jobTitle' || params.sort === 'createdAt'
    ? params.sort
    : 'createdAt';
  const direction: SortDirection = params.direction === 'asc' ? 'asc' : 'desc';
  const { resumes, totalCount } = await getResumesPageData({
    page: currentPage,
    pageSize: RESUMES_PER_PAGE,
    sort,
    direction,
  });
  const totalPages = Math.ceil(totalCount / RESUMES_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50">

      
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        {/* Header with controls */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              My Resumes
            </h1>
            <p className="text-muted-foreground">
              Manage all your resumes in one place
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Suspense>
              <ResumeSortControls />
            </Suspense>
            <Link
              href="/resumes/new"
              prefetch={false}
              className={cn(
                "inline-flex items-center justify-center",
                "rounded-full text-sm font-medium",
                "transition-all duration-500",
                "bg-gradient-to-r from-purple-600 to-pink-600",
                "text-white hover:shadow-lg hover:shadow-purple-500/25",
                "hover:-translate-y-0.5",
                "h-10 px-6"
              )}
            >
              Create Resume
            </Link>
          </div>
        </div>

        {/* Resumes Grid */}
        <div className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-white/40 border border-purple-200/50 shadow-xl">
          <Suspense fallback={<ResumesLoadingSkeleton />}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
              {resumes.map((resume) => (
                <Link href={`/resumes/${resume.id}`} prefetch={false} key={resume.id}>
                  <MiniResumePreview
                    name={resume.name}
                    type={resume.is_base_resume ? 'base' : 'tailored'}
                    target_role={resume.target_role}
                    updatedAt={resume.updated_at}
                    className="hover:-translate-y-1 transition-transform duration-300"
                  />
                </Link>
              ))}
            </div>
          </Suspense>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <Link
                key={i}
                href={`?page=${i + 1}&sort=${sort}&direction=${direction}`}
                prefetch={false}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors",
                  currentPage === i + 1
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-white/40 hover:bg-white/60"
                )}
              >
                {i + 1}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ResumesLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      {[...Array(8)].map((_, i) => (
        <Skeleton 
          key={i} 
          className="w-full aspect-[8.5/11] rounded-lg bg-gradient-to-r from-gray-200/50 to-gray-100/50" 
        />
      ))}
    </div>
  );
}
