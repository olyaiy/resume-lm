import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function Loading() {
  return (
    <main className="min-h-screen relative">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-pink-200/20 to-violet-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-gradient-to-r from-blue-200/20 to-teal-200/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px]" />
      </div>

      {/* Main Content Layer */}
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-8 md:px-8 lg:py-12">
          {/* Header */}
          <div className="mb-8 space-y-6">
            <button 
              disabled
              className="group flex items-center text-sm font-medium text-purple-600/70 px-3 py-2 rounded-lg bg-purple-100/30 w-fit"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>

            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>
          </div>

          {/* Form Container */}
          <Card className="p-6 md:p-8 bg-white/40 backdrop-blur-md border-white/40 shadow-xl shadow-purple-500/5">
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <Skeleton className="h-7 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <Skeleton className="h-7 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Experience */}
              <div className="space-y-6">
                <Skeleton className="h-7 w-48" />
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="p-6 space-y-6 bg-white/60 border-purple-200/30">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-36" />
                      </div>
                      <Skeleton className="h-8 w-8" />
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-24 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <div className="flex flex-wrap gap-2">
                          {[...Array(4)].map((_, j) => (
                            <Skeleton key={j} className="h-8 w-24" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                <div className="flex justify-center">
                  <Skeleton className="h-10 w-48" />
                </div>
              </div>

              {/* Education */}
              <div className="space-y-6">
                <Skeleton className="h-7 w-48" />
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="p-6 space-y-6 bg-white/60 border-purple-200/30">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-36" />
                      </div>
                      <Skeleton className="h-8 w-8" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  </Card>
                ))}
                <div className="flex justify-center">
                  <Skeleton className="h-10 w-48" />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-6">
                <Skeleton className="h-7 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="p-6 space-y-4 bg-white/60 border-purple-200/30">
                      <div className="flex justify-between items-start">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[...Array(4)].map((_, j) => (
                          <Skeleton key={j} className="h-8 w-20" />
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-center">
                  <Skeleton className="h-10 w-48" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
} 