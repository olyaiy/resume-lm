import { redirect } from "next/navigation";
import { ProfileView } from "@/components/profile/profile-view";
import { ResumeList } from "@/components/resume/resume-list";
import { LogoutButton } from "@/components/auth/logout-button";
import { getDashboardData } from "../utils/supabase/actions";

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
    <main className="min-h-screen p-6 md:p-8 lg:p-10 relative">
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
      <div className="max-w-[2000px] mx-auto relative z-10">
        <div className="flex justify-end mb-6">
          <LogoutButton />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Profile */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl glass-card hover-card overflow-hidden border border-white/40 shadow-xl backdrop-blur-xl">
              <div className="p-8">
                <h2 className="text-3xl font-semibold mb-6 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Your Profile
                </h2>
                <ProfileView profile={profile} />
              </div>
            </div>
          </div>

          {/* Right Column - Resumes */}
          <div className="lg:col-span-5 space-y-6">
            {/* Base Resumes */}
            <div className="rounded-2xl glass-card hover-card p-8 border border-white/40 shadow-xl backdrop-blur-xl">
              <h2 className="text-3xl font-semibold mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                <span>Base Resumes</span>
                <span className="text-sm font-normal text-muted-foreground">
                  ({baseResumes.length})
                </span>
              </h2>
              <ResumeList 
                resumes={baseResumes}
                title="Base Resumes"
                emptyMessage="Create your first base resume"
              />
            </div>

            {/* Tailored Resumes */}
            <div className="rounded-2xl glass-card hover-card p-8 border border-white/40 shadow-xl backdrop-blur-xl">
              <h2 className="text-3xl font-semibold mb-6 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent flex items-center gap-2">
                <span>Tailored Resumes</span>
                <span className="text-sm font-normal text-muted-foreground">
                  ({tailoredResumes.length})
                </span>
              </h2>
              <ResumeList 
                resumes={tailoredResumes}
                title="Tailored Resumes"
                emptyMessage="Customize a resume for a specific job"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
