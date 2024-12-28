'use client';

import { ResumePreview } from "@/components/resume/resume-preview";
import { updateResume, deleteResume } from "@/utils/actions";
import { Button } from "@/components/ui/button";
import { WorkExperienceForm } from "@/components/resume/work-experience-form";
import { Resume, Profile } from "@/lib/types";
import { useState, useRef, useEffect } from "react";
import { EducationForm } from "./education-form";
import { SkillsForm } from "./skills-form";
import { ProjectsForm } from "./projects-form";
import { CertificationsForm } from "./certifications-form";
import { Loader2, Save, Trash2, ArrowLeft, Bold, Download, User, Briefcase, FolderGit2, GraduationCap, Wrench, Settings, Sparkles, ChevronUp, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoForm } from "./basic-info-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { DocumentSettingsForm } from "./document-settings-form";
import { pdf } from '@react-pdf/renderer';
import { ResumePDFDocument } from './resume-pdf-document';


import ChatBot from "./assistant/chat-bot";


interface ResumeEditorClientProps {
  initialResume: Resume;
  profile: Profile;
}

export function ResumeEditorClient({
  initialResume,
  profile,
}: ResumeEditorClientProps) {
  // Convert initial resume data to use single date string format
  const convertedInitialResume = {
    ...initialResume,
    work_experience: initialResume.work_experience?.map(exp => ({
      ...exp,
      date: exp.date || ''
    })),
    education: initialResume.education?.map(edu => ({
      ...edu,
      date: edu.date || ''
    })),
    projects: initialResume.projects?.map(project => ({
      ...project,
      date: project.date || ''
    })),
    document_settings: initialResume.document_settings || {
      document_font_size: 10,
      document_line_height: 1.5,
      document_margin_vertical: 36,
      document_margin_horizontal: 36,
      header_name_size: 24,
      header_name_bottom_spacing: 24,
      skills_margin_top: 2,
      skills_margin_bottom: 2,
      skills_margin_horizontal: 0,
      skills_item_spacing: 2,
      experience_margin_top: 2,
      experience_margin_bottom: 2,
      experience_margin_horizontal: 0,
      experience_item_spacing: 4,
      projects_margin_top: 2,
      projects_margin_bottom: 2,
      projects_margin_horizontal: 0,
      projects_item_spacing: 4,
      education_margin_top: 2,
      education_margin_bottom: 2,
      education_margin_horizontal: 0,
      education_item_spacing: 4
    }
  };

  const [resume, setResume] = useState(convertedInitialResume);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewPanelWidth, setPreviewPanelWidth] = useState<number>(0);
  const previewPanelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [generation, setGeneration] = useState<string>('');

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

  // Track changes by comparing current resume with initial
  useEffect(() => {
    const hasChanges = JSON.stringify(resume) !== JSON.stringify(convertedInitialResume);
    setHasUnsavedChanges(hasChanges);
  }, [resume, convertedInitialResume]);

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle back navigation
  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation('/');
      setShowExitDialog(true);
    } else {
      router.push('/');
    }
  };

  const handleConfirmNavigation = async () => {
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
    setShowExitDialog(false);
    setPendingNavigation(null);
  };

  const handleCancelNavigation = () => {
    setShowExitDialog(false);
    setPendingNavigation(null);
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50">
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelNavigation}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmNavigation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Leave Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              onClick={handleBackClick}
              className="group flex items-center text-sm font-medium text-purple-600/70 hover:text-purple-600 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-purple-100/30 hover:shadow-sm hover:shadow-purple-500/5 active:bg-purple-100/40"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Dashboard
            </button>

            {/* Separator */}
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-purple-200/40 to-transparent" />

            {/* Resume Title Section */}
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-semibold">
                <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                  {resume.is_base_resume ? capitalizeWords(resume.target_role) : resume.name}
                </span>
              </h1>
              <div className="flex items-center gap-2 text-sm text-purple-600/60">
                {resume.is_base_resume ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-sm shadow-purple-500/20" />
                      <span className="font-medium">Base Resume</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 shadow-sm shadow-pink-500/20" />
                      <span className="font-medium">Tailored Resume</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Download Button */}
            <Button 
              onClick={async () => {
                try {
                  const blob = await pdf(<ResumePDFDocument resume={resume} />).toBlob();
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${resume.first_name}_${resume.last_name}_Resume.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  toast({
                    title: "Download started",
                    description: "Your resume PDF is being downloaded.",
                  });
                } catch (error) {
                  toast({
                    title: "Download failed",
                    description: "Unable to download your resume. Please try again.",
                    variant: "destructive",
                  });
                }
              }}
              size="sm"
              className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 transition-all duration-500 shadow-md hover:shadow-xl hover:shadow-teal-500/20 hover:-translate-y-0.5 h-10 px-5 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,#ffffff20_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>

            {/* Save Button */}
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-500 shadow-md hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-0.5 h-10 px-5 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,#ffffff20_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
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

            {/* Delete Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  className="bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 transition-all duration-500 shadow-md hover:shadow-xl hover:shadow-rose-500/20 hover:-translate-y-0.5 h-10 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
                  disabled={isDeleting}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,#ffffff20_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
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
              <div className="flex flex-col h-full mr-4">
                {/* Main Editor Area */}
                <ScrollArea className="flex-1">
                  <div className="space-y-6 pr-4 pb-6">
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="w-full h-full relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-xl overflow-x-auto grid grid-cols-3 @[500px]:grid-cols-6 gap-1.5 p-1.5 shadow-lg">
                        <TabsTrigger 
                          value="basic" 
                          className="group flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl font-medium relative transition-all duration-300
                            data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500/10 data-[state=active]:to-cyan-500/10
                            data-[state=active]:border-teal-500/20 data-[state=active]:shadow-lg hover:bg-white/60
                            data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
                        >
                          <div className="p-1.5 rounded-full bg-teal-100/80 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:bg-teal-100">
                            <User className="h-4 w-4 text-teal-600 transition-colors group-data-[state=inactive]:text-teal-500/70" />
                          </div>
                          <span className="relative text-xs @[500px]:text-sm">
                            Basic Info
                            <div className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-teal-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
                          </span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="work" 
                          className="group flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl font-medium relative transition-all duration-300
                            data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/10 data-[state=active]:to-blue-500/10
                            data-[state=active]:border-cyan-500/20 data-[state=active]:shadow-lg hover:bg-white/60
                            data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
                        >
                          <div className="p-1.5 rounded-full bg-cyan-100/80 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:bg-cyan-100">
                            <Briefcase className="h-4 w-4 text-cyan-600 transition-colors group-data-[state=inactive]:text-cyan-500/70" />
                          </div>
                          <span className="relative text-xs @[500px]:text-sm">
                            Work
                            <div className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-cyan-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
                          </span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="projects" 
                          className="group flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl font-medium relative transition-all duration-300
                            data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/10 data-[state=active]:to-purple-500/10
                            data-[state=active]:border-violet-500/20 data-[state=active]:shadow-lg hover:bg-white/60
                            data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
                        >
                          <div className="p-1.5 rounded-full bg-violet-100/80 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:bg-violet-100">
                            <FolderGit2 className="h-4 w-4 text-violet-600 transition-colors group-data-[state=inactive]:text-violet-500/70" />
                          </div>
                          <span className="relative text-xs @[500px]:text-sm">
                            Projects
                            <div className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-violet-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
                          </span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="education" 
                          className="group flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl font-medium relative transition-all duration-300
                            data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/10 data-[state=active]:to-blue-500/10
                            data-[state=active]:border-indigo-500/20 data-[state=active]:shadow-lg hover:bg-white/60
                            data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
                        >
                          <div className="p-1.5 rounded-full bg-indigo-100/80 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:bg-indigo-100">
                            <GraduationCap className="h-4 w-4 text-indigo-600 transition-colors group-data-[state=inactive]:text-indigo-500/70" />
                          </div>
                          <span className="relative text-xs @[500px]:text-sm">
                            Education
                            <div className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-indigo-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
                          </span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="skills" 
                          className="group flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl font-medium relative transition-all duration-300
                            data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500/10 data-[state=active]:to-pink-500/10
                            data-[state=active]:border-rose-500/20 data-[state=active]:shadow-lg hover:bg-white/60
                            data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
                        >
                          <div className="p-1.5 rounded-full bg-rose-100/80 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:bg-rose-100">
                            <Wrench className="h-4 w-4 text-rose-600 transition-colors group-data-[state=inactive]:text-rose-500/70" />
                          </div>
                          <span className="relative text-xs @[500px]:text-sm">
                            Skills
                            <div className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-rose-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
                          </span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="settings" 
                          className="group flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl font-medium relative transition-all duration-300
                            data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500/10 data-[state=active]:to-slate-500/10
                            data-[state=active]:border-gray-500/20 data-[state=active]:shadow-lg hover:bg-white/60
                            data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
                        >
                          <div className="p-1.5 rounded-full bg-gray-100/80 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:bg-gray-100">
                            <Settings className="h-4 w-4 text-gray-600 transition-colors group-data-[state=inactive]:text-gray-500/70" />
                          </div>
                          <span className="relative text-xs @[500px]:text-sm">
                            Settings
                            <div className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gray-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
                          </span>
                        </TabsTrigger>
                      </TabsList>

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
                          targetRole={resume.target_role}
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
                          profile={profile}
                        />
                        <CertificationsForm
                          certifications={resume.certifications}
                          onChange={(certifications) => updateField('certifications', certifications)}
                        />
                      </TabsContent>

                      <TabsContent value="skills" className="space-y-6 mt-6">
                        <SkillsForm
                          skills={resume.skills}
                          onChange={(skills) => updateField('skills', skills)}
                          profile={profile}
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
                  {/* AI Assistant Section */}
                 
                  <ChatBot />

                <div>{generation}</div>
                  {/* <TestAssistant /> */}
                </ScrollArea>

                
              </div>
            </ResizablePanel>

            {/* Resize Handle */}
            <ResizableHandle withHandle />

            {/* Preview Panel */}
            <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
              <ScrollArea className="h-full pr-4">
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