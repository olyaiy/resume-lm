import { Skeleton } from "@/components/ui/skeleton";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Loading() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-teal-200/20 to-cyan-200/20 blur-3xl animate-blob opacity-70" />
        <div className="absolute top-[20%] -right-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-200/20 to-indigo-200/20 blur-3xl animate-blob animation-delay-2000 opacity-70" />
        <div className="absolute -bottom-[40%] left-[20%] w-[75%] h-[75%] rounded-full bg-gradient-to-br from-pink-200/20 to-rose-200/20 blur-3xl animate-blob animation-delay-4000 opacity-70" />
      </div>

      {/* Top Bar */}
    
      {/* Main Content */}
      <div className="relative min-h-screen pt-24 px-6 md:px-8 lg:px-10 pb-10">
        <div className="max-w-[2000px] mx-auto h-[calc(100vh-120px)]">
          <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg">
            {/* Editor Panel */}
            <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
              <ScrollArea className="h-full">
                <div className="space-y-6 pr-4 pb-6">
                  {/* Tabs Skeleton */}
                  <div className="w-full">
                    <div className="@container">
                      <div className="w-full h-[60px] grid grid-cols-3 @[500px]:grid-cols-6 gap-1.5 bg-gradient-to-r from-white/40 via-white/50 to-white/40 backdrop-blur-md border border-white/40 rounded-xl p-1.5 shadow-lg shadow-teal-500/5">
                        {[...Array(6)].map((_, i) => (
                          <Skeleton key={i} className="h-11 rounded-lg" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Form Fields Skeleton */}
                  <div className="space-y-8 mt-8">
                    {/* Basic Info Section */}
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-48 mb-6" />
                      <div className="grid grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact Info Section */}
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-48 mb-6" />
                      <div className="grid grid-cols-2 gap-6">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Links Section */}
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-48 mb-6" />
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-10 w-10" />
                          <Skeleton className="h-10 flex-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </ResizablePanel>

            {/* Resize Handle */}
            <ResizableHandle withHandle />

            {/* Preview Panel */}
            <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
              <ScrollArea className="h-full">
                <div className="relative pb-[129.4%] w-full">
                  <div className="absolute inset-0 p-6">
                    {/* Resume Preview Skeleton */}
                    <div className="w-full h-full bg-white rounded-lg shadow-xl p-8 space-y-6">
                      {/* Header */}
                      <div className="space-y-4">
                        <Skeleton className="h-12 w-72" />
                        <div className="flex gap-4">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-5 w-48" />
                        </div>
                      </div>

                      {/* Experience Section */}
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-48" />
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="space-y-2">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-5/6" />
                          </div>
                        ))}
                      </div>

                      {/* Skills Section */}
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-48" />
                        <div className="grid grid-cols-3 gap-4">
                          {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-8" />
                          ))}
                        </div>
                      </div>

                      {/* Education Section */}
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-48" />
                        {[...Array(2)].map((_, i) => (
                          <div key={i} className="space-y-2">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </main>
  );
} 