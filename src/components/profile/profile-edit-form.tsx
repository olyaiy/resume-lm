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
import { updateProfile } from "@/utils/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { User, MapPin, Mail, Phone, Globe, Linkedin, Github, Briefcase, GraduationCap, Wrench, FolderGit2, Award, FileText } from "lucide-react";

interface ProfileEditFormProps {
  profile: Profile;
}

export function ProfileEditForm({ profile: initialProfile }: ProfileEditFormProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
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
            className="bg-white/50 border-white/40"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="bg-white/50 border-white/40">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Experience
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2">
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