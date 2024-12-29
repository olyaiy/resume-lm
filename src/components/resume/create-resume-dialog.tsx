'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Resume, Profile, WorkExperience, Education, Skill, Project } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Loader2, FileText, Sparkles, Brain, Wand2, Copy, ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { importProfileToResume } from "@/utils/ai";
import { createClient } from "@/utils/supabase/client";
import { createBaseResume } from "@/utils/actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface MiniResumePreviewProps {
  name: string;
  type: 'base' | 'tailored';
  className?: string;
}

function MiniResumePreview({ name, type, className }: MiniResumePreviewProps) {
  const gradientFrom = type === 'base' ? 'purple-600' : 'pink-600';
  const gradientTo = type === 'base' ? 'indigo-600' : 'rose-600';
  const accentBorder = type === 'base' ? 'purple-200' : 'pink-200';

  return (
    <div className={cn(
      "relative w-full aspect-[8.5/11]",
      "flex flex-col items-center justify-center",
      "rounded-lg overflow-hidden",
      "border shadow-lg",
      `border-${accentBorder}`,
      "bg-white/80 backdrop-blur-sm",
      "transition-all duration-300",
      "group",
      className
    )}>
      {/* Background gradient */}
      <div className="absolute inset-0 opacity-5">
        <div className={cn(
          "absolute inset-0",
          `bg-gradient-to-br from-${gradientFrom} to-${gradientTo}`
        )} />
      </div>

      {/* Content */}
      <div className="relative px-3 py-4 text-center">
        <div className={cn(
          "text-xs font-medium line-clamp-2",
          `text-${gradientFrom}`
        )}>
          {name}
        </div>
      </div>

      {/* Lines to simulate text */}
      <div className="absolute inset-x-4 top-1/3 space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 rounded-full",
              `bg-${gradientFrom}/10`,
              "w-full"
            )}
          />
        ))}
      </div>
    </div>
  );
}

interface CreateResumeDialogProps {
  children: React.ReactNode;
  type: 'base' | 'tailored';
  baseResumes?: Resume[];
  profile: Profile;
}

export function CreateResumeDialog({ children, type, baseResumes, profile }: CreateResumeDialogProps) {
  const [open, setOpen] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [selectedBaseResume, setSelectedBaseResume] = useState<string>(baseResumes?.[0]?.id || '');
  const [jobDescription, setJobDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [importOption, setImportOption] = useState<'import-all' | 'ai' | 'scratch'>('import-all');
  const [isTargetRoleInvalid, setIsTargetRoleInvalid] = useState(false);
  const [isBaseResumeInvalid, setIsBaseResumeInvalid] = useState(false);
  const [isJobDescriptionInvalid, setIsJobDescriptionInvalid] = useState(false);
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
  const router = useRouter();

  const getItemId = (type: keyof typeof selectedItems, item: any): string => {
    switch (type) {
      case 'work_experience':
        return `${item.company}-${item.position}-${item.date}`;
      case 'projects':
        return item.name;
      case 'education':
        return `${item.school}-${item.degree}-${item.field}`;
      case 'skills':
        return item.category;
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
    if (type === 'base' && !targetRole.trim()) {
      setIsTargetRoleInvalid(true);
      setTimeout(() => setIsTargetRoleInvalid(false), 820);
      toast({
        title: "Required Field Missing",
        description: "Target role is a required field. Please enter your target role.",
        variant: "destructive",
      });
      return;
    }

    if (type === 'tailored') {
      let hasError = false;
      
      if (!selectedBaseResume) {
        setIsBaseResumeInvalid(true);
        setTimeout(() => setIsBaseResumeInvalid(false), 820);
        hasError = true;
      }
      
      if (!jobDescription.trim()) {
        setIsJobDescriptionInvalid(true);
        setTimeout(() => setIsJobDescriptionInvalid(false), 820);
        hasError = true;
      }

      if (hasError) {
        toast({
          title: "Required Fields Missing",
          description: "Please select a base resume and provide a job description.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setIsCreating(true);
      let resume: Resume;

      if (type === 'base') {
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

        resume = await createBaseResume(
          targetRole, 
          importOption === 'scratch' ? 'fresh' : importOption,
          selectedContent
        );
      } else {
        resume = await createBaseResume(targetRole, importOption === 'scratch' ? 'fresh' : importOption);
      }

      toast({
        title: "Success",
        description: "Resume created successfully",
      });

      router.push(`/resumes/${resume.id}`);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create resume",
        variant: "destructive",
      });
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
    setOpen(newOpen);
    if (newOpen) {
      setTargetRole('');
      setJobDescription('');
      setImportOption('import-all');
      initializeSelectedItems();
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
        type === 'base' 
          ? "from-purple-50/95 to-indigo-50/90 border-purple-200/40"
          : "from-pink-50/95 to-rose-50/90 border-pink-200/40",
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
          "relative px-8 pt-6 pb-4 border-b sticky top-0 z-10 bg-white/50 backdrop-blur-xl",
          type === 'base' 
            ? "border-purple-200/20"
            : "border-pink-200/20"
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-xl transition-all duration-300",
              type === 'base' 
                ? "bg-gradient-to-br from-purple-100/80 to-indigo-100/80 border border-purple-200/60"
                : "bg-gradient-to-br from-pink-100/80 to-rose-100/80 border border-pink-200/60"
            )}>
              {type === 'base' 
                ? <FileText className="w-6 h-6 text-purple-600" />
                : <Sparkles className="w-6 h-6 text-pink-600" />
              }
            </div>
            <div>
              <DialogTitle className={cn(
                "text-xl font-semibold",
                type === 'base'
                  ? "text-purple-950"
                  : "text-pink-950"
              )}>
                Create {type === 'base' ? 'Base' : 'Tailored'} Resume
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                {type === 'base' 
                  ? "Create a new base resume template that you can use for multiple job applications"
                  : "Create a tailored resume based on an existing base resume"}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className={cn(
          "px-8 py-6 space-y-6",
          type === 'base'
            ? "bg-gradient-to-b from-purple-50/30 to-indigo-50/30"
            : "bg-gradient-to-b from-pink-50/30 to-rose-50/30"
        )}>
          <div className="space-y-6">
            {type === 'base' ? (
              <>
                <div className="space-y-3">
                  <Label 
                    htmlFor="target-role"
                    className={cn(
                      "text-lg font-medium",
                      type === 'base' ? "text-purple-950" : "text-pink-950"
                    )}
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
                  <Label className={cn(
                    "text-base font-medium",
                    type === 'base' ? "text-purple-950" : "text-pink-950"
                  )}>
                    Resume Content
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="radio"
                        id="import-all"
                        name="importOption"
                        value="import-all"
                        checked={importOption === 'import-all'}
                        onChange={(e) => setImportOption(e.target.value as 'import-all' | 'ai' | 'scratch')}
                        className="sr-only peer"
                      />
                      <Label
                        htmlFor="import-all"
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
                        id="scratch"
                        name="importOption"
                        value="scratch"
                        checked={importOption === 'scratch'}
                        onChange={(e) => setImportOption(e.target.value as 'import-all' | 'ai' | 'scratch')}
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

                  {importOption === 'import-all' && (
                    <ScrollArea className="h-[400px] pr-4 mt-4">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                          <Accordion type="single" collapsible className="space-y-4">
                            {/* Work Experience */}
                            <AccordionItem value="work-experience" className="border-none">
                              <AccordionTrigger className="flex items-center gap-2 py-2 hover:no-underline group">
                                <div className="flex items-center gap-2 flex-1">
                                  <Checkbox
                                    id="work-experience-section"
                                    checked={isSectionSelected('work_experience')}
                                    onCheckedChange={(checked) => handleSectionSelection('work_experience', checked as boolean)}
                                    className={cn(
                                      "mt-0.5",
                                      isSectionPartiallySelected('work_experience') && "data-[state=checked]:bg-purple-600/50"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-purple-950 group-hover:text-purple-950">
                                      Work Experience
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {profile.work_experience.length} {profile.work_experience.length === 1 ? 'position' : 'positions'}
                                    </span>
                                  </div>
                                </div>
                              </AccordionTrigger>
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
                                          className="mt-0.5"
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
                            <AccordionItem value="skills" className="border-none">
                              <AccordionTrigger className="flex items-center gap-2 py-2 hover:no-underline group">
                                <div className="flex items-center gap-2 flex-1">
                                  <Checkbox
                                    id="skills-section"
                                    checked={isSectionSelected('skills')}
                                    onCheckedChange={(checked) => handleSectionSelection('skills', checked as boolean)}
                                    className={cn(
                                      "mt-0.5",
                                      isSectionPartiallySelected('skills') && "data-[state=checked]:bg-purple-600/50"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-purple-950 group-hover:text-purple-950">
                                      Skills
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {profile.skills.length} {profile.skills.length === 1 ? 'category' : 'categories'}
                                    </span>
                                  </div>
                                </div>
                              </AccordionTrigger>
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
                                          className="mt-0.5"
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
                            <AccordionItem value="projects" className="border-none">
                              <AccordionTrigger className="flex items-center gap-2 py-2 hover:no-underline group">
                                <div className="flex items-center gap-2 flex-1">
                                  <Checkbox
                                    id="projects-section"
                                    checked={isSectionSelected('projects')}
                                    onCheckedChange={(checked) => handleSectionSelection('projects', checked as boolean)}
                                    className={cn(
                                      "mt-0.5",
                                      isSectionPartiallySelected('projects') && "data-[state=checked]:bg-purple-600/50"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-purple-950 group-hover:text-purple-950">
                                      Projects
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {profile.projects.length} {profile.projects.length === 1 ? 'project' : 'projects'}
                                    </span>
                                  </div>
                                </div>
                              </AccordionTrigger>
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
                                          className="mt-0.5"
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
                            <AccordionItem value="education" className="border-none">
                              <AccordionTrigger className="flex items-center gap-2 py-2 hover:no-underline group">
                                <div className="flex items-center gap-2 flex-1">
                                  <Checkbox
                                    id="education-section"
                                    checked={isSectionSelected('education')}
                                    onCheckedChange={(checked) => handleSectionSelection('education', checked as boolean)}
                                    className={cn(
                                      "mt-0.5",
                                      isSectionPartiallySelected('education') && "data-[state=checked]:bg-purple-600/50"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-purple-950 group-hover:text-purple-950">
                                      Education
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {profile.education.length} {profile.education.length === 1 ? 'institution' : 'institutions'}
                                    </span>
                                  </div>
                                </div>
                              </AccordionTrigger>
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
                                          className="mt-0.5"
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
                    </ScrollArea>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-2">
                {(!baseResumes || baseResumes.length === 0) ? (
                  <div className="flex flex-col items-center justify-center p-8 space-y-4">
                    <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100">
                      <Sparkles className="w-8 h-8 text-pink-600" />
                    </div>
                    <div className="text-center space-y-2 max-w-sm">
                      <h3 className="font-semibold text-base text-pink-950">No Base Resumes Found</h3>
                      <p className="text-xs text-muted-foreground">
                        You need to create a base resume first before you can create a tailored version.
                      </p>
                    </div>
                    <CreateResumeDialog type="base" profile={profile}>
                      <Button
                        className={cn(
                          "mt-2 text-white shadow-lg hover:shadow-xl transition-all duration-500",
                          "bg-gradient-to-r from-purple-600 to-indigo-600",
                          "hover:from-purple-700 hover:to-indigo-700"
                        )}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Base Resume
                      </Button>
                    </CreateResumeDialog>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label 
                        htmlFor="base-resume"
                        className="text-base font-medium text-pink-950"
                      >
                        Select Base Resume <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={selectedBaseResume} 
                        onValueChange={setSelectedBaseResume}
                      >
                        <SelectTrigger 
                          id="base-resume" 
                          className={cn(
                            "bg-white/80 border-gray-200 h-10 text-sm focus:border-pink-500 focus:ring-pink-500/20",
                            isBaseResumeInvalid && "border-red-500 shake"
                          )}
                        >
                          <SelectValue placeholder="Select a base resume" />
                        </SelectTrigger>
                        <SelectContent>
                          {baseResumes?.map((resume) => (
                            <SelectItem 
                              key={resume.id} 
                              value={resume.id}
                              className="focus:bg-pink-50 text-sm"
                            >
                              {resume.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Resume Selection Visualization */}
                    <div className="flex items-center justify-center gap-4">
                      {selectedBaseResume && baseResumes ? (
                        <>
                          <MiniResumePreview
                            name={baseResumes.find(r => r.id === selectedBaseResume)?.name || ''}
                            type="base"
                            className="w-24 hover:-translate-y-1 transition-transform duration-300"
                          />
                          <div className="flex flex-col items-center gap-1">
                            <ArrowRight className="w-6 h-6 text-pink-600 animate-pulse" />
                            <span className="text-xs font-medium text-muted-foreground">Tailored For Job</span>
                          </div>
                          <MiniResumePreview
                            name="Tailored Resume"
                            type="tailored"
                            className="w-24 hover:-translate-y-1 transition-transform duration-300"
                          />
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-pink-100">
                          <div className="text-sm font-medium text-muted-foreground">
                            Select a base resume to see preview
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label 
                        htmlFor="job-description"
                        className="text-base font-medium text-pink-950"
                      >
                        Job Description <span className="text-red-500">*</span>
                      </Label>
                      <textarea
                        id="job-description"
                        placeholder="Paste the job description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className={cn(
                          "w-full min-h-[120px] rounded-md bg-white/80 border-gray-200 text-base",
                          "focus:border-pink-500 focus:ring-pink-500/20 placeholder:text-gray-400",
                          "resize-y p-4",
                          isJobDescriptionInvalid && "border-red-500 shake"
                        )}
                        required
                      />
                    </div>

                    <div className="">
                    
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-full">
                          <input
                            type="radio"
                            id="ai-tailor"
                            name="tailorOption"
                            value="ai"
                            checked={importOption === 'ai'}
                            onChange={(e) => setImportOption('ai')}
                            className="sr-only peer"
                          />
                          <Label
                            htmlFor="ai-tailor"
                            className={cn(
                              "flex flex-col items-center justify-center rounded-xl p-4",
                              "bg-white/80 border-2 shadow-sm h-full",
                              "hover:border-pink-200 hover:bg-pink-50/50",
                              "transition-all duration-300 cursor-pointer",
                              "peer-checked:border-pink-500 peer-checked:bg-pink-50",
                              "peer-checked:shadow-md peer-checked:shadow-pink-100"
                            )}
                          >
                            <div className="flex flex-col items-center text-center">
                              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 flex items-center justify-center mb-3">
                                <Brain className="h-6 w-6 text-pink-600" />
                              </div>
                              <div className="font-semibold text-sm text-pink-950 mb-1.5">Tailor with AI</div>
                              <span className="text-xs leading-relaxed text-gray-600">
                                Let AI analyze the job description and optimize your resume for the best match
                              </span>
                            </div>
                          </Label>
                        </div>

                        <div className="h-full">
                          <input
                            type="radio"
                            id="manual-tailor"
                            name="tailorOption"
                            value="import-all"
                            checked={importOption === 'import-all'}
                            onChange={(e) => setImportOption('import-all')}
                            className="sr-only peer"
                          />
                          <Label
                            htmlFor="manual-tailor"
                            className={cn(
                              "flex flex-col items-center justify-center rounded-xl p-4",
                              "bg-white/80 border-2 shadow-sm h-full",
                              "hover:border-pink-200 hover:bg-pink-50/50",
                              "transition-all duration-300 cursor-pointer",
                              "peer-checked:border-pink-500 peer-checked:bg-pink-50",
                              "peer-checked:shadow-md peer-checked:shadow-pink-100"
                            )}
                          >
                            <div className="flex flex-col items-center text-center">
                              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 flex items-center justify-center mb-3">
                                <Copy className="h-6 w-6 text-pink-600" />
                              </div>
                              <div className="font-semibold text-sm text-pink-950 mb-1.5">Copy Base Resume</div>
                              <span className="text-xs leading-relaxed text-gray-600">
                                Create an exact copy of your base resume and make your own modifications
                              </span>
                            </div>
                          </Label>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Section */}
        <div className={cn(
          "px-8 py-4 border-t sticky bottom-0 z-10 bg-white/50 backdrop-blur-xl",
          type === 'base'
            ? "border-purple-200/20 bg-white/40"
            : "border-pink-200/20 bg-white/40"
        )}>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className={cn(
                "border-gray-200 text-gray-600",
                "hover:bg-white/60",
                type === 'base'
                  ? "hover:border-purple-200"
                  : "hover:border-pink-200"
              )}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={isCreating}
              className={cn(
                "text-white shadow-lg hover:shadow-xl transition-all duration-500",
                type === 'base'
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  : "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
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