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
import { ResumeManagementCard } from "@/components/resume/management/cards/resume-management-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
// import { JobListingsCard } from "@/components/jobs/job-listings-card";

export default async function Home() {
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50">
      <DashboardHeader />
      
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your resumes and profile
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Card - Left Column */}
          <div className="lg:col-span-1">
            <ProfileCard profile={profile} />
          </div>

          {/* Resumes Section - Right Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Base Resumes Card */}
            <div className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-white/40 border border-purple-200/50 shadow-xl">
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

            {/* Tailored Resumes Card */}
            <div className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-white/40 border border-pink-200/50 shadow-xl">
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
          </div>
        </div>
      </div>
    </div>
  );
}
