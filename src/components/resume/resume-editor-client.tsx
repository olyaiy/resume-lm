'use client';

import { ResumePreview } from "@/components/resume/resume-preview";
import { updateResume, deleteResume } from "@/utils/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkExperienceForm } from "@/components/resume/work-experience-form";
import { Resume, Profile } from "@/lib/types";
import { useState, useRef, useEffect } from "react";
import { EducationForm } from "./education-form";
import { SkillsForm } from "./skills-form";
import { ProjectsForm } from "./projects-form";
import { CertificationsForm } from "./certifications-form";
import { Loader2, Save, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { BasicInfoForm } from "./basic-info-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { DocumentSettingsForm } from "./document-settings-form";

interface ResumeEditorClientProps {
  initialResume: Resume;
  profile: Profile;
}

export function ResumeEditorClient({
  initialResume,
  profile,
}: ResumeEditorClientProps) {
  const [resume, setResume] = useState(initialResume);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewPanelWidth, setPreviewPanelWidth] = useState<number>(0);
  const previewPanelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const debouncedResume = useDebouncedValue(resume, 500);

  const capitalizeWords = (str: string) => {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  useEffect(() => {
    if (previewPanelRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setPreviewPanelWidth(entry.contentRect.width);
        }
      });

      resizeObserver.observe(previewPanelRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

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
    try {
      setIsDeleting(true);
      await deleteResume(resume.id);
      toast({
        title: "Resume deleted",
        description: "Your resume has been permanently removed.",
      });
      router.push('/');
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unable to delete your resume. Please try again.",
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
      <div className="h-20 border-b border-purple-200/50 bg-gradient-to-r from-purple-100/95 via-purple-50/95 to-purple-100/95 backdrop-blur-xl fixed left-0 right-0 z-40 shadow-lg shadow-purple-500/10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3e8ff40_0%,#f0f7ff50_50%,#f3e8ff40_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-40%,#f3e8ff40_0%,transparent_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_100%_100%,#f3e8ff30_0%,transparent_100%)] pointer-events-none" />
        <div className="max-w-[2000px] mx-auto h-full px-6 flex items-center justify-between relative">
          <div className="flex items-center gap-6">
            <Link 
              href="/"
              className="group flex items-center text-sm font-medium text-muted-foreground/70 hover:text-purple-600 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-purple-50/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Dashboard
            </Link>
            <Separator orientation="vertical" className="h-8 bg-gradient-to-b from-purple-200/20 via-purple-200/40 to-purple-200/20" />
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                {resume.is_base_resume ? capitalizeWords(resume.target_role) : resume.name}
              </h1>
              <p className="text-sm text-muted-foreground/60 flex items-center gap-2">
                {resume.is_base_resume ? (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" />
                    Base Resume
                  </>
                ) : (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500" />
                    Tailored Resume
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-500 shadow-md hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-0.5 h-10 px-5 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,#ffffff15_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  className="bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 transition-all duration-500 shadow-md hover:shadow-xl hover:shadow-rose-500/20 hover:-translate-y-0.5 h-10 relative overflow-hidden group"
                  disabled={isDeleting}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,#ffffff15_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Resume
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{resume.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen pt-24 px-6 md:px-8 lg:px-10 pb-10">
        <div className="max-w-[2000px] mx-auto h-[calc(100vh-120px)]">
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full rounded-lg"
          >
            {/* Editor Panel */}
            <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
              <ScrollArea className="h-full">
                <div className="space-y-6 pr-4 pb-6">
                  <Tabs defaultValue="basic" className="w-full">
                    <div className="@container">
                      <TabsList className="w-full h-auto grid grid-cols-3 @[500px]:grid-cols-6 gap-1.5 bg-gradient-to-r from-white/40 via-white/50 to-white/40 backdrop-blur-md border border-white/40 rounded-xl p-1.5 shadow-lg shadow-teal-500/5">
                        <TabsTrigger 
                          value="basic" 
                          className="h-11 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-teal-500/20 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-teal-600 data-[state=inactive]:hover:bg-white/50 transition-all duration-500 rounded-lg font-medium text-sm"
                        >
                          Basic Info
                        </TabsTrigger>
                        <TabsTrigger 
                          value="work" 
                          className="h-11 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-teal-500/20 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-teal-600 data-[state=inactive]:hover:bg-white/50 transition-all duration-500 rounded-lg font-medium text-sm"
                        >
                          Work
                        </TabsTrigger>
                        <TabsTrigger 
                          value="projects" 
                          className="h-11 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-teal-500/20 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-teal-600 data-[state=inactive]:hover:bg-white/50 transition-all duration-500 rounded-lg font-medium text-sm"
                        >
                          Projects
                        </TabsTrigger>
                        <TabsTrigger 
                          value="education" 
                          className="h-11 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-teal-500/20 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-teal-600 data-[state=inactive]:hover:bg-white/50 transition-all duration-500 rounded-lg font-medium text-sm"
                        >
                          Education
                        </TabsTrigger>
                        <TabsTrigger 
                          value="additional" 
                          className="h-11 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-teal-500/20 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-teal-600 data-[state=inactive]:hover:bg-white/50 transition-all duration-500 rounded-lg font-medium text-sm"
                        >
                          Additional
                        </TabsTrigger>
                        <TabsTrigger 
                          value="settings" 
                          className="h-11 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-teal-500/20 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-teal-600 data-[state=inactive]:hover:bg-white/50 transition-all duration-500 rounded-lg font-medium text-sm"
                        >
                          Settings
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="basic" className="space-y-6 mt-6">
                      <BasicInfoForm
                        resume={resume}
                        profile={profile}
                        onChange={updateField}
                      />
                    </TabsContent>

                    <TabsContent value="work" className="space-y-6 mt-6">
                      <WorkExperienceForm
                        experiences={resume.work_experience}
                        onChange={(experiences) => updateField('work_experience', experiences)}
                        profile={profile}
                      />
                    </TabsContent>

                    <TabsContent value="projects" className="space-y-6 mt-6">
                      <ProjectsForm
                        projects={resume.projects}
                        onChange={(projects) => updateField('projects', projects)}
                        profile={profile}
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

                    <TabsContent value="settings" className="space-y-6 mt-6">
                      <DocumentSettingsForm
                        resume={resume}
                        onChange={updateField}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>
            </ResizablePanel>

            {/* Resize Handle */}
            <ResizableHandle withHandle />

            {/* Preview Panel */}
            <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
              <ScrollArea className="h-full">
                <div className="relative pb-[129.4%] w-full" ref={previewPanelRef}>
                  <div className="absolute inset-0">
                    <ResumePreview resume={debouncedResume} containerWidth={previewPanelWidth} />
                  </div>
                </div>
              </ScrollArea>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </main>
  );
} 