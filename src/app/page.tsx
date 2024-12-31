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

import { getDashboardData } from "../utils/actions";
import { User, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileCard } from "@/components/profile/profile-card";
import { ResumeManagementCard } from "@/components/resume/resume-management-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { JobListingsCard } from "@/components/jobs/job-listings-card";

export default async function Home() {
  // Fetch dashboard data and handle authentication
  let data;
  try {
    data = await getDashboardData();
  } catch {
    // Redirect to login if not authenticated or error occurs
    redirect("/auth/login");
  }

  const { profile, baseResumes, tailoredResumes } = data;

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
      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-pink-200/20 to-violet-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-gradient-to-r from-blue-200/20 to-teal-200/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px]" />
      </div>

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <DashboardHeader firstName={profile.first_name} />

        {/* Main Dashboard Content */}
        <div className="flex-1 px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="relative max-w-[1800px] mx-auto space-y-6 md:space-y-8">
            {/* Main Row - Profile and Base Resumes side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-3 h-full">
                <div className=" h-full">
                  <ProfileCard profile={profile} />
                </div>
              </div>

              {/* Base Resumes */}
              <div className="lg:col-span-9">
                <ResumeManagementCard
                  type="base"
                  resumes={baseResumes}
                  profile={profile}
                  icon={<FileText className="h-5 w-5" />}
                  title="Base Resumes"
                  description="Your resume templates"
                  emptyTitle="No base resumes yet"
                  emptyDescription="Create your first resume template to get started"
                  gradientFrom="purple-600"
                  gradientTo="indigo-600"
                  accentColor={{
                    bg: "purple-50",
                    border: "purple-200",
                    hover: "purple-300",
                    text: "purple-600"
                  }}
                />
              </div>
            </div>

            {/* Tailored Resumes */}
            <div className="max-h-[20%]">
              <ResumeManagementCard
                type="tailored"
                resumes={tailoredResumes}
                baseResumes={baseResumes}
                profile={profile}
                icon={<Sparkles className="h-5 w-5" />}
                title="Tailored Resumes"
                description="Job-specific resumes"
                emptyTitle="No tailored resumes yet"
                emptyDescription="Create a tailored resume for a specific job"
                gradientFrom="pink-600"
                gradientTo="rose-600"
                accentColor={{
                  bg: "pink-50",
                  border: "pink-200",
                  hover: "pink-300",
                  text: "pink-600"
                }}
              />
            </div>

            {/* Job Listings */}
            <div className="mt-6">
              <JobListingsCard />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
