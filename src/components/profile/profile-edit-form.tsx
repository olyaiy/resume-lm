'use client';

import { Profile } from "@/lib/types";
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
  const [testPrompt, setTestPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isTestingAI, setIsTestingAI] = useState(false);
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
      console.log('📝 First 100 chars of content:', resumeContent.substring(0, 100));
      
      const messages = [
        { 
          role: "user" as const, 
          content: `Please parse this resume content and format it according to the schema: ${resumeContent}` 
        }
      ];
      
      console.log('📤 Sending to AI with messages:', JSON.stringify(messages, null, 2));
      
      const result = await formatProfileWithAI(messages);
      console.log('📥 Received AI response:', result ? result.substring(0, 100) : 'No result');
      
      if (result) {
        console.log('🔄 Attempting to parse AI response as JSON...');
        const parsedProfile = JSON.parse(result);
        console.log('✅ Successfully parsed JSON. Profile structure:', Object.keys(parsedProfile));
        
        // Clean the parsed profile to only include valid fields
        const cleanedProfile: Partial<Profile> = {
          first_name: parsedProfile.first_name,
          last_name: parsedProfile.last_name,
          email: parsedProfile.email,
          phone_number: parsedProfile.phone_number,
          location: parsedProfile.location,
          website: parsedProfile.website,
          linkedin_url: parsedProfile.linkedin_url,
          github_url: parsedProfile.github_url,
          professional_summary: parsedProfile.professional_summary,
          work_experience: parsedProfile.work_experience,
          education: parsedProfile.education,
          skills: parsedProfile.skills,
          projects: parsedProfile.projects,
          certifications: parsedProfile.certifications
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

  const handleTestAI = async () => {
    try {
      setIsTestingAI(true);
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "user" as const, content: testPrompt }
      ];
      const result = await formatProfileWithAI(messages);
      setAiResponse(result || "No response");
    } catch (error) {
      toast.error("AI test failed");
      console.error(error);
    } finally {
      setIsTestingAI(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 bg-white/40 backdrop-blur-md rounded-xl border border-white/40 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Edit Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Update your profile information used to generate resumes
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="bg-white/50 border-white/40 hover:bg-white/60 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:opacity-90 transition-all duration-300"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex-1 min-w-[200px]">
            <Button
              variant="outline"
              onClick={handleLinkedInImport}
              className="w-full bg-[#0077b5]/10 hover:bg-[#0077b5]/20 border-[#0077b5]/20 hover:border-[#0077b5]/30 text-[#0077b5] transition-all duration-300"
            >
              <Linkedin className="h-4 w-4 mr-2" />
              Import from LinkedIn
            </Button>
          </div>

          <div className="flex-1 min-w-[200px]">
            {resumeUploadButton}
          </div>

          <div className="flex-1 min-w-[200px]">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full bg-red-500/10 hover:bg-red-500/20 border-red-500/20 hover:border-red-500/30 text-red-600 transition-all duration-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset Profile
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white/95 backdrop-blur-md border-white/40">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will reset your entire profile to empty state. All your current profile data will be permanently deleted.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/50 hover:bg-white/60">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleReset}
                    disabled={isResetting}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    {isResetting ? "Resetting..." : "Reset Profile"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-red-100/20 backdrop-blur-md rounded-xl border border-red-200/40 p-6 mt-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-red-600">AI Testing Interface (Temporary)</h2>
          </div>
          <div className="flex gap-3">
            <Input
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Enter test prompt..."
              className="flex-1 bg-white/50 border-white/40"
            />
            <Button
              onClick={handleTestAI}
              disabled={isTestingAI || !testPrompt}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isTestingAI ? "Testing..." : "Test AI"}
            </Button>
          </div>
          {aiResponse && (
            <div className="bg-white/40 backdrop-blur-md rounded-lg p-4 mt-2">
              <pre className="whitespace-pre-wrap text-sm">
                {aiResponse}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Form Content */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="bg-white/50 border-white/40 p-1 mb-6">
          <TabsTrigger value="basic" className="flex items-center gap-2 data-[state=active]:bg-white/80">
            <User className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex items-center gap-2 data-[state=active]:bg-white/80">
            <Briefcase className="h-4 w-4" />
            Experience
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2 data-[state=active]:bg-white/80">
            <GraduationCap className="h-4 w-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2 data-[state=active]:bg-white/80">
            <Wrench className="h-4 w-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2 data-[state=active]:bg-white/80">
            <Award className="h-4 w-4" />
            Certifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6 mt-6">
          <Card className="bg-white/40 backdrop-blur-md border-white/40">
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">First Name</Label>
                  <Input
                    value={profile.first_name || ''}
                    onChange={(e) => updateField('first_name', e.target.value)}
                    className="bg-white/50 border-white/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Last Name</Label>
                  <Input
                    value={profile.last_name || ''}
                    onChange={(e) => updateField('last_name', e.target.value)}
                    className="bg-white/50 border-white/40"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="bg-white/50 border-white/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </Label>
                  <Input
                    type="tel"
                    value={profile.phone_number || ''}
                    onChange={(e) => updateField('phone_number', e.target.value)}
                    className="bg-white/50 border-white/40"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <Input
                  value={profile.location || ''}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="bg-white/50 border-white/40"
                  placeholder="City, State, Country"
                />
              </div>

              {/* URLs */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </Label>
                  <Input
                    type="url"
                    value={profile.website || ''}
                    onChange={(e) => updateField('website', e.target.value)}
                    className="bg-white/50 border-white/40"
                    placeholder="https://your-website.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn URL
                  </Label>
                  <Input
                    type="url"
                    value={profile.linkedin_url || ''}
                    onChange={(e) => updateField('linkedin_url', e.target.value)}
                    className="bg-white/50 border-white/40"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub URL
                </Label>
                <Input
                  type="url"
                  value={profile.github_url || ''}
                  onChange={(e) => updateField('github_url', e.target.value)}
                  className="bg-white/50 border-white/40"
                  placeholder="https://github.com/your-username"
                />
              </div>

              {/* Professional Summary */}
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Professional Summary
                </Label>
                <Textarea
                  value={profile.professional_summary || ''}
                  onChange={(e) => updateField('professional_summary', e.target.value)}
                  className="bg-white/50 border-white/40 min-h-[150px]"
                  placeholder="Write a brief summary of your professional background and career objectives..."
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="space-y-6 mt-6">
          <WorkExperienceForm
            experiences={profile.work_experience}
            onChange={(experiences) => updateField('work_experience', experiences)}
          />
          <ProjectsForm
            projects={profile.projects}
            onChange={(projects) => updateField('projects', projects)}
          />
        </TabsContent>

        <TabsContent value="education" className="space-y-6 mt-6">
          <EducationForm
            education={profile.education}
            onChange={(education) => updateField('education', education)}
          />
        </TabsContent>

        <TabsContent value="skills" className="space-y-6 mt-6">
          <SkillsForm
            skills={profile.skills}
            onChange={(skills) => updateField('skills', skills)}
          />
        </TabsContent>

        <TabsContent value="certifications" className="space-y-6 mt-6">
          <CertificationsForm
            certifications={profile.certifications}
            onChange={(certifications) => updateField('certifications', certifications)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 