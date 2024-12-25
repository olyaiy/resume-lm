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
import { SettingsButton } from "@/components/settings/settings-button";
import { LogoutButton } from "@/components/auth/logout-button";
import { ProfileCard } from "@/components/profile/profile-card";
import { ResumeManagementCard } from "@/components/resume/resume-management-card";

export default async function Home() {
  // Fetch dashboard data and handle authentication
  let data;
  try {
    data = await getDashboardData();
  } catch (error) {
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
              We couldn't find your profile information. Please contact support for assistance.
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

      {/* 
        Background Layer
        - Implements the design system's soft gradient minimalism
        - Contains animated floating orbs and mesh overlay
        - Creates depth through translucent layers
      */}
      <div className="fixed inset-0 z-0">
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50" />
        {/* Animated floating orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-pink-200/20 to-violet-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-gradient-to-r from-blue-200/20 to-teal-200/20 rounded-full blur-3xl animate-float-delayed" />
        {/* Mesh overlay for visual texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px]" />
      </div>

      {/* Main Content Layer */}
      <div className="relative z-10">

        
        {/* 
          Dashboard Header Section
          - Displays welcome message and quick stats
          - Uses glass-morphism effect with backdrop blur
        */}
        <header className="pt-8 pb-6 px-6 md:px-8 lg:px-10 border-b bg-white/50 backdrop-blur-lg">
          <div className="max-w-[2000px] mx-auto">
            {/* Welcome message and settings */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Welcome back, {profile.first_name}! 👋
                </h1>
                <p className="text-muted-foreground">
                  Here's what's happening with your resumes
                </p>
              </div>
              <div className="flex items-center gap-3">
                <LogoutButton />
                <SettingsButton />
              </div>
            </div>
          </div>
        </header>

        {/* 
          Main Dashboard Content
          - Two-column layout on larger screens
          - Left column: Profile information
          - Right column: Resume management
        */}
        <div className="p-6 md:p-8 lg:p-10">
          <div className="max-w-[2000px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column - Profile Section */}
              <div className="lg:col-span-6 space-y-6">
                <ProfileCard profile={profile} />
              </div>

              {/* Right Column - Resume Management Section */}
              <div className="lg:col-span-6 space-y-6">
                {/* Base Resumes Management Card */}
                <ResumeManagementCard
                  type="base"
                  resumes={baseResumes}
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

                {/* Tailored Resumes Management Card */}
                <ResumeManagementCard
                  type="tailored"
                  resumes={tailoredResumes}
                  baseResumes={baseResumes}
                  icon={<Sparkles className="h-5 w-5" />}
                  title="Tailored Resumes"
                  description="Job-specific resumes"
                  emptyTitle="No tailored resumes yet"
                  emptyDescription="Customize a resume for your next job application"
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
    </main>
  );
}
