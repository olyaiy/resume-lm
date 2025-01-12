"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileCard } from "./profile-card";
import { MiniResumePreview } from "@/components/resume/shared/mini-resume-preview";

interface FlowCardProps {
  title: string;
  description: string;
  type?: "profile" | "base" | "tailored";
  className?: string;
}

function FlowArrow({ direction = "right", className }: { direction?: "right" | "down"; className?: string }) {
  return (
    <div className={cn(
      "flex items-center justify-center w-12",
      direction === "down" && "rotate-90",
      className
    )}>
      <div className="flex items-center w-full">
        <div className="h-[2px] flex-1 bg-muted-foreground -mr-2" />
        <ArrowRight className="w-6 h-6 text-muted-foreground flex-shrink-0" />
      </div>
    </div>
  );
}

function FlowCard({ title, description, type = "base", className }: FlowCardProps) {
  if (type === "profile") {
    return <ProfileCard title={title} description={description} className={className} />;
  }

  return (
    <MiniResumePreview
      name={title}
      type={type}
      className={className}
    />
  );
}

export function HowItWorks() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
            How ResumeLM Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Create tailored resumes in minutes with AI-powered optimization
          </p>
        </div>

        {/* Flow Diagram - Horizontal Layout */}
        <div className="relative mt-12">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8 max-w-[1600px] mx-auto">
            {/* Profile Section */}
            <div className="flex flex-col items-center">
              <FlowCard
                type="profile"
                title="Your Profile"
                description="Store all your professional experience, skills, and achievements in one place"
                className="w-64"
              />
            </div>

            {/* Arrow Right */}
            <div className="hidden lg:block">
              <FlowArrow />
            </div>
            
            {/* Arrow Down for Mobile */}
            <div className="block lg:hidden">
              <FlowArrow direction="down" />
            </div>

            {/* Base Resumes Section */}
            <div className="flex flex-col items-center gap-4">
              <FlowCard
                type="base"
                title="Software Engineer"
                description="Curate relevant experience for software roles"
                className="w-48"
              />
              <FlowCard
                type="base"
                title="Product Manager"
                description="Highlight leadership and product skills"
                className="w-48"
              />
            </div>

            {/* Arrow Right */}
            <div className="hidden lg:block">
            <div className="flex flex-col items-center gap-52">

              <FlowArrow />
              <FlowArrow />
              </div>
            </div>
            
            {/* Arrow Down for Mobile */}
            <div className="block lg:hidden">
              <FlowArrow direction="down" />
            </div>

            {/* Tailored Resumes Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-24">
              <FlowCard
                type="tailored"
                title="Frontend Dev at Google"
                description="Tailored for Google's frontend position"
                className="w-48"
              />
              <FlowCard
                type="tailored"
                title="Full Stack at Meta"
                description="Customized for Meta's requirements"
                className="w-48"
              />
              <FlowCard
                type="tailored"
                title="PM at Amazon"
                description="Aligned with Amazon's leadership principles"
                className="w-48"
              />
              <FlowCard
                type="tailored"
                title="PM at Microsoft"
                description="Focused on Microsoft's PM expectations"
                className="w-48"
              />
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px]" />
          <div className="absolute top-[25%] left-[25%] w-96 h-96 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-[25%] right-[25%] w-96 h-96 bg-gradient-to-br from-purple-200/20 to-indigo-200/20 rounded-full blur-3xl" />
        </div>
      </div>
    </section>
  );
} 