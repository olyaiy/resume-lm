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
import { User, Linkedin, Briefcase, GraduationCap, Wrench, FolderGit2, Award, Trash2, Upload, ArrowLeft } from "lucide-react";
import { formatProfileWithAI } from "@/utils/ai";
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
      toast.success("Profile updated successfully");
      // Force a server revalidation
      router.refresh();
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsResetting(true);
      const resetData = await resetProfile();
      setProfile(resetData);
      toast.success("Profile has been reset");
      // Force a server revalidation
      router.refresh();
    } catch (error) {
      toast.error("Failed to reset profile");
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
      
      const messages = [
        { 
          role: "user" as const, 
          content: `${resumeContent}` 
        }
      ];
      
      const result = await formatProfileWithAI(messages);
      
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
        toast.success("Resume uploaded and profile updated successfully");
        setIsDialogOpen(false);
        setResumeContent("");
        // Force a server revalidation
        router.refresh();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to process resume: ${error.message}`);
      } else {
        toast.error("Failed to process resume: Unknown error");
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
    <div className="relative space-y-6 max-w-[1400px] mx-auto">
      {/* Unified background with subtle animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50/30 via-sky-50/30 to-violet-50/30 animate-gradient-xy pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50/40 via-transparent to-transparent pointer-events-none"></div>

      {/* Main content container with consistent styling */}
      <div className="relative space-y-6 p-6">
        {/* Header with enhanced visual hierarchy and gradient animation */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white/60 via-white/40 to-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl">
          {/* Animated gradient background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-violet-500/10 animate-gradient-xy"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100/20 via-transparent to-transparent"></div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-200/20 to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/20 to-transparent rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          </div>

          {/* Content container */}
          <div className="relative z-10 px-8 py-10">
            <div className="max-w-7xl mx-auto">
              {/* Top navigation and title section */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  {/* Back button with enhanced hover effects */}
                  <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="group relative px-4 py-2 bg-white/80 hover:bg-white/90 border-white/40 hover:border-white/60 shadow-lg hover:shadow-xl transition-all duration-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-sky-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-md"></div>
                    <div className="relative flex items-center gap-2">
                      <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-all duration-500 group-hover:-translate-x-0.5" />
                      <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">Back</span>
                    </div>
                  </Button>

                  {/* Title and subtitle with enhanced typography */}
                  <div className="space-y-2.5">
                    <div className="relative">
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-violet-600 bg-clip-text text-transparent animate-text-shimmer pb-1">
                        Edit Profile
                      </h1>
                      <div className="absolute -bottom-0.5 left-0 w-12 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></div>
                    </div>
                    <p className="text-base text-muted-foreground/80 max-w-md">
                      Craft your professional story with our intelligent resume builder
                    </p>
                  </div>
                </div>

                {/* Action buttons with enhanced styling */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="group relative bg-white/50 border-white/40 hover:bg-white/60 transition-all duration-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-md"></div>
                    <span className="relative bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-500">
                      Cancel
                    </span>
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-cyan-600 to-violet-600 text-white hover:opacity-90 transition-all duration-500 hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-xl group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Saving Changes...</span>
                        </div>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </div>
                  </Button>
                </div>
              </div>

              {/* Action buttons grid with enhanced styling */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
                {/* LinkedIn Import Button */}
                <Button
                  variant="outline"
                  onClick={handleLinkedInImport}
                  className="group relative bg-[#0077b5]/5 hover:bg-[#0077b5]/10 border-[#0077b5]/20 hover:border-[#0077b5]/30 text-[#0077b5] transition-all duration-500 hover:scale-[1.02] h-auto py-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0077b5]/0 via-[#0077b5]/5 to-[#0077b5]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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

                {/* Reset Profile Button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="group relative bg-red-50 hover:bg-red-100/80 border-red-200 hover:border-red-300 text-red-600 transition-all duration-500 hover:scale-[1.02] h-auto py-4"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 group-hover:bg-red-200 group-hover:scale-110 transition-all duration-500">
                          <Trash2 className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-red-600">Reset Profile</div>
                          <div className="text-sm text-red-600/70">Clear all profile data</div>
                        </div>
                      </div>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-white/40 shadow-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-semibold text-red-600">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-base text-gray-600">
                        This action will reset your entire profile to empty state. All your current profile data will be permanently deleted.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3">
                      <AlertDialogCancel className="bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300 text-gray-700 transition-all duration-300">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleReset}
                        disabled={isResetting}
                        className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 transition-all duration-500 hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:bg-red-600/50 disabled:border-red-600/50"
                      >
                        {isResetting ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Resetting...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Trash2 className="h-4 w-4" />
                            <span>Reset Profile</span>
                          </div>
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs with smooth transitions and connected design */}
        <div className="relative">
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