import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ProfileView } from "@/components/profile/profile-view";
import { ResumeList } from "@/components/resume/resume-list";

export default async function Home() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    redirect("/login");
  }

  // Fetch profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Fetch resumes data
  const { data: resumes, error: resumesError } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', user.id);

  if (profileError || resumesError) {
    console.error('Error fetching data:', { profileError, resumesError });
    return <div>Error loading data</div>;
  }

  const baseResumes = resumes?.filter(resume => resume.is_base_resume) ?? [];
  const tailoredResumes = resumes?.filter(resume => !resume.is_base_resume) ?? [];

  return (
    <main className="w-screen h-screen p-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
        {/* Left Column - Profile */}
        <div className="lg:col-span-7 max-h-screen overflow-hidden rounded-lg border bg-card">
          <ProfileView profile={profile} />
        </div>

        {/* Right Column - Resumes */}
        <div className="lg:col-span-5 flex flex-col gap-4 p-6 rounded-lg border bg-card">
          {/* Base Resumes */}
          <div className="flex-1">
            <ResumeList 
              resumes={baseResumes}
              title="Base Resumes"
              emptyMessage="No base resumes created yet"
            />
          </div>

          {/* Tailored Resumes */}
          <div className="flex-1">
            <ResumeList 
              resumes={tailoredResumes}
              title="Tailored Resumes"
              emptyMessage="No tailored resumes created yet"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
