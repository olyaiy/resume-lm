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
import { FileText, Sparkles, User, MapPin, Mail, Phone, Pencil, ExternalLink, Github, Linkedin, Briefcase, GraduationCap, Code, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MiniResumePreview } from "@/components/resume/shared/mini-resume-preview";
import Link from "next/link";
import { CreateResumeDialog } from "@/components/resume/management/dialogs/create-resume-dialog";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

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
    <main className="min-h-screen relative">
      {/* Gradient Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px]" />
        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-indigo-200/20 rounded-full blur-3xl animate-float-slower" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <DashboardHeader />
        
        <div className="container max-w-7xl mx-auto p-6">
          {/* Profile Overview */}
          <div className="mb-6 space-y-4">
            {/* Greeting & Edit Button */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  {getGreeting()}, {profile.first_name}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Welcome to your professional dashboard
                </p>
              </div>
              <Button
                variant="outline"
                className="bg-white/50 hover:bg-white/70 border-teal-200 hover:border-teal-300 text-teal-700"
                size="sm"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            {/* Profile Card */}
            <div className="rounded-xl bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-md border border-white/40 shadow-xl">
              {/* Top Banner */}
              <div className="h-16 rounded-t-xl bg-gradient-to-r from-teal-600/10 via-cyan-600/10 to-teal-600/10 border-b border-teal-200/20" />
              
              {/* Profile Content */}
              <div className="px-6 pb-4 -mt-8">
                {/* Avatar Circle */}
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 p-[2px] shadow-xl">
                  <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                    <User className="h-6 w-6 text-teal-600" />
                  </div>
                </div>

                {/* Profile Grid */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Basic Info */}
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-teal-600">Full Name</p>
                    <p className="font-medium">{profile.first_name} {profile.last_name}</p>
                  </div>

                  {profile.location && (
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-teal-600">Location</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{profile.location}</p>
                      </div>
                    </div>
                  )}

                  {profile.email && (
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-teal-600">Email</p>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{profile.email}</p>
                      </div>
                    </div>
                  )}

                  {profile.phone_number && (
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-teal-600">Phone</p>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{profile.phone_number}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats Row */}
                <div className="mt-4 pt-4 border-t border-teal-100/30">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-teal-50/50 flex items-center justify-center">
                        <Briefcase className="h-4 w-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Experience</p>
                        <p className="font-medium">{profile.work_experience.length} entries</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-teal-50/50 flex items-center justify-center">
                        <GraduationCap className="h-4 w-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Education</p>
                        <p className="font-medium">{profile.education.length} entries</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-teal-50/50 flex items-center justify-center">
                        <Code className="h-4 w-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Projects</p>
                        <p className="font-medium">{profile.projects.length} entries</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-teal-50/50 flex items-center justify-center">
                        <Award className="h-4 w-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Certifications</p>
                        <p className="font-medium">{profile.certifications.length} entries</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                {(profile.website || profile.linkedin_url || profile.github_url) && (
                  <div className="mt-4 flex gap-3">
                    {profile.website && (
                      <Button variant="ghost" size="sm" className="h-7 text-muted-foreground hover:text-teal-600">
                        <ExternalLink className="h-4 w-4 mr-1.5" />
                        Website
                      </Button>
                    )}
                    {profile.linkedin_url && (
                      <Button variant="ghost" size="sm" className="h-7 text-muted-foreground hover:text-teal-600">
                        <Linkedin className="h-4 w-4 mr-1.5" />
                        LinkedIn
                      </Button>
                    )}
                    {profile.github_url && (
                      <Button variant="ghost" size="sm" className="h-7 text-muted-foreground hover:text-teal-600">
                        <Github className="h-4 w-4 mr-1.5" />
                        GitHub
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resume Bookshelf */}
          <div className="">
            {/* Base Resumes Section */}
            <div className="relative">
              <div className="relative flex items-center justify-between pb-4">
                <h2 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Base Resumes
                </h2>
              </div>
              
              <div className="relative pb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {baseResumes.map((resume) => (
                    <Link href={`/resumes/${resume.id}`} key={resume.id}>
                      <MiniResumePreview
                        name={resume.name}
                        type="base"
                        target_role={resume.target_role}
                        updatedAt={resume.updated_at}
                        className="hover:-translate-y-1 transition-transform duration-300"
                      />
                    </Link>
                  ))}
                  <CreateResumeDialog type="base" profile={profile}>
                    <button className="aspect-[8.5/11] rounded-lg border-2 border-dashed border-purple-300 bg-purple-50/50 hover:bg-purple-100/50 transition-colors flex flex-col items-center justify-center gap-2 group">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-purple-600">Create Base Resume</span>
                    </button>
                  </CreateResumeDialog>
                  {baseResumes.length === 0 && baseResumes.length + 1 < 4 && (
                    <div className="col-span-2 md:col-span-1" />
                  )}
                </div>
              </div>
            </div>

            {/* Thin Divider */}
            <div className="relative py-2">
              <div className="h-px bg-gradient-to-r from-transparent via-purple-300/30 to-transparent" />
            </div>

            {/* Tailored Resumes Section */}
            <div className="relative rounded-xl bg-gradient-to-br from-pink-50/50 to-rose-50/50 ">
              <div className="relative flex items-center justify-between pb-4">
                <h2 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Tailored Resumes
                </h2>
              </div>

              <div className="relative pb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {tailoredResumes.map((resume) => (
                    <Link href={`/resumes/${resume.id}`} key={resume.id}>
                      <MiniResumePreview
                        name={resume.name}
                        type="tailored"
                        target_role={resume.target_role}
                        updatedAt={resume.updated_at}
                        className="hover:-translate-y-1 transition-transform duration-300"
                      />
                    </Link>
                  ))}
                  <CreateResumeDialog type="tailored" baseResumes={baseResumes} profile={profile}>
                    <button className="aspect-[8.5/11] rounded-lg border-2 border-dashed border-pink-300 bg-pink-50/50 hover:bg-pink-100/50 transition-colors flex flex-col items-center justify-center gap-2 group">
                      <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Sparkles className="h-4 w-4 text-pink-600" />
                      </div>
                      <span className="text-sm font-medium text-pink-600">Create Tailored Resume</span>
                    </button>
                  </CreateResumeDialog>
                  {tailoredResumes.length === 0 && tailoredResumes.length + 1 < 4 && (
                    <div className="col-span-2 md:col-span-1" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
