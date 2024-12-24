import { redirect } from "next/navigation";
import { ProfileView } from "@/components/profile/profile-view";
import { ResumeList } from "@/components/resume/resume-list";
import { getDashboardData } from "../utils/actions";
import { CreateResumeDialog } from "@/components/resume/create-resume-dialog";
import { Plus, User, FileText, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
        <div className="rounded-2xl glass-card p-8 border border-white/40 shadow-xl backdrop-blur-xl">
          <h2 className="text-xl text-muted-foreground">
            Profile not found. Please contact support.
          </h2>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative">
      {/* Gradient Background Elements */}
      <div className="fixed inset-0 z-0">
        {/* Primary gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-pink-200/20 to-violet-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-gradient-to-r from-blue-200/20 to-teal-200/20 rounded-full blur-3xl animate-float-delayed" />
        
        {/* Mesh grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Dashboard Header */}
        <header className="pt-8 pb-6 px-6 md:px-8 lg:px-10 border-b bg-white/50 backdrop-blur-lg">
          <div className="max-w-[2000px] mx-auto">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Welcome back, {profile.first_name}
              </h1>
              <p className="text-muted-foreground">
                Manage your resumes and job applications from one place
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="bg-white/40 backdrop-blur-md border-white/40 p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-teal-50 text-teal-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profile Completion</p>
                  <p className="text-2xl font-semibold">100%</p>
                </div>
              </Card>
              <Card className="bg-white/40 backdrop-blur-md border-white/40 p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Resumes</p>
                  <p className="text-2xl font-semibold">{baseResumes.length + tailoredResumes.length}</p>
                </div>
              </Card>
              <Card className="bg-white/40 backdrop-blur-md border-white/40 p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-pink-50 text-pink-600">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Applications</p>
                  <p className="text-2xl font-semibold">{tailoredResumes.length}</p>
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
                {/* Profile Section */}
                <div className="rounded-2xl glass-card overflow-hidden border border-white/40 shadow-xl backdrop-blur-xl">
                  <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        Your Profile
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        This information will be used in your resumes
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="bg-white/50 border-teal-200 hover:border-teal-300 hover:bg-white/60"
                    >
                      Edit Profile
                    </Button>
                  </div>
                  <div className="p-6">
                    <ProfileView profile={profile} />
                  </div>
                </div>
              </div>

              {/* Right Column - Resumes */}
              <div className="lg:col-span-5 space-y-6">
                {/* Base Resumes */}
                <div className="rounded-2xl glass-card p-6 border border-white/40 shadow-xl backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Base Resumes
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create and manage your base resume templates
                      </p>
                    </div>
                    <CreateResumeDialog type="base">
                      <Button 
                        variant="outline" 
                        className="bg-white/50 border-purple-200 hover:border-purple-300 hover:bg-white/60"
                      >
                        <Plus className="h-4 w-4 mr-2 text-purple-600" />
                        New Base Resume
                      </Button>
                    </CreateResumeDialog>
                  </div>
                  <ResumeList 
                    resumes={baseResumes}
                    title="Base Resumes"
                    emptyMessage={
                      <div className="text-center py-8">
                        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No base resumes yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Create your first base resume to get started
                        </p>
                      </div>
                    }
                  />
                </div>

                {/* Tailored Resumes */}
                <div className="rounded-2xl glass-card p-6 border border-white/40 shadow-xl backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                        Tailored Resumes
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Customize resumes for specific job applications
                      </p>
                    </div>
                    <CreateResumeDialog type="tailored" baseResumes={baseResumes}>
                      <Button 
                        variant="outline" 
                        className="bg-white/50 border-pink-200 hover:border-pink-300 hover:bg-white/60"
                        disabled={baseResumes.length === 0}
                      >
                        <Plus className="h-4 w-4 mr-2 text-pink-600" />
                        New Tailored Resume
                      </Button>
                    </CreateResumeDialog>
                  </div>
                  <ResumeList 
                    resumes={tailoredResumes}
                    title="Tailored Resumes"
                    emptyMessage={
                      <div className="text-center py-8">
                        <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No tailored resumes yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Create a tailored resume for your job applications
                        </p>
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
