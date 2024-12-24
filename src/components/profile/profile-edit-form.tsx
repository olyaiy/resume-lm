'use client';

import { Profile, WorkExperience, Education, Skill, Project, Certification } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkExperienceForm } from "@/components/resume/work-experience-form";
import { EducationForm } from "@/components/resume/education-form";
import { ProjectsForm } from "@/components/resume/projects-form";
import { SkillsForm } from "@/components/resume/skills-form";
import { CertificationsForm } from "@/components/resume/certifications-form";
import { updateProfile, resetProfile } from "@/utils/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { User, MapPin, Mail, Phone, Globe, Linkedin, Github, Briefcase, GraduationCap, Wrench, FolderGit2, Award, FileText, Trash2, Import, Upload } from "lucide-react";
import { formatProfileWithAI } from "@/utils/ai";
import type OpenAI from "openai";
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

  const updateField = (field: keyof Profile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await updateProfile(profile);
      toast.success("Profile updated successfully");
      router.push("/");
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
      console.log('🚀 Starting resume upload process...');
      console.log('📝 Resume content length:', resumeContent.length);
      
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
          professional_summary: parsedProfile.professional_summary || null,
          work_experience: Array.isArray(parsedProfile.work_experience) 
            ? parsedProfile.work_experience.map((exp: Partial<WorkExperience>) => ({
                company: exp.company || '',
                position: exp.position || '',
                location: exp.location || '',
                start_date: exp.start_date || '',
                end_date: exp.end_date || null,
                current: exp.end_date === 'Present',
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
                start_date: edu.start_date || '',
                end_date: edu.end_date || null,
                current: edu.end_date === 'Present',
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
                start_date: proj.start_date || '',
                end_date: proj.end_date || null,
                highlights: Array.isArray(proj.highlights) 
                  ? proj.highlights 
                  : []
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
        
        console.log('📤 Sending cleaned profile to update function:', JSON.stringify(cleanedProfile, null, 2));
        await updateProfile(cleanedProfile);
        
        console.log('✅ Profile updated successfully');
        setProfile(cleanedProfile as Profile);
        toast.success("Resume uploaded and profile updated successfully");
        setIsDialogOpen(false);
        setResumeContent("");
        router.refresh();
      }
    } catch (error) {
      console.error("❌ Error in handleResumeUpload:", error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      toast.error(`Failed to process resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          <DialogDescription>
            Paste your entire resume content below. Our AI will automatically parse it and update your profile.
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
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header with enhanced visual hierarchy and gradient animation */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white/50 via-white/30 to-white/50 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-violet-500/10 animate-gradient-xy"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-violet-600 bg-clip-text text-transparent animate-text-shimmer">
                Edit Profile
              </h1>
              <p className="text-base text-muted-foreground/80">
                Craft your professional story with our intelligent resume builder
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="group bg-white/50 border-white/40 hover:bg-white/60 transition-all duration-500"
              >
                <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-500">
                  Cancel
                </span>
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-teal-600 via-cyan-600 to-violet-600 text-white hover:opacity-90 transition-all duration-500 hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </div>
                ) : (
                  <span>Save Changes</span>
                )}
              </Button>
            </div>
          </div>

          {/* Action Buttons with enhanced visual feedback */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            <Button
              variant="outline"
              onClick={handleLinkedInImport}
              className="group relative bg-[#0077b5]/5 hover:bg-[#0077b5]/10 border-[#0077b5]/20 hover:border-[#0077b5]/30 text-[#0077b5] transition-all duration-500 hover:scale-[1.02] h-auto py-3"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#0077b5]/0 via-[#0077b5]/5 to-[#0077b5]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-[#0077b5]/10 group-hover:scale-110 transition-transform duration-500">
                  <Linkedin className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium">LinkedIn Import</div>
                  <div className="text-sm text-muted-foreground">Sync with your LinkedIn profile</div>
                </div>
              </div>
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="group relative bg-violet-500/5 hover:bg-violet-500/10 border-violet-500/20 hover:border-violet-500/30 text-violet-600 transition-all duration-500 hover:scale-[1.02] h-auto py-3"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-violet-500/10 group-hover:scale-110 transition-transform duration-500">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Resume Upload</div>
                      <div className="text-sm text-muted-foreground">Import from existing resume</div>
                    </div>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-xl border-white/40 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Upload Resume Content
                  </DialogTitle>
                  <DialogDescription className="text-base text-muted-foreground/80">
                    Let our AI analyze your resume and automatically update your profile
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

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="group relative bg-red-50 hover:bg-red-100/80 border-red-200 hover:border-red-300 text-red-600 transition-all duration-500 hover:scale-[1.02] h-auto py-3"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-red-100 group-hover:bg-red-200 group-hover:scale-110 transition-all duration-500">
                      <Trash2 className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Reset Profile</div>
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

      {/* Enhanced Tabs with smooth transitions */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="relative bg-white/80 backdrop-blur-xl border border-white/40 p-2 mb-8 rounded-2xl overflow-x-auto flex whitespace-nowrap gap-2 shadow-lg">
          <TabsTrigger 
            value="basic" 
            className="group flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium relative transition-all duration-300
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
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-white/10 to-white/20 pointer-events-none rounded-3xl"></div>
          
          <TabsContent value="basic" className="space-y-6 mt-6 relative animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <Card className="bg-gradient-to-br from-white/50 via-white/40 to-white/50 backdrop-blur-xl border-white/40 shadow-2xl transition-all duration-500 hover:shadow-3xl rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative p-8 space-y-8">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">First Name</Label>
                    <Input
                      value={profile.first_name || ''}
                      onChange={(e) => updateField('first_name', e.target.value)}
                      className="focus:border-teal-500/60 focus:ring-teal-500/10"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Last Name</Label>
                    <Input
                      value={profile.last_name || ''}
                      onChange={(e) => updateField('last_name', e.target.value)}
                      className="focus:border-teal-500/60 focus:ring-teal-500/10"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                {/* Contact Information with enhanced icons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <div className="p-1.5 rounded-full bg-teal-100">
                        <Mail className="h-4 w-4 text-teal-600" />
                      </div>
                      Email
                    </Label>
                    <Input
                      type="email"
                      value={profile.email || ''}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="focus:border-teal-500/60 focus:ring-teal-500/10"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <div className="p-1.5 rounded-full bg-cyan-100">
                        <Phone className="h-4 w-4 text-cyan-600" />
                      </div>
                      Phone
                    </Label>
                    <Input
                      type="tel"
                      value={profile.phone_number || ''}
                      onChange={(e) => updateField('phone_number', e.target.value)}
                      className="focus:border-cyan-500/60 focus:ring-cyan-500/10"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-violet-100">
                      <MapPin className="h-4 w-4 text-violet-600" />
                    </div>
                    Location
                  </Label>
                  <Input
                    value={profile.location || ''}
                    onChange={(e) => updateField('location', e.target.value)}
                    className="focus:border-violet-500/60 focus:ring-violet-500/10"
                    placeholder="City, State, Country"
                  />
                </div>

                {/* URLs with enhanced visual feedback */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <div className="p-1.5 rounded-full bg-indigo-100">
                        <Globe className="h-4 w-4 text-indigo-600" />
                      </div>
                      Website
                    </Label>
                    <Input
                      type="url"
                      value={profile.website || ''}
                      onChange={(e) => updateField('website', e.target.value)}
                      className="focus:border-indigo-500/60 focus:ring-indigo-500/10"
                      placeholder="https://your-website.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <div className="p-1.5 rounded-full bg-[#0077b5]/20">
                        <Linkedin className="h-4 w-4 text-[#0077b5]" />
                      </div>
                      LinkedIn URL
                    </Label>
                    <Input
                      type="url"
                      value={profile.linkedin_url || ''}
                      onChange={(e) => updateField('linkedin_url', e.target.value)}
                      className="focus:border-[#0077b5]/60 focus:ring-[#0077b5]/10"
                      placeholder="https://linkedin.com/in/your-profile"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-gray-100">
                      <Github className="h-4 w-4 text-gray-700" />
                    </div>
                    GitHub URL
                  </Label>
                  <Input
                    type="url"
                    value={profile.github_url || ''}
                    onChange={(e) => updateField('github_url', e.target.value)}
                    className="focus:border-gray-500/60 focus:ring-gray-500/10"
                    placeholder="https://github.com/your-username"
                  />
                </div>

                {/* Professional Summary with enhanced textarea */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-rose-100">
                      <FileText className="h-4 w-4 text-rose-600" />
                    </div>
                    Professional Summary
                  </Label>
                  <Textarea
                    value={profile.professional_summary || ''}
                    onChange={(e) => updateField('professional_summary', e.target.value)}
                    className="min-h-[150px] resize-y rounded-xl border-2 border-gray-200/80 bg-white/80 px-4 py-3 text-base shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-gray-500/60 hover:border-gray-300/80 hover:bg-white/90 focus:border-rose-500/60 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:ring-offset-0 focus-visible:outline-none"
                    placeholder="Write a brief summary of your professional background and career objectives..."
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="experience" className="space-y-6 mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <Card className="bg-gradient-to-br from-white/50 via-white/40 to-white/50 backdrop-blur-xl border-white/40 shadow-2xl transition-all duration-500 hover:shadow-3xl rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative p-8">
                <WorkExperienceForm
                  experiences={profile.work_experience}
                  onChange={(experiences) => updateField('work_experience', experiences)}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6 mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <Card className="bg-gradient-to-br from-white/50 via-white/40 to-white/50 backdrop-blur-xl border-white/40 shadow-2xl transition-all duration-500 hover:shadow-3xl rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative p-8">
                <ProjectsForm
                  projects={profile.projects}
                  onChange={(projects) => updateField('projects', projects)}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-6 mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <Card className="bg-gradient-to-br from-white/50 via-white/40 to-white/50 backdrop-blur-xl border-white/40 shadow-2xl transition-all duration-500 hover:shadow-3xl rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative p-8">
                <EducationForm
                  education={profile.education}
                  onChange={(education) => updateField('education', education)}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6 mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <Card className="bg-gradient-to-br from-white/50 via-white/40 to-white/50 backdrop-blur-xl border-white/40 shadow-2xl transition-all duration-500 hover:shadow-3xl rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative p-8">
                <SkillsForm
                  skills={profile.skills}
                  onChange={(skills) => updateField('skills', skills)}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-6 mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <Card className="bg-gradient-to-br from-white/50 via-white/40 to-white/50 backdrop-blur-xl border-white/40 shadow-2xl transition-all duration-500 hover:shadow-3xl rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative p-8">
                <CertificationsForm
                  certifications={profile.certifications}
                  onChange={(certifications) => updateField('certifications', certifications)}
                />
              </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
} 