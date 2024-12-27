'use client';

import { Profile, WorkExperience, Education, Skill, Project, Certification } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileCertificationsForm } from "@/components/profile/profile-certifications-form";
import { updateProfile, resetProfile, importResume } from "@/utils/actions";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { User, Linkedin, Briefcase, GraduationCap, Wrench, FolderGit2, Award, Trash2, Upload, ArrowLeft, Save } from "lucide-react";
import { formatProfileWithAI, processTextImport } from "@/utils/ai";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { ProfileBasicInfoForm } from "@/components/profile/profile-basic-info-form";
import { ProfileWorkExperienceForm } from "@/components/profile/profile-work-experience-form";
import { ProfileProjectsForm } from "@/components/profile/profile-projects-form";
import { ProfileEducationForm } from "@/components/profile/profile-education-form";
import { ProfileSkillsForm } from "@/components/profile/profile-skills-form";

interface ProfileEditFormProps {
  profile: Profile;
}

export function ProfileEditForm({ profile: initialProfile }: ProfileEditFormProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resumeContent, setResumeContent] = useState("");
  const [isProcessingResume, setIsProcessingResume] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  // Sync with server state when initialProfile changes
  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const updateField = (field: keyof Profile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await updateProfile(profile);
      toast("Changes saved successfully");
      // Force a server revalidation
      router.refresh();
    } catch (error) {
      toast("Unable to save your changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsResetting(true);
      // Reset to empty profile locally
      setProfile({
        id: profile.id,
        user_id: profile.user_id,
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        location: '',
        website: '',
        linkedin_url: '',
        github_url: '',
        work_experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        created_at: profile.created_at,
        updated_at: profile.updated_at
      });
      toast("Profile reset - Don't forget to save your changes to make this permanent");
      // Remove server revalidation since we're only updating local state
    } catch (error) {
      toast("Failed to reset profile. Please try again.");
      console.error(error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleLinkedInImport = () => {
    toast.info("LinkedIn import feature coming soon!");
  };

  const handleResumeUpload = async () => {
    try {
      setIsProcessingResume(true);
      
      const result = await processTextImport(resumeContent);
      
      if (result) {
        const parsedProfile = JSON.parse(result);
        
        // Clean and transform the data to match our database schema
        const cleanedProfile: Partial<Profile> = {
          first_name: parsedProfile.first_name || null,
          last_name: parsedProfile.last_name || null,
          email: parsedProfile.email || null,
          phone_number: parsedProfile.phone_number || null,
          location: parsedProfile.location || null,
          website: parsedProfile.website || null,
          linkedin_url: parsedProfile.linkedin_url || null,
          github_url: parsedProfile.github_url || null,
          work_experience: Array.isArray(parsedProfile.work_experience) 
            ? parsedProfile.work_experience.map((exp: Partial<WorkExperience>) => ({
                company: exp.company || '',
                position: exp.position || '',
                location: exp.location || '',
                date: exp.date || '',
                description: Array.isArray(exp.description) 
                  ? exp.description 
                  : [exp.description || ''],
                technologies: Array.isArray(exp.technologies) 
                  ? exp.technologies 
                  : []
              }))
            : [],
          education: Array.isArray(parsedProfile.education)
            ? parsedProfile.education.map((edu: Partial<Education>) => ({
                school: edu.school || '',
                degree: edu.degree || '',
                field: edu.field || '',
                location: edu.location || '',
                date: edu.date || '',
                gpa: edu.gpa ? parseFloat(edu.gpa.toString()) : undefined,
                achievements: Array.isArray(edu.achievements) 
                  ? edu.achievements 
                  : []
              }))
            : [],
          skills: Array.isArray(parsedProfile.skills)
            ? parsedProfile.skills.map((skill: any) => ({
                category: skill.category || '',
                items: Array.isArray(skill.skills) 
                  ? skill.skills 
                  : Array.isArray(skill.items) 
                    ? skill.items 
                    : []
              }))
            : [],
          projects: Array.isArray(parsedProfile.projects)
            ? parsedProfile.projects.map((proj: Partial<Project>) => ({
                name: proj.name || '',
                description: proj.description || '',
                technologies: Array.isArray(proj.technologies) 
                  ? proj.technologies 
                  : [],
                url: proj.url || undefined,
                github_url: proj.github_url || undefined,
                date: proj.date || ''
              }))
            : [],
          certifications: Array.isArray(parsedProfile.certifications)
            ? parsedProfile.certifications.map((cert: Partial<Certification>) => ({
                name: cert.name || '',
                issuer: cert.issuer || '',
                date_acquired: cert.date_acquired || '',
                expiry_date: cert.expiry_date || undefined,
                credential_id: cert.credential_id || undefined,
                url: cert.url || undefined
              }))
            : []
        };
        
        await importResume(cleanedProfile);
        
        setProfile(prev => ({
          ...prev,
          ...cleanedProfile
        }));
        toast("Content imported successfully - Don't forget to save your changes");
        setIsDialogOpen(false);
        setResumeContent("");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast("Failed to process content: " + error.message);
      } else {
        toast("Failed to process content: Unknown error");
      }
    } finally {
      setIsProcessingResume(false);
    }
  };

  const resumeUploadButton = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20 hover:border-violet-500/30 text-violet-600 transition-all duration-300"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload from Resume
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-md border-white/40">
        <DialogHeader>
          <DialogTitle>Upload Resume Content</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2">
              <span className="block">Paste your resume content below. Our AI will analyze it and add new information to your existing profile.</span>
              <span className="block text-sm text-muted-foreground">Note: This will append new entries to your profile without overriding existing information. To start fresh, use the "Reset Profile" option before uploading.</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            value={resumeContent}
            onChange={(e) => setResumeContent(e.target.value)}
            placeholder="Paste your resume content here..."
            className="min-h-[300px] bg-white/50 border-white/40"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            className="bg-white/50 hover:bg-white/60"
          >
            Cancel
          </Button>
          <Button
            onClick={handleResumeUpload}
            disabled={isProcessingResume || !resumeContent.trim()}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90"
          >
            {isProcessingResume ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload to Profile with AI
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="relative mx-auto">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-teal-200/20 to-cyan-200/20 blur-3xl animate-blob opacity-70" />
        <div className="absolute top-[20%] -right-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-200/20 to-indigo-200/20 blur-3xl animate-blob animation-delay-2000 opacity-70" />
        <div className="absolute -bottom-[40%] left-[20%] w-[75%] h-[75%] rounded-full bg-gradient-to-br from-pink-200/20 to-rose-200/20 blur-3xl animate-blob animation-delay-4000 opacity-70" />
      </div>

      {/* Top Bar */}
      <div className="h-20 border-b border-purple-200/50 bg-gradient-to-r from-purple-50/95 via-white/95 to-purple-50/95 backdrop-blur-xl fixed left-0 right-0 z-40 shadow-lg shadow-purple-500/10">
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3e8ff30_0%,#ffffff40_50%,#f3e8ff30_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-40%,#f3e8ff30_0%,transparent_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_100%_100%,#f3e8ff20_0%,transparent_100%)] pointer-events-none" />
        
        {/* Content Container */}
        <div className="max-w-[2000px] mx-auto h-full px-6 flex items-center justify-between relative">
          {/* Left Section */}
          <div className="flex items-center gap-6">
            {/* Back Button */}
            <button 
              onClick={() => router.push('/')}
              className="group flex items-center text-sm font-medium text-purple-600/70 hover:text-purple-600 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-purple-100/30 hover:shadow-sm hover:shadow-purple-500/5 active:bg-purple-100/40"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Dashboard
            </button>

            {/* Separator */}
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-purple-200/40 to-transparent" />

            {/* Profile Title Section */}
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-semibold">
                <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                  Edit Profile
                </span>
              </h1>
              <div className="flex items-center gap-2 text-sm text-purple-600/60">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-sm shadow-purple-500/20" />
                  <span className="font-medium">Professional Profile</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 transition-all duration-500 shadow-md hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-0.5 h-10 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,#ffffff20_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>

            {/* Reset Profile Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 transition-all duration-500 shadow-md hover:shadow-xl hover:shadow-rose-500/20 hover:-translate-y-0.5 h-10 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
                  disabled={isResetting}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,#ffffff20_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {isResetting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Reset Profile</span>
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Profile</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to reset your profile? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleReset}
                    disabled={isResetting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isResetting ? "Resetting..." : "Reset"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Main content container with consistent styling */}
      <div className="relative pt-24 px-6 md:px-8 lg:px-10 pb-10">
        {/* Import Actions Row */}
        <div className="relative mb-6">
          <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm text-purple-600/60">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-sm shadow-purple-500/20" />
                  <span className="font-medium">Import Options</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* LinkedIn Import Button */}
                <Button
                  variant="outline"
                  onClick={handleLinkedInImport}
                  className="group relative bg-[#0077b5]/5 hover:bg-[#0077b5]/10 border-[#0077b5]/20 hover:border-[#0077b5]/30 text-[#0077b5] transition-all duration-500 hover:scale-[1.02] h-auto py-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0077b5]/0 via-[#0077b5]/5 to-[#0077b5]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#0077b5]/10 group-hover:scale-110 transition-transform duration-500">
                      <Linkedin className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-[#0077b5]">LinkedIn Import</div>
                      <div className="text-sm text-[#0077b5]/70">Sync with your LinkedIn profile</div>
                    </div>
                  </div>
                </Button>

                {/* Resume Upload Button */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="group relative bg-violet-500/5 hover:bg-violet-500/10 border-violet-500/20 hover:border-violet-500/30 text-violet-600 transition-all duration-500 hover:scale-[1.02] h-auto py-4"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-violet-500/10 group-hover:scale-110 transition-transform duration-500">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-violet-600">Resume Upload</div>
                          <div className="text-sm text-violet-600/70">Import from existing resume</div>
                        </div>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-xl border-white/40 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        Upload Resume Content
                      </DialogTitle>
                      <DialogDescription asChild>
                        <div className="space-y-2 text-base text-muted-foreground/80">
                          <span className="block">Let our AI analyze your resume and enhance your profile by adding new information.</span>
                          <span className="block text-sm">Your existing profile information will be preserved. New entries will be added alongside your current data. Want to start fresh instead? Use the "Reset Profile" option before uploading.</span>
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Textarea
                        value={resumeContent}
                        onChange={(e) => setResumeContent(e.target.value)}
                        placeholder="Paste your resume content here..."
                        className="min-h-[300px] bg-white/50 border-white/40 focus:border-violet-500/40 focus:ring-violet-500/20 transition-all duration-300"
                      />
                    </div>
                    <DialogFooter className="gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="bg-white/50 hover:bg-white/60 transition-all duration-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleResumeUpload}
                        disabled={isProcessingResume || !resumeContent.trim()}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 transition-all duration-500 hover:scale-[1.02] disabled:hover:scale-100"
                      >
                        {isProcessingResume ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            <span>Process with AI</span>
                          </div>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Import From Text Button */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="group relative bg-violet-500/5 hover:bg-violet-500/10 border-violet-500/20 hover:border-violet-500/30 text-violet-600 transition-all duration-500 hover:scale-[1.02] h-auto py-4"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-violet-500/10 group-hover:scale-110 transition-transform duration-500">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-violet-600">Import From Text</div>
                          <div className="text-sm text-violet-600/70">Import from any text content</div>
                        </div>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-xl border-white/40 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        Import From Text
                      </DialogTitle>
                      <DialogDescription asChild>
                        <div className="space-y-2 text-base text-muted-foreground/80">
                          <span className="block">Paste any text content below (resume, job description, achievements, etc.). Our AI will analyze it and enhance your profile by adding relevant information.</span>
                          <span className="block text-sm">Your existing profile information will be preserved. New entries will be added alongside your current data.</span>
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Textarea
                        value={resumeContent}
                        onChange={(e) => setResumeContent(e.target.value)}
                        placeholder="Paste your text content here..."
                        className="min-h-[300px] bg-white/50 border-white/40 focus:border-violet-500/40 focus:ring-violet-500/20 transition-all duration-300"
                      />
                    </div>
                    <DialogFooter className="gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="bg-white/50 hover:bg-white/60 transition-all duration-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleResumeUpload}
                        disabled={isProcessingResume || !resumeContent.trim()}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 transition-all duration-500 hover:scale-[1.02] disabled:hover:scale-100"
                      >
                        {isProcessingResume ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            <span>Process with AI</span>
                          </div>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs with smooth transitions and connected design */}
        <div className="relative p-6">
          <div className="absolute inset-x-0 -top-3 h-8 bg-gradient-to-b from-white/60 to-transparent pointer-events-none"></div>
          <div className="relative bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl">
            <Tabs defaultValue="basic" className="w-full ">
              <TabsList className=" h-full relative bg-white/80  backdrop-blur-xl border border-white/40  py-2 mb-6 rounded-xl overflow-x-auto flex whitespace-nowrap gap-2 shadow-lg">
                <TabsTrigger 
                  value="basic" 
                  className=" group flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium relative transition-all duration-300
                    data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500/10 data-[state=active]:to-cyan-500/10
                    data-[state=active]:border-teal-500/20 data-[state=active]:shadow-lg hover:bg-white/60
                    data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
                >
                  <div className="p-1.5 rounded-full bg-teal-100/80 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:bg-teal-100">
                    <User className="h-4 w-4 text-teal-600 transition-colors group-data-[state=inactive]:text-teal-500/70" />
                  </div>
                  <span className="relative">
                    Basic Info
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-teal-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="experience" 
                  className="group flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium relative transition-all duration-300
                    data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/10 data-[state=active]:to-blue-500/10
                    data-[state=active]:border-cyan-500/20 data-[state=active]:shadow-lg hover:bg-white/60
                    data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
                >
                  <div className="p-1.5 rounded-full bg-cyan-100/80 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:bg-cyan-100">
                    <Briefcase className="h-4 w-4 text-cyan-600 transition-colors group-data-[state=inactive]:text-cyan-500/70" />
                  </div>
                  <span className="relative">
                    Work Experience
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-cyan-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="projects" 
                  className="group flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium relative transition-all duration-300
                    data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/10 data-[state=active]:to-purple-500/10
                    data-[state=active]:border-violet-500/20 data-[state=active]:shadow-lg hover:bg-white/60
                    data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
                >
                  <div className="p-1.5 rounded-full bg-violet-100/80 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:bg-violet-100">
                    <FolderGit2 className="h-4 w-4 text-violet-600 transition-colors group-data-[state=inactive]:text-violet-500/70" />
                  </div>
                  <span className="relative">
                    Projects
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-violet-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="education" 
                  className="group flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium relative transition-all duration-300
                    data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/10 data-[state=active]:to-blue-500/10
                    data-[state=active]:border-indigo-500/20 data-[state=active]:shadow-lg hover:bg-white/60
                    data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
                >
                  <div className="p-1.5 rounded-full bg-indigo-100/80 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:bg-indigo-100">
                    <GraduationCap className="h-4 w-4 text-indigo-600 transition-colors group-data-[state=inactive]:text-indigo-500/70" />
                  </div>
                  <span className="relative">
                    Education
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-indigo-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="skills" 
                  className="group flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium relative transition-all duration-300
                    data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500/10 data-[state=active]:to-pink-500/10
                    data-[state=active]:border-rose-500/20 data-[state=active]:shadow-lg hover:bg-white/60
                    data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
                >
                  <div className="p-1.5 rounded-full bg-rose-100/80 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:bg-rose-100">
                    <Wrench className="h-4 w-4 text-rose-600 transition-colors group-data-[state=inactive]:text-rose-500/70" />
                  </div>
                  <span className="relative">
                    Skills
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-rose-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="certifications" 
                  className="group flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium relative transition-all duration-300
                    data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/10 data-[state=active]:to-orange-500/10
                    data-[state=active]:border-amber-500/20 data-[state=active]:shadow-lg hover:bg-white/60
                    data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
                >
                  <div className="p-1.5 rounded-full bg-amber-100/80 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:bg-amber-100">
                    <Award className="h-4 w-4 text-amber-600 transition-colors group-data-[state=inactive]:text-amber-500/70" />
                  </div>
                  <span className="relative">
                    Certifications
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-amber-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
                  </span>
                </TabsTrigger>
              </TabsList>

              <div className="relative">
                {/* Content gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-white/10 to-white/20 pointer-events-none rounded-2xl"></div>
                
                {/* Tab content with consistent card styling */}
                <div className="relative space-y-6">
                  <TabsContent value="basic" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                    <Card className="bg-gradient-to-br from-white/50 via-white/40 to-white/50 backdrop-blur-xl border-white/40 shadow-xl transition-all duration-500 hover:shadow-2xl rounded-xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                      <div className="relative p-6">
                        <ProfileBasicInfoForm
                          profile={profile}
                          onChange={(field, value) => {
                            if (field in profile) {
                              updateField(field as keyof Profile, value);
                            }
                          }}
                        />
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="experience" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                    <Card className="bg-gradient-to-br from-white/50 via-white/40 to-white/50 backdrop-blur-xl border-white/40 shadow-2xl transition-all duration-500 hover:shadow-3xl rounded-2xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                      <div className="relative p-8">
                        <ProfileWorkExperienceForm
                          experiences={profile.work_experience}
                          onChange={(experiences) => updateField('work_experience', experiences)}
                        />
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="projects" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                    <Card className="bg-gradient-to-br from-white/50 via-white/40 to-white/50 backdrop-blur-xl border-white/40 shadow-2xl transition-all duration-500 hover:shadow-3xl rounded-2xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                      <div className="relative p-8">
                        <ProfileProjectsForm
                          projects={profile.projects}
                          onChange={(projects) => updateField('projects', projects)}
                        />
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="education" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                    <Card className="bg-gradient-to-br from-white/50 via-white/40 to-white/50 backdrop-blur-xl border-white/40 shadow-2xl transition-all duration-500 hover:shadow-3xl rounded-2xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                      <div className="relative p-8">
                        <ProfileEducationForm
                          education={profile.education}
                          onChange={(education) => updateField('education', education)}
                        />
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="skills" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                    <Card className="bg-gradient-to-br from-white/50 via-white/40 to-white/50 backdrop-blur-xl border-white/40 shadow-2xl transition-all duration-500 hover:shadow-3xl rounded-2xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                      <div className="relative p-8">
                        <ProfileSkillsForm
                          skills={profile.skills}
                          onChange={(skills) => updateField('skills', skills)}
                        />
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="certifications" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                    <Card className="bg-gradient-to-br from-white/50 via-white/40 to-white/50 backdrop-blur-xl border-white/40 shadow-2xl transition-all duration-500 hover:shadow-3xl rounded-2xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                      <div className="relative p-8">
                        <ProfileCertificationsForm
                          certifications={profile.certifications}
                          onChange={(certifications) => updateField('certifications', certifications)}
                        />
                      </div>
                    </Card>
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>
          <div className="absolute inset-x-0 -bottom-3 h-8 bg-gradient-to-t from-white/60 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
} 