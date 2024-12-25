'use client';

import { ResumePreview } from "@/components/resume/resume-preview";
import { updateResume, deleteResume } from "@/utils/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkExperienceForm } from "@/components/resume/work-experience-form";
import { Resume } from "@/lib/types";
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

export function ResumeEditorClient({
  initialResume,
}: {
  initialResume: Resume;
}) {
  const [resume, setResume] = useState(initialResume);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewPanelWidth, setPreviewPanelWidth] = useState<number>(0);
  const previewPanelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const debouncedResume = useDebouncedValue(resume, 500);

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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  className="bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 transition-all duration-500 shadow-md hover:shadow-lg hover:shadow-rose-500/20 hover:-translate-y-0.5"
                  disabled={isDeleting}
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
                    <TabsList className="w-full h-12 bg-white/50 backdrop-blur-sm border border-white/40">
                      <TabsTrigger value="basic" className="flex-1">Basic Info</TabsTrigger>
                      <TabsTrigger value="experience" className="flex-1">Experience</TabsTrigger>
                      <TabsTrigger value="education" className="flex-1">Education</TabsTrigger>
                      <TabsTrigger value="additional" className="flex-1">Additional</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-6 mt-6">
                      <BasicInfoForm
                        resume={resume}
                        onChange={updateField}
                      />
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