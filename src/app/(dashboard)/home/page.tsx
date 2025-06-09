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
import { countResumes } from "@/utils/actions/resumes/actions";
import {User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileRow } from "@/components/dashboard/profile-row";
import { WelcomeDialog } from "@/components/dashboard/welcome-dialog";
import { getGreeting } from "@/lib/utils";
import { ApiKeyAlert } from "@/components/dashboard/api-key-alert";
import { type SortOption, type SortDirection } from "@/components/resume/management/resume-sort-controls";
import type { Resume } from "@/lib/types";
import { ResumesSection } from "@/components/dashboard/resumes-section";
import { createClient } from "@/utils/supabase/server";
import { getDashboardData } from "@/utils/actions";
import { checkSubscriptionPlan } from "@/utils/actions/stripe/actions";









export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {

  const supabase = await createClient();
  

  const {
    data: { user },
  } = await supabase.auth.getUser()



  const userId = user?.id;
  void userId;
  
  
  // Check if user is coming from confirmation
  const params = await searchParams;
  const isNewSignup = params?.type === 'signup' && params?.token_hash;

  // Fetch dashboard data and handle authentication
  let data;
  try {
    data = await getDashboardData();
    if (!data.profile) {
      redirect("/");
    }
  } catch {
    // Redirect to login if error occurs
    redirect("/");
  }

  const { profile, baseResumes: unsortedBaseResumes, tailoredResumes: unsortedTailoredResumes } = data;

  // Get sort parameters for both sections
  const baseSort = (params.baseSort as SortOption) || 'createdAt';
  const baseDirection = (params.baseDirection as SortDirection) || 'asc';
  const tailoredSort = (params.tailoredSort as SortOption) || 'createdAt';
  const tailoredDirection = (params.tailoredDirection as SortDirection) || 'asc';

  // Sort function
  function sortResumes(resumes: Resume[], sort: SortOption, direction: SortDirection) {
    return [...resumes].sort((a, b) => {
      const modifier = direction === 'asc' ? 1 : -1;
      switch (sort) {
        case 'name':
          return modifier * a.name.localeCompare(b.name);
        case 'jobTitle':
          return modifier * ((a.target_role || '').localeCompare(b.target_role || '') || 0);
        case 'createdAt':
        default:
          return modifier * (new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
    }
    });
  }


  // Sort both resume lists
  const baseResumes = sortResumes(unsortedBaseResumes, baseSort, baseDirection);
  const tailoredResumes = sortResumes(unsortedTailoredResumes, tailoredSort, tailoredDirection);
  
  // Check if user is on Pro plan
  const subscription = await checkSubscriptionPlan();
  const isProPlan = subscription.plan === 'pro';

  // console.log(subscription);
  
  // Count resumes for base and tailored sections
  const baseResumesCount = await countResumes('base');
  const tailoredResumesCount = await countResumes('tailored');
  // console.log(baseResumesCount, tailoredResumesCount);
  // console.log(isProPlan);
  

  // Free plan limits
  const canCreateBase = isProPlan || baseResumesCount < 2;
  const canCreateTailored = isProPlan || tailoredResumesCount < 4;


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
    
    <main className="min-h-screen relative sm:pb-12 pb-40">

      {/* Welcome Dialog for New Signups */}
      <WelcomeDialog isOpen={!!isNewSignup} />
      
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
      {/* Profile Row Component */}
      <ProfileRow profile={profile} />
        
        <div className="pl-2 sm:pl-0 sm:container sm:max-none  max-w-7xl mx-auto  lg:px-8 md:px-8 sm:px-6 pt-4 ">  
          {/* Profile Overview */}
          <div className="mb-6 space-y-4">
            {/* API Key Alert */}
            { !isProPlan && <ApiKeyAlert />}
            
            {/* Greeting & Edit Button */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  {getGreeting()}, {profile.first_name}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Welcome to your resume dashboard
                </p>
              </div>
            </div>

            

            {/* Resume Bookshelf */}
            <div className="">


              {/* Base Resumes Section */}
              <ResumesSection
                type="base"
                resumes={baseResumes}
                profile={profile}
                sortParam="baseSort"
                directionParam="baseDirection"
                currentSort={baseSort}
                currentDirection={baseDirection}
                canCreateMore={canCreateBase}
              />

              {/* Thin Divider */}
              <div className="relative py-2">
                <div className="h-px bg-gradient-to-r from-transparent via-purple-300/30 to-transparent" />
              </div>

              {/* Tailored Resumes Section */}
              <ResumesSection
                type="tailored"
                resumes={tailoredResumes}
                profile={profile}
                sortParam="tailoredSort"
                directionParam="tailoredDirection"
                currentSort={tailoredSort}
                currentDirection={tailoredDirection}
                baseResumes={baseResumes}
                canCreateMore={canCreateTailored}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
