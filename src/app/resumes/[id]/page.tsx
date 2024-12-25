import { redirect } from "next/navigation";
import { getResumeById } from "@/utils/actions";
import { ResumeEditorClient } from "@/components/resume/resume-editor-client";
import { use } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const resume = await getResumeById(id);
    return (
      <div className="min-h-screen max-h-screen overflow-hidden relative">
        {/* Gradient Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px]" />
          {/* Animated Gradient Orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-indigo-200/20 rounded-full blur-3xl animate-float-slower" />
        </div>

        {/* Content */}
        <div className="relative z-10 ">
          <ResumeEditorClient initialResume={resume} />
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'User not authenticated') {
      redirect("/auth/login");
    }
    redirect("/");
  }
} 