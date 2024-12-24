import { redirect } from "next/navigation";
import { ResumeEditor } from "@/components/resume/resume-editor";
import { ResumePreview } from "@/components/resume/resume-preview";
import { getResumeById } from "@/utils/supabase/actions";

export default async function ResumeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const resume = await getResumeById(id);

    return (
      <main className="min-h-screen p-6 md:p-8 lg:p-10 relative">
        {/* Gradient Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px]" />
        </div>

        {/* Main Content */}
        <div className="max-w-[2000px] mx-auto relative z-10">
          <h1 className="text-3xl font-semibold mb-6 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Resume Editor
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editor Column */}
            <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              <ResumeEditor 
                resume={resume}
                onChange={async (updatedResume) => {
                  'use server';
                  // TODO: Implement save functionality
                }}
              />
            </div>

            {/* Preview Column */}
            <div className="sticky top-8 overflow-y-auto max-h-[calc(100vh-200px)]">
              <ResumePreview resume={resume} />
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'User not authenticated') {
      redirect("/auth/login");
    }
    redirect("/");
  }
} 