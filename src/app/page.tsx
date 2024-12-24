import { redirect } from "next/navigation";
import { ProfileView } from "@/components/profile/profile-view";
import { ResumeList } from "@/components/resume/resume-list";
import { getDashboardData } from "../utils/actions";
import { CreateResumeDialog } from "@/components/resume/create-resume-dialog";
import { Plus, User, FileText, Briefcase, ChevronRight, Sparkles, Target, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { SettingsButton } from "@/components/settings/settings-button";
import { ProfileCard } from "@/components/profile/profile-card";

export default async function Home() {
  let data;
  try {
    data = await getDashboardData();
  } catch (error) {
    redirect("/auth/login");
  }

  const { profile, baseResumes, tailoredResumes } = data;

  // Early return with a message if no profile exists
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
      {/* Gradient Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-pink-200/20 to-violet-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-gradient-to-r from-blue-200/20 to-teal-200/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Dashboard Header */}
        <header className="pt-8 pb-6 px-6 md:px-8 lg:px-10 border-b bg-white/50 backdrop-blur-lg">
          <div className="max-w-[2000px] mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Welcome back, {profile.first_name}! 👋
                </h1>
                <p className="text-muted-foreground">
                  Here's what's happening with your resumes
                </p>
              </div>
              <SettingsButton />
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white/40 backdrop-blur-md border-white/40 p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Profile Score</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-bold">98%</p>
                      <span className="text-xs text-teal-600">+2%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <Link href="/profile" className="text-sm text-teal-600 hover:text-teal-700 flex items-center">
                    Complete your profile <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </Card>

              <Card className="bg-white/40 backdrop-blur-md border-white/40 p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Base Resumes</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-bold">{baseResumes.length}</p>
                      <span className="text-xs text-purple-600">Active</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <CreateResumeDialog type="base">
                    <div className="text-sm text-purple-600 hover:text-purple-700 flex items-center cursor-pointer">
                      Create new resume <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </CreateResumeDialog>
                </div>
              </Card>

              <Card className="bg-white/40 backdrop-blur-md border-white/40 p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-pink-50 text-pink-600">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tailored Resumes</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-bold">{tailoredResumes.length}</p>
                      <span className="text-xs text-pink-600">Active</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <CreateResumeDialog type="tailored" baseResumes={baseResumes}>
                    <div className="text-sm text-pink-600 hover:text-pink-700 flex items-center cursor-pointer">
                      Create tailored resume <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </CreateResumeDialog>
                </div>
              </Card>

              <Card className="bg-white/40 backdrop-blur-md border-white/40 p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Job Postings</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-bold">124</p>
                      <span className="text-xs text-blue-600">Available</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <Link href="/jobs" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                    Browse jobs <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 md:p-8 lg:p-10">
          <div className="max-w-[2000px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column - Profile */}
              <div className="lg:col-span-7 space-y-6">
                <ProfileCard profile={profile} />
              </div>

              {/* Right Column - Resumes */}
              <div className="lg:col-span-5 space-y-6">
                {/* Base Resumes */}
                <Card className="overflow-hidden border-white/40 shadow-xl backdrop-blur-xl hover:shadow-2xl transition-all duration-300">
                  <div className="p-6 border-b bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Base Resumes
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Your resume templates ({baseResumes.length})
                        </p>
                      </div>
                      <CreateResumeDialog type="base">
                        <Button 
                          variant="outline" 
                          className="bg-white/50 border-purple-200 hover:border-purple-300 hover:bg-white/60"
                        >
                          <Plus className="h-4 w-4 mr-2 text-purple-600" />
                          New Template
                        </Button>
                      </CreateResumeDialog>
                    </div>
                  </div>
                  <div className="p-4">
                    <ResumeList 
                      resumes={baseResumes}
                      title="Base Resumes"
                      emptyMessage={
                        <div className="text-center py-8">
                          <div className="bg-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-8 w-8 text-purple-600" />
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">No base resumes yet</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Create your first resume template to get started
                          </p>
                          <CreateResumeDialog type="base">
                            <Button 
                              variant="outline" 
                              className="bg-white/50 border-purple-200 hover:border-purple-300 hover:bg-white/60"
                            >
                              <Plus className="h-4 w-4 mr-2 text-purple-600" />
                              Create First Resume
                            </Button>
                          </CreateResumeDialog>
                        </div>
                      }
                    />
                  </div>
                </Card>

                {/* Tailored Resumes */}
                <Card className="overflow-hidden border-white/40 shadow-xl backdrop-blur-xl hover:shadow-2xl transition-all duration-300">
                  <div className="p-6 border-b bg-gradient-to-r from-pink-500/10 to-rose-500/10">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent flex items-center gap-2">
                          <Sparkles className="h-5 w-5" />
                          Tailored Resumes
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Job-specific resumes ({tailoredResumes.length})
                        </p>
                      </div>
                      <CreateResumeDialog type="tailored" baseResumes={baseResumes}>
                        <Button 
                          variant="outline" 
                          className="bg-white/50 border-pink-200 hover:border-pink-300 hover:bg-white/60"
                          disabled={baseResumes.length === 0}
                        >
                          <Plus className="h-4 w-4 mr-2 text-pink-600" />
                          New Resume
                        </Button>
                      </CreateResumeDialog>
                    </div>
                  </div>
                  <div className="p-4">
                    <ResumeList 
                      resumes={tailoredResumes}
                      title="Tailored Resumes"
                      emptyMessage={
                        <div className="text-center py-8">
                          <div className="bg-pink-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="h-8 w-8 text-pink-600" />
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">No tailored resumes yet</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Customize a resume for your next job application
                          </p>
                          <CreateResumeDialog type="tailored" baseResumes={baseResumes}>
                            <Button 
                              variant="outline" 
                              className="bg-white/50 border-pink-200 hover:border-pink-300 hover:bg-white/60"
                              disabled={baseResumes.length === 0}
                            >
                              <Plus className="h-4 w-4 mr-2 text-pink-600" />
                              Create Tailored Resume
                            </Button>
                          </CreateResumeDialog>
                        </div>
                      }
                    />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
