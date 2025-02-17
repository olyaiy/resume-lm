'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Profile, WorkExperience, Education, Skill, Project, Resume } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Loader2, FileText, Copy, Wand2, Plus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { createBaseResume } from "@/utils/actions/resumes/actions";
import pdfToText from "react-pdftotext";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { convertTextToResume } from "@/utils/actions/resumes/ai";
import { ApiErrorDialog } from "@/components/ui/api-error-dialog";

interface CreateBaseResumeDialogProps {
  children: React.ReactNode;
  profile: Profile;
}

export function CreateBaseResumeDialog({ children, profile }: CreateBaseResumeDialogProps) {
  const [open, setOpen] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [importOption, setImportOption] = useState<'import-profile' | 'scratch' | 'import-resume'>('import-profile');
  const [isTargetRoleInvalid, setIsTargetRoleInvalid] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{
    work_experience: string[];
    education: string[];
    skills: string[];
    projects: string[];
  }>({
    work_experience: [],
    education: [],
    skills: [],
    projects: []
  });
  const [resumeText, setResumeText] = useState('');
  const router = useRouter();
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState<{ title: string; description: string }>({
    title: "",
    description: ""
  });
  const [isDragging, setIsDragging] = useState(false);

  const getItemId = (type: keyof typeof selectedItems, item: WorkExperience | Education | Skill | Project): string => {
    switch (type) {
      case 'work_experience':
        return `${(item as WorkExperience).company}-${(item as WorkExperience).position}-${(item as WorkExperience).date}`;
      case 'projects':
        return (item as Project).name;
      case 'education':
        return `${(item as Education).school}-${(item as Education).degree}-${(item as Education).field}`;
      case 'skills':
        return (item as Skill).category;
      default:
        return '';
    }
  };

  const handleItemSelection = (section: keyof typeof selectedItems, id: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [section]: prev[section].includes(id)
        ? prev[section].filter(x => x !== id)
        : [...prev[section], id]
    }));
  };

  const handleSectionSelection = (section: keyof typeof selectedItems, checked: boolean) => {
    setSelectedItems(prev => ({
      ...prev,
      [section]: checked 
        ? profile[section].map(item => getItemId(section, item))
        : []
    }));
  };

  const isSectionSelected = (section: keyof typeof selectedItems): boolean => {
    const sectionItems = profile[section].map(item => getItemId(section, item));
    return sectionItems.length > 0 && sectionItems.every(id => selectedItems[section].includes(id));
  };

  const isSectionPartiallySelected = (section: keyof typeof selectedItems): boolean => {
    const sectionItems = profile[section].map(item => getItemId(section, item));
    const selectedCount = sectionItems.filter(id => selectedItems[section].includes(id)).length;
    return selectedCount > 0 && selectedCount < sectionItems.length;
  };

  const handleCreate = async () => {
    if (!targetRole.trim()) {
      setIsTargetRoleInvalid(true);
      setTimeout(() => setIsTargetRoleInvalid(false), 820);
      toast({
        title: "Required Field Missing",
        description: "Target role is a required field. Please enter your target role.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);

      if (importOption === 'import-resume') {
        if (!resumeText.trim()) {
          return;
        }

        // Create an empty resume to pass to convertTextToResume
        const emptyResume: Resume = {
          id: '',
          user_id: '',
          name: targetRole,
          target_role: targetRole,
          is_base_resume: true,
          first_name: '',
          last_name: '',
          email: '',
          work_experience: [],
          education: [],
          skills: [],
          projects: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          has_cover_letter: false,
        };

        // Get model and API key from local storage
        const MODEL_STORAGE_KEY = 'resumelm-default-model';
        const LOCAL_STORAGE_KEY = 'resumelm-api-keys';
        const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
        const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
        let apiKeys = [];
        try {
          apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
        } catch (error) {
          console.error('Error parsing API keys:', error);
        }


        try {
          const convertedResume = await convertTextToResume(resumeText, emptyResume, targetRole, {
            model: selectedModel || '',
            apiKeys
          });
          
          // Extract content sections and basic info for createBaseResume
          const selectedContent = {
            // Basic Info
            first_name: convertedResume.first_name || '',
            last_name: convertedResume.last_name || '',
            email: convertedResume.email || '',
            phone_number: convertedResume.phone_number,
            location: convertedResume.location,
            website: convertedResume.website,
            linkedin_url: convertedResume.linkedin_url,
            github_url: convertedResume.github_url,
            
            // Content Sections
            work_experience: convertedResume.work_experience || [],
            education: convertedResume.education || [],
            skills: convertedResume.skills || [],
            projects: convertedResume.projects || [],
          };
          
          const resume = await createBaseResume(
            targetRole,
            'import-resume',
            selectedContent as Resume
          );
          
          toast({
            title: "Success",
            description: "Resume created successfully",
          });

          router.push(`/resumes/${resume.id}`);
          setOpen(false);
          return;
        } catch (error: Error | unknown) {
          if (error instanceof Error && (
            error.message.toLowerCase().includes('api key') || 
            error.message.toLowerCase().includes('unauthorized') ||
            error.message.toLowerCase().includes('invalid key') ||
            error.message.toLowerCase().includes('invalid x-api-key')
          )) {
            setErrorMessage({
              title: "API Key Error",
              description: "There was an issue with your API key. Please check your settings and try again."
            });
          } else {
            setErrorMessage({
              title: "Error",
              description: "Failed to convert resume text. Please try again."
            });
          }
          setShowErrorDialog(true);
          setIsCreating(false);
          return;
        }
      }

      const selectedContent = {
        work_experience: profile.work_experience.filter(exp => 
          selectedItems.work_experience.includes(getItemId('work_experience', exp))
        ),
        education: profile.education.filter(edu => 
          selectedItems.education.includes(getItemId('education', edu))
        ),
        skills: profile.skills.filter(skill => 
          selectedItems.skills.includes(getItemId('skills', skill))
        ),
        projects: profile.projects.filter(project => 
          selectedItems.projects.includes(getItemId('projects', project))
        ),
      };


      const resume = await createBaseResume(
        targetRole, 
        importOption === 'scratch' ? 'fresh' : importOption,
        selectedContent
      );



      toast({
        title: "Success",
        description: "Resume created successfully",
      });

      router.push(`/resumes/${resume.id}`);
      setOpen(false);
    } catch (error) {
      console.error('Create resume error:', error);
      setErrorMessage({
        title: "Error",
        description: "Failed to create resume. Please try again."
      });
      setShowErrorDialog(true);
    } finally {
      setIsCreating(false);
    }
  };

  // Initialize all items as selected when dialog opens
  const initializeSelectedItems = () => {
    setSelectedItems({
      work_experience: profile.work_experience.map(exp => getItemId('work_experience', exp)),
      education: profile.education.map(edu => getItemId('education', edu)),
      skills: profile.skills.map(skill => getItemId('skills', skill)),
      projects: profile.projects.map(project => getItemId('projects', project))
    });
  };

  // Reset form and initialize selected items when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Move focus back to the trigger when closing
      const trigger = document.querySelector('[data-state="open"]');
      if (trigger) {
        (trigger as HTMLElement).focus();
      }
    }
    setOpen(newOpen);
    if (newOpen) {
      setTargetRole('');
      setImportOption('import-profile');
      initializeSelectedItems();
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === "application/pdf");

    if (pdfFile) {
      try {
        const text = await pdfToText(pdfFile);
        setResumeText(prev => prev + (prev ? "\n\n" : "") + text);
      } catch {
        toast({
          title: "PDF Processing Error",
          description: "Failed to extract text from the PDF. Please try again or paste the content manually.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Invalid File",
        description: "Please drop a PDF file.",
        variant: "destructive",
      });
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      try {
        const text = await pdfToText(file);
        setResumeText(prev => prev + (prev ? "\n\n" : "") + text);
      } catch {
        toast({
          title: "PDF Processing Error",
          description: "Failed to extract text from the PDF. Please try again or paste the content manually.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className={cn(
        "sm:max-w-[800px] p-0 max-h-[90vh] overflow-y-auto",
        "bg-gradient-to-b backdrop-blur-2xl border-white/40 shadow-2xl",
        "from-purple-50/95 to-indigo-50/90 border-purple-200/40",
        "rounded-xl"
      )}>
        <style jsx global>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
            20%, 40%, 60%, 80% { transform: translateX(2px); }
          }
          .shake {
            animation: shake 0.8s cubic-bezier(.36,.07,.19,.97) both;
          }
        `}</style>
        {/* Header Section with Icon */}
        <div className={cn(
          "relative px-8 pt-6 pb-4 border-b top-0 z-10 bg-white/50 backdrop-blur-xl",
          "border-purple-200/20"
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-xl transition-all duration-300",
              "bg-gradient-to-br from-purple-100/80 to-indigo-100/80 border border-purple-200/60"
            )}>
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-purple-950">
                Create Base Resume
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                Create a new base resume template that you can use for multiple job applications
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-8 py-6 space-y-6 bg-gradient-to-b from-purple-50/30 to-indigo-50/30">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label 
                htmlFor="target-role"
                className="text-lg font-medium text-purple-950"
              >
                Target Role <span className="text-red-500">*</span>
              </Label>
              <Input
                id="target-role"
                placeholder="e.g., Senior Software Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className={cn(
                  "bg-white/80 border-gray-200 h-12 text-base focus:border-purple-500 focus:ring-purple-500/20 placeholder:text-gray-400",
                  isTargetRoleInvalid && "border-red-500 shake"
                )}
                required
              />
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium text-purple-950">
                Resume Content
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <input
                    type="radio"
                    id="import-profile"
                    name="importOption"
                    value="import-profile"
                    checked={importOption === 'import-profile'}
                    onChange={(e) => setImportOption(e.target.value as 'import-profile' | 'scratch' | 'import-resume')}
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="import-profile"
                    className={cn(
                      "flex items-center h-[88px] rounded-lg p-3",
                      "bg-white border shadow-sm",
                      "hover:border-purple-200 hover:bg-purple-50/50",
                      "transition-all duration-300 cursor-pointer",
                      "peer-checked:border-purple-500 peer-checked:bg-purple-50",
                      "peer-checked:shadow-md peer-checked:shadow-purple-100"
                    )}
                  >
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 flex items-center justify-center shrink-0">
                      <Copy className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-3 flex flex-col">
                      <div className="font-medium text-sm text-purple-950">Import from Profile</div>
                      <span className="text-xs text-gray-600 line-clamp-2">
                        Import your experience and skills
                      </span>
                    </div>
                  </Label>
                </div>

                <div>
                  <input
                    type="radio"
                    id="import-resume"
                    name="importOption"
                    value="import-resume"
                    checked={importOption === 'import-resume'}
                    onChange={(e) => setImportOption(e.target.value as 'import-profile' | 'scratch' | 'import-resume')}
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="import-resume"
                    className={cn(
                      "flex items-center h-[88px] rounded-lg p-3",
                      "bg-white border shadow-sm",
                      "hover:border-purple-200 hover:bg-purple-50/50",
                      "transition-all duration-300 cursor-pointer",
                      "peer-checked:border-purple-500 peer-checked:bg-purple-50",
                      "peer-checked:shadow-md peer-checked:shadow-purple-100"
                    )}
                  >
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 flex items-center justify-center shrink-0">
                      <Plus className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-3 flex flex-col">
                      <div className="font-medium text-sm text-purple-950">Import from Resume</div>
                      <span className="text-xs text-gray-600 line-clamp-2">
                        Paste your existing resume
                      </span>
                    </div>
                  </Label>
                </div>

                <div>
                  <input
                    type="radio"
                    id="scratch"
                    name="importOption"
                    value="scratch"
                    checked={importOption === 'scratch'}
                    onChange={(e) => setImportOption(e.target.value as 'import-profile' | 'scratch' | 'import-resume')}
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="scratch"
                    className={cn(
                      "flex items-center h-[88px] rounded-lg p-3",
                      "bg-white border shadow-sm",
                      "hover:border-purple-200 hover:bg-purple-50/50",
                      "transition-all duration-300 cursor-pointer",
                      "peer-checked:border-purple-500 peer-checked:bg-purple-50",
                      "peer-checked:shadow-md peer-checked:shadow-purple-100"
                    )}
                  >
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 flex items-center justify-center shrink-0">
                      <Wand2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-3 flex flex-col">
                      <div className="font-medium text-sm text-purple-950">Start Fresh</div>
                      <span className="text-xs text-gray-600 line-clamp-2">
                        Create a blank resume
                      </span>
                    </div>
                  </Label>
                </div>
              </div>

              {importOption === 'import-profile' && (
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <Accordion type="single" collapsible className="space-y-4">
                      {/* Work Experience */}
                      <AccordionItem value="work-experience" className="shadow-2xl border-b border-black/30">
                        <div className="flex items-center w-full gap-2">
                          <Checkbox
                            id="work-experience-section"
                            checked={isSectionSelected('work_experience')}
                            onCheckedChange={(checked) => handleSectionSelection('work_experience', checked as boolean)}
                            className={cn(
                              "mt-0.5 ml-2",
                              isSectionPartiallySelected('work_experience') && "data-[state=checked]:bg-purple-600/50"
                            )}
                          />
                          <AccordionTrigger className="w-full py-2 hover:no-underline group ">
                            <div className="flex flex-col items-start w-full">
                              <span className="text-sm font-semibold text-purple-950 group-hover:text-purple-950">
                                Work Experience
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {profile.work_experience.length} {profile.work_experience.length === 1 ? 'position' : 'positions'}
                              </span>
                            </div>
                          </AccordionTrigger>
                        </div>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            {profile.work_experience.map((exp: WorkExperience) => {
                              const id = getItemId('work_experience', exp);
                              return (
                                <div
                                  key={id}
                                  className="flex items-start space-x-2 p-2.5 rounded-md border border-gray-200 bg-white/50 hover:bg-white/80 transition-colors"
                                >
                                  <Checkbox
                                    id={id}
                                    checked={selectedItems.work_experience.includes(id)}
                                    onCheckedChange={() => handleItemSelection('work_experience', id)}
                                    className="mt-0.5 ml-2"
                                  />
                                  <div 
                                    className="flex-1 cursor-pointer"
                                    onClick={() => handleItemSelection('work_experience', id)}
                                  >
                                    <div className="flex items-baseline justify-between">
                                      <div className="font-medium text-sm">{exp.position}</div>
                                      <div className="text-xs text-muted-foreground">{exp.date}</div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">{exp.company}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Skills */}
                      <AccordionItem value="skills" className="shadow-2xl border-b border-black/30">
                        <div className="flex items-center w-full gap-2">
                          <Checkbox
                            id="skills-section"
                            checked={isSectionSelected('skills')}
                            onCheckedChange={(checked) => handleSectionSelection('skills', checked as boolean)}
                            className={cn(
                              "mt-0.5 ml-2",
                              isSectionPartiallySelected('skills') && "data-[state=checked]:bg-purple-600/50"
                            )}
                          />
                          <AccordionTrigger className="w-full py-2 hover:no-underline group">
                            <div className="flex flex-col items-start w-full">
                              <span className="text-sm font-semibold text-purple-950 group-hover:text-purple-950">
                                Skills
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {profile.skills.length} {profile.skills.length === 1 ? 'category' : 'categories'}
                              </span>
                            </div>
                          </AccordionTrigger>
                        </div>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            {profile.skills.map((skill: Skill) => {
                              const id = getItemId('skills', skill);
                              return (
                                <div
                                  key={id}
                                  className="flex items-start space-x-2 p-2.5 rounded-md border border-gray-200 bg-white/50 hover:bg-white/80 transition-colors"
                                >
                                  <Checkbox
                                    id={id}
                                    checked={selectedItems.skills.includes(id)}
                                    onCheckedChange={() => handleItemSelection('skills', id)}
                                    className="mt-0.5 ml-2"
                                  />
                                  <div 
                                    className="flex-1 cursor-pointer"
                                    onClick={() => handleItemSelection('skills', id)}
                                  >
                                    <div className="font-medium text-sm mb-1">{skill.category}</div>
                                    <div className="flex flex-wrap gap-1">
                                      {skill.items.map((item: string, index: number) => (
                                        <Badge
                                          key={index}
                                          variant="secondary"
                                          className="bg-white/60 text-purple-700 border border-purple-200 text-[10px] px-1.5 py-0"
                                        >
                                          {item}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <Accordion type="single" collapsible className="space-y-4">
                      {/* Projects */}
                      <AccordionItem value="projects" className="shadow-2xl border-b border-black/30">
                        <div className="flex items-center w-full gap-2">
                          <Checkbox
                            id="projects-section"
                            checked={isSectionSelected('projects')}
                            onCheckedChange={(checked) => handleSectionSelection('projects', checked as boolean)}
                            className={cn(
                              "mt-0.5 ml-2",
                              isSectionPartiallySelected('projects') && "data-[state=checked]:bg-purple-600/50"
                            )}
                          />
                          <AccordionTrigger className="w-full py-2 hover:no-underline group">
                            <div className="flex flex-col items-start w-full">
                              <span className="text-sm font-semibold text-purple-950 group-hover:text-purple-950">
                                Projects
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {profile.projects.length} {profile.projects.length === 1 ? 'project' : 'projects'}
                              </span>
                            </div>
                          </AccordionTrigger>
                        </div>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            {profile.projects.map((project: Project) => {
                              const id = getItemId('projects', project);
                              return (
                                <div
                                  key={id}
                                  className="flex items-start space-x-2 p-2.5 rounded-md border border-gray-200 bg-white/50 hover:bg-white/80 transition-colors"
                                >
                                  <Checkbox
                                    id={id}
                                    checked={selectedItems.projects.includes(id)}
                                    onCheckedChange={() => handleItemSelection('projects', id)}
                                    className="mt-0.5 ml-2"
                                  />
                                  <div 
                                    className="flex-1 cursor-pointer"
                                    onClick={() => handleItemSelection('projects', id)}
                                  >
                                    <div className="flex items-baseline justify-between">
                                      <div className="font-medium text-sm">{project.name}</div>
                                      {project.date && (
                                        <div className="text-xs text-muted-foreground">{project.date}</div>
                                      )}
                                    </div>
                                    {project.technologies && (
                                      <div className="text-xs text-muted-foreground line-clamp-1">
                                        {project.technologies.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Education */}
                      <AccordionItem value="education" className="shadow-2xl border-b border-black/30">
                        <div className="flex items-center w-full gap-2">
                          <Checkbox
                            id="education-section"
                            checked={isSectionSelected('education')}
                            onCheckedChange={(checked) => handleSectionSelection('education', checked as boolean)}
                            className={cn(
                              "mt-0.5 ml-2",
                              isSectionPartiallySelected('education') && "data-[state=checked]:bg-purple-600/50"
                            )}
                          />
                          <AccordionTrigger className="w-full py-2 hover:no-underline group">
                            <div className="flex flex-col items-start w-full">
                              <span className="text-sm font-semibold text-purple-950 group-hover:text-purple-950">
                                Education
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {profile.education.length} {profile.education.length === 1 ? 'institution' : 'institutions'}
                              </span>
                            </div>
                          </AccordionTrigger>
                        </div>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            {profile.education.map((edu: Education) => {
                              const id = getItemId('education', edu);
                              return (
                                <div
                                  key={id}
                                  className="flex items-start space-x-2 p-2.5 rounded-md border border-gray-200 bg-white/50 hover:bg-white/80 transition-colors"
                                >
                                  <Checkbox
                                    id={id}
                                    checked={selectedItems.education.includes(id)}
                                    onCheckedChange={() => handleItemSelection('education', id)}
                                    className="mt-0.5 ml-2"
                                  />
                                  <div 
                                    className="flex-1 cursor-pointer"
                                    onClick={() => handleItemSelection('education', id)}
                                  >
                                    <div className="flex items-baseline justify-between">
                                      <div className="font-medium text-sm">{`${edu.degree} in ${edu.field}`}</div>
                                      <div className="text-xs text-muted-foreground">{edu.date}</div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">{edu.school}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              )}

              {importOption === 'import-resume' && (
                <div className="space-y-4">
                  <label
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 transition-colors duration-200 cursor-pointer group",
                      isDragging
                        ? "border-purple-500 bg-purple-50/50"
                        : "border-gray-200 hover:border-purple-500/50 hover:bg-purple-50/10"
                    )}
                  >
                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf"
                      onChange={handleFileInput}
                    />
                    <Upload className="w-10 h-10 text-purple-500 group-hover:scale-110 transition-transform duration-200" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        Drop your PDF resume here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse files
                      </p>
                    </div>
                  </label>
                  <div className="relative">
                    <div className="absolute -top-3 left-3 bg-white px-2 text-sm text-muted-foreground">
                      Or paste your resume text here
                    </div>
                    <Textarea
                      id="resume-text"
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Start pasting your resume content here..."
                      className="min-h-[200px] bg-white/80 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 pt-4"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Dialog */}
        <ApiErrorDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        errorMessage={errorMessage}
        onUpgrade={() => {
          setShowErrorDialog(false);
          window.location.href = '/subscription';
        }}
        onSettings={() => {
          setShowErrorDialog(false);
          window.location.href = '/settings';
        }}
      />

        {/* Footer Section */}
        <div className={cn(
          "px-8 py-4 border-t sticky bottom-0 z-10 bg-white/50 backdrop-blur-xl",
          "border-purple-200/20 bg-white/40"
        )}>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className={cn(
                "border-gray-200 text-gray-600",
                "hover:bg-white/60",
                "hover:border-purple-200"
              )}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={isCreating}
              className={cn(
                "text-white shadow-lg hover:shadow-xl transition-all duration-500",
                "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              )}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Resume'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 