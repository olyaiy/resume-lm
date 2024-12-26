'use client';

import { Project, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical, Check, X, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImportFromProfileDialog } from "./import-from-profile-dialog";
import { generateProjectPoints } from "@/utils/ai";
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface AISuggestion {
  id: string;
  point: string;
}

interface ProjectsFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
  profile: Profile;
  targetRole?: string;
}

export function ProjectsForm({ projects, onChange, profile, targetRole = "Software Engineer" }: ProjectsFormProps) {
  const [aiSuggestions, setAiSuggestions] = useState<{ [key: number]: AISuggestion[] }>({});
  const [loadingAI, setLoadingAI] = useState<{ [key: number]: boolean }>({});
  const [aiConfig, setAiConfig] = useState<{ [key: number]: { numPoints: number; customPrompt: string } }>({});
  const [popoverOpen, setPopoverOpen] = useState<{ [key: number]: boolean }>({});
  const textareaRefs = useRef<{ [key: number]: HTMLTextAreaElement }>({});

  // Effect to focus textarea when popover opens
  useEffect(() => {
    Object.entries(popoverOpen).forEach(([index, isOpen]) => {
      if (isOpen && textareaRefs.current[Number(index)]) {
        // Small delay to ensure the popover is fully rendered
        setTimeout(() => {
          textareaRefs.current[Number(index)]?.focus();
        }, 100);
      }
    });
  }, [popoverOpen]);

  const addProject = () => {
    onChange([{
      name: "",
      description: [],
      technologies: [],
      date: "",
      url: "",
      github_url: ""
    }, ...projects]);
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeProject = (index: number) => {
    onChange(projects.filter((_, i) => i !== index));
  };

  const handleImportFromProfile = (importedProjects: Project[]) => {
    onChange([...importedProjects, ...projects]);
  };

  const generateAIPoints = async (index: number) => {
    const project = projects[index];
    const config = aiConfig[index] || { numPoints: 3, customPrompt: '' };
    setLoadingAI(prev => ({ ...prev, [index]: true }));
    setPopoverOpen(prev => ({ ...prev, [index]: false }));
    
    try {
      const result = await generateProjectPoints(
        project.name,
        project.technologies || [],
        targetRole,
        config.numPoints,
        config.customPrompt
      );
      
      const suggestions = result.points.map((point: string) => ({
        id: Math.random().toString(36).substr(2, 9),
        point
      }));
      
      setAiSuggestions(prev => ({
        ...prev,
        [index]: suggestions
      }));
    } catch (error) {
      console.error('Failed to generate AI points:', error);
    } finally {
      setLoadingAI(prev => ({ ...prev, [index]: false }));
    }
  };

  const approveSuggestion = (projectIndex: number, suggestion: AISuggestion) => {
    const updated = [...projects];
    updated[projectIndex].description = [...updated[projectIndex].description, suggestion.point];
    onChange(updated);
    
    // Remove the suggestion after approval
    setAiSuggestions(prev => ({
      ...prev,
      [projectIndex]: prev[projectIndex].filter(s => s.id !== suggestion.id)
    }));
  };

  const deleteSuggestion = (projectIndex: number, suggestionId: string) => {
    setAiSuggestions(prev => ({
      ...prev,
      [projectIndex]: prev[projectIndex].filter(s => s.id !== suggestionId)
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={addProject}
          className={cn(
            "flex-1 h-16",
            "bg-gradient-to-r from-cyan-500/5 via-cyan-500/10 to-blue-500/5",
            "hover:from-cyan-500/10 hover:via-cyan-500/15 hover:to-blue-500/10",
            "border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/40",
            "text-cyan-700 hover:text-cyan-800",
            "transition-all duration-300",
            "rounded-xl"
          )}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Project
        </Button>

        <ImportFromProfileDialog<Project>
          profile={profile}
          onImport={handleImportFromProfile}
          type="projects"
          buttonClassName="flex-1 mb-0"
        />
      </div>

      {projects.map((project, index) => (
        <Card 
          key={index} 
          className={cn(
            "relative group transition-all duration-300",
            "bg-gradient-to-r from-cyan-500/5 via-cyan-500/10 to-blue-500/5",
            "backdrop-blur-md border-2 border-cyan-500/30",
            "hover:border-cyan-500/40 hover:shadow-lg hover:scale-[1.002]",
            "shadow-sm"
          )}
        >
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-cyan-100/80 rounded-lg p-1.5 cursor-move shadow-sm">
              <GripVertical className="h-4 w-4 text-cyan-600" />
            </div>
          </div>
          
          <CardContent className="p-6 space-y-8">
            {/* Header with Delete Button */}
            <div className="space-y-4">
              {/* Project Name - Full Width */}
              <div className="flex items-start gap-4">
                <div className="relative flex-1">
                  <Input
                    value={project.name}
                    onChange={(e) => updateProject(index, 'name', e.target.value)}
                    className={cn(
                      "text-sm md:text-base font-semibold tracking-tight",
                      "bg-white/50 border-gray-200 rounded-lg",
                      "focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20",
                      "hover:border-cyan-500/30 hover:bg-white/60 transition-colors",
                      "placeholder:text-gray-400"
                    )}
                    placeholder="Project Name"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[7px] md:text-[9px] font-medium text-gray-500">
                    PROJECT NAME
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeProject(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 mt-1"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* URLs Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="relative">
                  <Input
                    value={project.url || ''}
                    onChange={(e) => updateProject(index, 'url', e.target.value)}
                    className={cn(
                      "text-sm font-medium bg-white/50 border-gray-200 rounded-lg",
                      "focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20",
                      "hover:border-cyan-500/30 hover:bg-white/60 transition-colors",
                      "placeholder:text-gray-400"
                    )}
                    placeholder="Live URL"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[7px] md:text-[9px] font-medium text-gray-500">
                    LIVE URL
                  </div>
                </div>
                <div className="relative">
                  <Input
                    value={project.github_url || ''}
                    onChange={(e) => updateProject(index, 'github_url', e.target.value)}
                    className={cn(
                      "bg-white/50 border-gray-200 rounded-lg",
                      "focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20",
                      "hover:border-cyan-500/30 hover:bg-white/60 transition-colors",
                      "placeholder:text-gray-400"
                    )}
                    placeholder="GitHub URL"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[7px] md:text-[9px] font-medium text-gray-500">
                    GITHUB URL
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="relative">
                <Input
                  type="text"
                  value={project.date || ''}
                  onChange={(e) => updateProject(index, 'date', e.target.value)}
                  className="w-full bg-white/50 border-gray-200 rounded-lg
                    focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20
                    hover:border-cyan-500/30 hover:bg-white/60 transition-colors"
                  placeholder="e.g., 'Jan 2023 - Present' or '2020 - 2022'"
                />
                <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[7px] md:text-[9px] font-medium text-gray-500">
                  DATE
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-4">
                <Label className="text-[11px] md:text-xs font-medium text-gray-600">
                  Key Features & Technical Achievements
                </Label>
                <div className="space-y-3 pl-0">
                  {project.description.map((desc, descIndex) => (
                    <div key={descIndex} className="flex gap-1 items-start group/item">
                      <div className="flex-1">
                        <Textarea
                          value={desc}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[index].description[descIndex] = e.target.value;
                            onChange(updated);
                          }}
                          placeholder="Start with a strong technical action verb"
                          className={cn(
                            "min-h-[80px] text-xs md:text-sm bg-white/50 border-gray-200 rounded-lg",
                            "focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20",
                            "hover:border-cyan-500/30 hover:bg-white/60 transition-colors",
                            "placeholder:text-gray-400"
                          )}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const updated = [...projects];
                          updated[index].description = updated[index].description.filter((_, i) => i !== descIndex);
                          onChange(updated);
                        }}
                        className="p-0 group-hover/item:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {/* AI Suggestions */}
                  {aiSuggestions[index]?.length > 0 && (
                    <div className={cn(
                      "relative group/suggestions",
                      "p-6 mt-4",
                      "rounded-xl",
                      "bg-gradient-to-br from-purple-50/95 via-purple-50/90 to-indigo-50/95",
                      "border border-purple-200/60",
                      "shadow-lg shadow-purple-500/5",
                      "transition-all duration-500",
                      "hover:shadow-xl hover:shadow-purple-500/10",
                      "overflow-hidden"
                    )}>
                      {/* Animated Background Pattern */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />
                      
                      {/* Floating Gradient Orbs */}
                      <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-br from-purple-200/20 to-indigo-200/20 blur-3xl animate-float opacity-70" />
                      <div className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-br from-indigo-200/20 to-purple-200/20 blur-3xl animate-float-delayed opacity-70" />
                      
                      {/* Content */}
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-1.5 rounded-lg bg-purple-100/80 text-purple-600">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-purple-600">AI Suggestions</span>
                        </div>
                        
                        <div className="space-y-4">
                          {aiSuggestions[index].map((suggestion) => (
                            <div 
                              key={suggestion.id} 
                              className={cn(
                                "group/item relative",
                                "animate-in fade-in-50 duration-500",
                                "transition-all"
                              )}
                            >
                              <div className="flex gap-3">
                                <div className="flex-1">
                                  <Textarea
                                    value={suggestion.point}
                                    readOnly
                                    className={cn(
                                      "min-h-[80px] text-sm",
                                      "bg-white/60",
                                      "border-purple-200/60",
                                      "text-purple-900",
                                      "focus:border-purple-300/60 focus:ring-2 focus:ring-purple-500/10",
                                      "placeholder:text-purple-400",
                                      "transition-all duration-300",
                                      "hover:bg-white/80"
                                    )}
                                  />
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => approveSuggestion(index, suggestion)}
                                    className={cn(
                                      "h-9 w-9",
                                      "bg-green-100/80 hover:bg-green-200/80",
                                      "text-green-600 hover:text-green-700",
                                      "border border-green-200/60",
                                      "shadow-sm",
                                      "transition-all duration-300",
                                      "hover:scale-105 hover:shadow-md",
                                      "hover:-translate-y-0.5"
                                    )}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteSuggestion(index, suggestion.id)}
                                    className={cn(
                                      "h-9 w-9",
                                      "bg-rose-100/80 hover:bg-rose-200/80",
                                      "text-rose-600 hover:text-rose-700",
                                      "border border-rose-200/60",
                                      "shadow-sm",
                                      "transition-all duration-300",
                                      "hover:scale-105 hover:shadow-md",
                                      "hover:-translate-y-0.5"
                                    )}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {project.description.length === 0 && !aiSuggestions[index]?.length && (
                    <div className="text-[11px] md:text-xs text-gray-500 italic px-4 py-3 bg-gray-50/50 rounded-lg">
                      Add points to describe your project's features and achievements
                    </div>
                  )}
                </div>
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const updated = [...projects];
                      updated[index].description = [...updated[index].description, ""];
                      onChange(updated);
                    }}
                    className={cn(
                      "flex-1 text-cyan-600 hover:text-cyan-700 transition-colors text-[11px] md:text-xs",
                      "border-cyan-200 hover:border-cyan-300 hover:bg-cyan-50/50"
                    )}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Point
                  </Button>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateAIPoints(index)}
                          disabled={loadingAI[index]}
                          className={cn(
                            "flex-1 text-purple-600 hover:text-purple-700 transition-colors text-[11px] md:text-xs",
                            "border-purple-200 hover:border-purple-300 hover:bg-purple-50/50"
                          )}
                        >
                          {loadingAI[index] ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4 mr-1" />
                          )}
                          {loadingAI[index] ? 'Generating...' : 'Write points with AI'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="bottom" 
                        align="start"
                        sideOffset={2}
                        className={cn(
                          "w-72 p-3.5",
                          "bg-purple-50",
                          "border-2 border-purple-300",
                          "shadow-lg shadow-purple-100/50",
                          "rounded-lg"
                        )}
                      >
                        <div className="space-y-2.5">
                          {/* Header */}
                          <div className="flex items-center gap-2 pb-0.5">
                            <div className="p-1 rounded-md bg-purple-100 text-purple-600">
                              <Sparkles className="h-3 w-3" />
                            </div>
                            <span className="text-xs font-medium text-purple-700">AI Generation Settings</span>
                          </div>

                          {/* Number of Suggestions */}
                          <div>
                            <Label className="text-[11px] font-medium text-purple-700">Points to Generate</Label>
                            <Input
                              type="number"
                              min={1}
                              max={8}
                              value={aiConfig[index]?.numPoints || 3}
                              onChange={(e) => setAiConfig(prev => ({
                                ...prev,
                                [index]: { ...prev[index], numPoints: parseInt(e.target.value) || 3 }
                              }))}
                              className={cn(
                                "h-7 mt-0.5",
                                "bg-white",
                                "border-purple-200",
                                "focus:border-purple-400 focus:ring-1 focus:ring-purple-300",
                                "hover:bg-white",
                                "text-purple-900 text-xs"
                              )}
                            />
                          </div>

                          {/* Custom Focus */}
                          <div>
                            <Label className="text-[11px] font-medium text-purple-700">Prompt for AI (Optional)</Label>
                            <Textarea
                              value={aiConfig[index]?.customPrompt || ''}
                              onChange={(e) => setAiConfig(prev => ({
                                ...prev,
                                [index]: { ...prev[index], customPrompt: e.target.value }
                              }))}
                              placeholder="e.g., Focus on scalability and performance optimizations"
                              className={cn(
                                "h-14 mt-0.5 text-xs",
                                "bg-white",
                                "border-purple-200",
                                "focus:border-purple-400 focus:ring-1 focus:ring-purple-300",
                                "hover:bg-white",
                                "resize-none",
                                "text-purple-900 placeholder:text-purple-400"
                              )}
                            />
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Technologies Section */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-baseline">
                  <Label className="text-[11px] md:text-xs font-medium text-gray-600">Technologies & Tools Used</Label>
                  <span className="text-[7px] md:text-[9px] text-gray-500">Separate with commas</span>
                </div>
                <Input
                  value={project.technologies?.join(', ')}
                  onChange={(e) => updateProject(index, 'technologies', 
                    e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  )}
                  placeholder="React, TypeScript, Node.js, etc."
                  className={cn(
                    "bg-white/50 border-gray-200 rounded-lg",
                    "focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20",
                    "hover:border-cyan-500/30 hover:bg-white/60 transition-colors",
                    "placeholder:text-gray-400"
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 