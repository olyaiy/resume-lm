'use client';

import { ResumePreview } from "@/components/resume/resume-preview";
import { updateResume } from "@/utils/actions";
import { deleteResume } from "@/utils/supabase/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { WorkExperienceForm } from "@/components/resume/work-experience-form";
import { Resume } from "@/lib/types";
import { useState } from "react";
import { EducationForm } from "./education-form";
import { SkillsForm } from "./skills-form";
import { ProjectsForm } from "./projects-form";
import { CertificationsForm } from "./certifications-form";
import { Loader2, Save, Trash2, ArrowLeft, Globe, Linkedin, Github, User, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export function ResumeEditorClient({
  initialResume,
}: {
  initialResume: Resume;
}) {
  const [resume, setResume] = useState(initialResume);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const updateField = (field: keyof Resume, value: any) => {
    setResume(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateResume(resume.id, resume);
      toast({
        title: "Changes saved",
        description: "Your resume has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Unable to save your changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteResume(resume.id);
      toast({
        title: "Resume deleted",
        description: "Your resume has been permanently removed.",
      });
      router.push('/');
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Unable to delete your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-teal-200/20 to-cyan-200/20 blur-3xl animate-blob opacity-70" />
        <div className="absolute top-[20%] -right-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-200/20 to-indigo-200/20 blur-3xl animate-blob animation-delay-2000 opacity-70" />
        <div className="absolute -bottom-[40%] left-[20%] w-[75%] h-[75%] rounded-full bg-gradient-to-br from-pink-200/20 to-rose-200/20 blur-3xl animate-blob animation-delay-4000 opacity-70" />
      </div>

      {/* Top Bar */}
      <div className="h-16 border-b border-white/20 bg-white/80 backdrop-blur-xl fixed left-0 right-0 z-40 shadow-sm">
        <div className="max-w-[2000px] mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="group flex items-center text-sm text-muted-foreground hover:text-teal-600 transition-colors duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform duration-300" />
              Back to Dashboard
            </Link>
            <Separator orientation="vertical" className="h-4 bg-muted/50" />
            <h1 className="text-lg font-medium bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              {resume.name}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              size="sm"
              className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 transition-all duration-500 shadow-md hover:shadow-lg hover:shadow-teal-500/20 hover:-translate-y-0.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Saving changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-3.5 w-3.5" />
                  Save Changes
                </>
              )}
            </Button>
            <Button 
              onClick={handleDelete} 
              disabled={isDeleting}
              size="sm"
              variant="destructive"
              className="bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 transition-all duration-500 shadow-md hover:shadow-lg hover:shadow-rose-500/20 hover:-translate-y-0.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete Resume
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen pt-24 px-6 md:px-8 lg:px-10 pb-10">
        <div className="max-w-[2000px] mx-auto h-[calc(100vh-120px)]">
          <div className="grid h-full grid-cols-1 lg:grid-cols-[minmax(400px,_1fr)_minmax(600px,_2fr)] gap-8">
            {/* Editor Column */}
            <ScrollArea className="h-full">
              <div className="space-y-6 pr-4 pb-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="w-full h-12 bg-white/50 backdrop-blur-sm border border-white/40">
                    <TabsTrigger value="basic" className="flex-1">Basic Info</TabsTrigger>
                    <TabsTrigger value="experience" className="flex-1">Experience</TabsTrigger>
                    <TabsTrigger value="education" className="flex-1">Education</TabsTrigger>
                    <TabsTrigger value="additional" className="flex-1">Additional</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6 mt-6">
                    {/* Basic Information Card */}
                    <Card className="group bg-white/40 hover:bg-white/50 backdrop-blur-md border-white/40 shadow-lg hover:shadow-xl transition-all duration-500">
                      <CardHeader>
                        <CardTitle className="text-xl bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent group-hover:scale-[1.01] transition-transform duration-500">
                          Personal Details
                        </CardTitle>
                        <CardDescription>
                          Enter your contact information and basic details
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="first_name" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              <User className="h-3.5 w-3.5" />
                              First Name
                            </Label>
                            <Input 
                              id="first_name" 
                              value={resume.first_name || ''} 
                              onChange={(e) => updateField('first_name', e.target.value)}
                              className="bg-white/50 border-white/40 focus:border-teal-500 transition-all duration-300 hover:bg-white/60 focus:ring-2 focus:ring-teal-500/20"
                              placeholder="John"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="last_name" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              <User className="h-3.5 w-3.5" />
                              Last Name
                            </Label>
                            <Input 
                              id="last_name" 
                              value={resume.last_name || ''} 
                              onChange={(e) => updateField('last_name', e.target.value)}
                              className="bg-white/50 border-white/40 focus:border-teal-500 transition-all duration-300 hover:bg-white/60 focus:ring-2 focus:ring-teal-500/20"
                              placeholder="Doe"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5" />
                            Email Address
                          </Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={resume.email || ''} 
                            onChange={(e) => updateField('email', e.target.value)}
                            className="bg-white/50 border-white/40 focus:border-teal-500 transition-all duration-300 hover:bg-white/60 focus:ring-2 focus:ring-teal-500/20"
                            placeholder="john.doe@example.com"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5" />
                            Phone Number
                          </Label>
                          <Input 
                            id="phone" 
                            value={resume.phone_number || ''} 
                            onChange={(e) => updateField('phone_number', e.target.value)}
                            className="bg-white/50 border-white/40 focus:border-teal-500 transition-all duration-300 hover:bg-white/60 focus:ring-2 focus:ring-teal-500/20"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" />
                            Location
                          </Label>
                          <Input 
                            id="location" 
                            value={resume.location || ''} 
                            onChange={(e) => updateField('location', e.target.value)}
                            className="bg-white/50 border-white/40 focus:border-teal-500 transition-all duration-300 hover:bg-white/60 focus:ring-2 focus:ring-teal-500/20"
                            placeholder="San Francisco, CA"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Online Presence Card */}
                    <Card className="group bg-white/40 hover:bg-white/50 backdrop-blur-md border-white/40 shadow-lg hover:shadow-xl transition-all duration-500">
                      <CardHeader>
                        <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-[1.01] transition-transform duration-500">
                          Online Presence
                        </CardTitle>
                        <CardDescription>
                          Add your professional online profiles and portfolio
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="website" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5" />
                            Personal Website
                          </Label>
                          <Input 
                            id="website" 
                            value={resume.website || ''} 
                            onChange={(e) => updateField('website', e.target.value)}
                            className="bg-white/50 border-white/40 focus:border-purple-500 transition-all duration-300 hover:bg-white/60 focus:ring-2 focus:ring-purple-500/20"
                            placeholder="https://johndoe.com"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="linkedin" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Linkedin className="h-3.5 w-3.5" />
                            LinkedIn Profile
                          </Label>
                          <Input 
                            id="linkedin" 
                            value={resume.linkedin_url || ''} 
                            onChange={(e) => updateField('linkedin_url', e.target.value)}
                            className="bg-white/50 border-white/40 focus:border-purple-500 transition-all duration-300 hover:bg-white/60 focus:ring-2 focus:ring-purple-500/20"
                            placeholder="https://linkedin.com/in/johndoe"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="github" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Github className="h-3.5 w-3.5" />
                            GitHub Profile
                          </Label>
                          <Input 
                            id="github" 
                            value={resume.github_url || ''} 
                            onChange={(e) => updateField('github_url', e.target.value)}
                            className="bg-white/50 border-white/40 focus:border-purple-500 transition-all duration-300 hover:bg-white/60 focus:ring-2 focus:ring-purple-500/20"
                            placeholder="https://github.com/johndoe"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Professional Summary Card */}
                    <Card className="group bg-white/40 hover:bg-white/50 backdrop-blur-md border-white/40 shadow-lg hover:shadow-xl transition-all duration-500">
                      <CardHeader>
                        <CardTitle className="text-xl bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent group-hover:scale-[1.01] transition-transform duration-500">
                          Professional Summary
                        </CardTitle>
                        <CardDescription>
                          Write a compelling summary of your professional background
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea 
                          className="min-h-[150px] bg-white/50 border-white/40 focus:border-pink-500 transition-all duration-300 hover:bg-white/60 focus:ring-2 focus:ring-pink-500/20"
                          value={resume.professional_summary || ''}
                          onChange={(e) => updateField('professional_summary', e.target.value)}
                          placeholder="A passionate professional with X years of experience..."
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="experience" className="space-y-6 mt-6">
                    <WorkExperienceForm
                      experiences={resume.work_experience}
                      onChange={(experiences) => updateField('work_experience', experiences)}
                    />
                    <ProjectsForm
                      projects={resume.projects}
                      onChange={(projects) => updateField('projects', projects)}
                    />
                  </TabsContent>

                  <TabsContent value="education" className="space-y-6 mt-6">
                    <EducationForm
                      education={resume.education}
                      onChange={(education) => updateField('education', education)}
                    />
                    <CertificationsForm
                      certifications={resume.certifications}
                      onChange={(certifications) => updateField('certifications', certifications)}
                    />
                  </TabsContent>

                  <TabsContent value="additional" className="space-y-6 mt-6">
                    <SkillsForm
                      skills={resume.skills}
                      onChange={(skills) => updateField('skills', skills)}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>

            {/* Preview Column */}
            <div className="h-full">
              <Card className="h-full bg-white/40 hover:bg-white/50 backdrop-blur-md border-white/40 shadow-lg hover:shadow-xl transition-all duration-500">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-xl bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Resume Preview
                  </CardTitle>
                  <CardDescription>
                    Live preview of how your resume will look
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 h-[calc(100%-5rem)]">
                  <ScrollArea className="h-full rounded-b-lg">
                    <div className="p-6">
                      <ResumePreview resume={resume} />
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 