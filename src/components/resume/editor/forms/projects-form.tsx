'use client';

import { Project, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical, Loader2, Sparkles, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import { useState, useRef, useEffect, memo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { AISuggestions } from "../../shared/ai-suggestions";
import { generateProjectPoints, improveProject } from "@/utils/actions/resumes/ai";
import { Badge } from "@/components/ui/badge";
import { KeyboardEvent } from "react";
import Tiptap from "@/components/ui/tiptap";
import { AIImprovementPrompt } from "../../shared/ai-improvement-prompt";
import { AIGenerationSettingsTooltip } from "../components/ai-generation-tooltip";
import { ApiErrorDialog } from "@/components/ui/api-error-dialog";

interface AISuggestion {
  id: string;
  point: string;
}

interface ImprovedPoint {
  original: string;
  improved: string;
}

interface ImprovementConfig {
  [key: number]: { [key: number]: string }; // projectIndex -> pointIndex -> prompt
}

interface ProjectsFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
  profile: Profile;
}

function areProjectsPropsEqual(
  prevProps: ProjectsFormProps,
  nextProps: ProjectsFormProps
) {
  return (
    JSON.stringify(prevProps.projects) === JSON.stringify(nextProps.projects) &&
    prevProps.profile.id === nextProps.profile.id
  );
}

export const ProjectsForm = memo(function ProjectsFormComponent({
  projects,
  onChange,
  profile
}: ProjectsFormProps) {
  const [aiSuggestions, setAiSuggestions] = useState<{ [key: number]: AISuggestion[] }>({});
  const [loadingAI, setLoadingAI] = useState<{ [key: number]: boolean }>({});
  const [loadingPointAI, setLoadingPointAI] = useState<{ [key: number]: { [key: number]: boolean } }>({});
  const [aiConfig, setAiConfig] = useState<{ [key: number]: { numPoints: number; customPrompt: string } }>({});
  const [popoverOpen, setPopoverOpen] = useState<{ [key: number]: boolean }>({});
  const [improvedPoints, setImprovedPoints] = useState<{ [key: number]: { [key: number]: ImprovedPoint } }>({});
  const [improvementConfig, setImprovementConfig] = useState<ImprovementConfig>({});
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: '', description: '' });
  const textareaRefs = useRef<{ [key: number]: HTMLTextAreaElement }>({});
  const [newTechnologies, setNewTechnologies] = useState<{ [key: number]: string }>({});

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

  const updateProject = (index: number, field: keyof Project, value: Project[keyof Project]) => {
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

      const result = await generateProjectPoints(
        project.name,
        project.technologies || [],
        "Software Engineer",
        config.numPoints,
        config.customPrompt,
        {
          model: selectedModel || '',
          apiKeys
        }
      );
      
      const suggestions = result.points.map((point: string) => ({
        id: Math.random().toString(36).substr(2, 9),
        point
      }));
      
      setAiSuggestions(prev => ({
        ...prev,
        [index]: suggestions
      }));
    } catch (error: Error | unknown) {
      if (error instanceof Error && (
          error.message.toLowerCase().includes('api key') || 
          error.message.toLowerCase().includes('unauthorized') ||
          error.message.toLowerCase().includes('invalid key') ||
          error.message.toLowerCase().includes('invalid x-api-key'))
      ) {
        setErrorMessage({
          title: "API Key Error",
          description: "There was an issue with your API key. Please check your settings and try again."
        });
      } else {
        setErrorMessage({
          title: "Error",
          description: "Failed to generate AI points. Please try again."
        });
      }
      setShowErrorDialog(true);
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

  const rewritePoint = async (projectIndex: number, pointIndex: number) => {
    const project = projects[projectIndex];
    const point = project.description[pointIndex];
    const customPrompt = improvementConfig[projectIndex]?.[pointIndex];
    
    setLoadingPointAI(prev => ({
      ...prev,
      [projectIndex]: { ...(prev[projectIndex] || {}), [pointIndex]: true }
    }));
    
    try {
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

      const improvedPoint = await improveProject(point, customPrompt, {
        model: selectedModel || '',
        apiKeys
      });

      setImprovedPoints(prev => ({
        ...prev,
        [projectIndex]: {
          ...(prev[projectIndex] || {}),
          [pointIndex]: {
            original: point,
            improved: improvedPoint
          }
        }
      }));

      const updated = [...projects];
      updated[projectIndex].description[pointIndex] = improvedPoint;
      onChange(updated);
    } catch (error: unknown) {
      if (error instanceof Error && (
        error.message.toLowerCase().includes('api key') || 
        error.message.toLowerCase().includes('unauthorized') ||
        error.message.toLowerCase().includes('invalid key') ||
        error.message.toLowerCase().includes('invalid x-api-key'))
      ) {
        setErrorMessage({
          title: "API Key Error",
          description: "There was an issue with your API key. Please check your settings and try again."
        });
      } else {
        setErrorMessage({
          title: "Error",
          description: "Failed to improve point. Please try again."
        });
      }
      setShowErrorDialog(true);
    } finally {
      setLoadingPointAI(prev => ({
        ...prev,
        [projectIndex]: { ...(prev[projectIndex] || {}), [pointIndex]: false }
      }));
    }
  };

  const undoImprovement = (projectIndex: number, pointIndex: number) => {
    const improvedPoint = improvedPoints[projectIndex]?.[pointIndex];
    if (improvedPoint) {
      const updated = [...projects];
      updated[projectIndex].description[pointIndex] = improvedPoint.original;
      onChange(updated);
      
      // Remove the improvement from state
      setImprovedPoints(prev => {
        const newState = { ...prev };
        if (newState[projectIndex]) {
          delete newState[projectIndex][pointIndex];
          if (Object.keys(newState[projectIndex]).length === 0) {
            delete newState[projectIndex];
          }
        }
        return newState;
      });
    }
  };

  const addTechnology = (projectIndex: number) => {
    const techToAdd = newTechnologies[projectIndex]?.trim();
    if (!techToAdd) return;

    const updated = [...projects];
    const currentTechnologies = updated[projectIndex].technologies || [];
    
    if (!currentTechnologies.includes(techToAdd)) {
      updated[projectIndex] = {
        ...updated[projectIndex],
        technologies: [...currentTechnologies, techToAdd]
      };
      onChange(updated);
    }
    setNewTechnologies({ ...newTechnologies, [projectIndex]: '' });
  };

  const handleTechKeyPress = (e: KeyboardEvent<HTMLInputElement>, projectIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechnology(projectIndex);
    }
  };

  const removeTechnology = (projectIndex: number, techIndex: number) => {
    const updated = [...projects];
    updated[projectIndex].technologies = (updated[projectIndex].technologies || [])
      .filter((_, i) => i !== techIndex);
    onChange(updated);
  };

  return (
    <>
      <div className="space-y-2 sm:space-y-3">
        <div className="@container">
          <div className={cn(
            "flex flex-col @[400px]:flex-row gap-2",
            "transition-all duration-300 ease-in-out"
          )}>
            <Button 
              variant="outline" 
              onClick={addProject}
              className={cn(
                "flex-1 h-9 min-w-[120px]",
                "bg-gradient-to-r from-violet-500/5 via-violet-500/10 to-purple-500/5",
                "hover:from-violet-500/10 hover:via-violet-500/15 hover:to-purple-500/10",
                "border-2 border-dashed border-violet-500/30 hover:border-violet-500/40",
                "text-violet-700 hover:text-violet-800",
                "transition-all duration-300",
                "rounded-xl",
                "whitespace-nowrap text-[11px] @[300px]:text-sm"
              )}
            >
              <Plus className="h-4 w-4 mr-2 shrink-0" />
              Add Project
            </Button>

            <ImportFromProfileDialog<Project>
              profile={profile}
              onImport={handleImportFromProfile}
              type="projects"
              buttonClassName={cn(
                "flex-1 mb-0 h-9 min-w-[120px]",
                "bg-gradient-to-r from-violet-500/5 via-violet-500/10 to-purple-500/5",
                "hover:from-violet-500/10 hover:via-violet-500/15 hover:to-purple-500/10",
                "border-2 border-dashed border-violet-500/30 hover:border-violet-500/40",
                "text-violet-700 hover:text-violet-800",
                "transition-all duration-300",
                "rounded-xl",
                "whitespace-nowrap text-[11px] @[300px]:text-sm"
              )}
            />
          </div>
        </div>

        {projects.map((project, index) => (
          <Card 
            key={index} 
            className={cn(
              "relative group transition-all duration-300",
              "bg-gradient-to-r from-violet-500/5 via-violet-500/10 to-purple-500/5",
              "backdrop-blur-md border-2 border-violet-500/30",
              "shadow-sm"
            )}
          >
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-violet-100/80 rounded-lg p-1.5 cursor-move shadow-sm">
                <GripVertical className="h-4 w-4 text-violet-600" />
              </div>
            </div>
            
            <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              {/* Header with Delete Button */}
              <div className="space-y-2 sm:space-y-3">
                {/* Project Name - Full Width */}
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="relative flex-1">
                    <Input
                      value={project.name}
                      onChange={(e) => updateProject(index, 'name', e.target.value)}
                      className={cn(
                        "text-sm font-semibold tracking-tight h-9",
                        "bg-white/50 border-gray-200 rounded-lg",
                        "focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20",
                        "hover:border-violet-500/30 hover:bg-white/60 transition-colors",
                        "placeholder:text-gray-400"
                      )}
                      placeholder="Project Name"
                    />
                    <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[7px] sm:text-[9px] font-medium text-violet-700">
                      PROJECT NAME
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeProject(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* URLs Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div className="relative">
                    <Input
                      value={project.url || ''}
                      onChange={(e) => updateProject(index, 'url', e.target.value)}
                      className={cn(
                        "text-sm font-medium bg-white/50 border-gray-200 rounded-lg h-9",
                        "focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20",
                        "hover:border-violet-500/30 hover:bg-white/60 transition-colors",
                        "placeholder:text-gray-400"
                      )}
                      placeholder="Live URL"
                    />
                    <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[7px] sm:text-[9px] font-medium text-violet-700">
                      LIVE URL
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      value={project.github_url || ''}
                      onChange={(e) => updateProject(index, 'github_url', e.target.value)}
                      className={cn(
                        "h-9 bg-white/50 border-gray-200 rounded-lg",
                        "focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20",
                        "hover:border-violet-500/30 hover:bg-white/60 transition-colors",
                        "placeholder:text-gray-400"
                      )}
                      placeholder="GitHub URL"
                    />
                    <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[7px] sm:text-[9px] font-medium text-violet-700">
                      GITHUB URL
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="relative group">
                  <Input
                    type="text"
                    value={project.date || ''}
                    onChange={(e) => updateProject(index, 'date', e.target.value)}
                    className={cn(
                      "w-full bg-white/50 border-gray-200 rounded-lg h-9",
                      "focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20",
                      "hover:border-violet-500/30 hover:bg-white/60 transition-colors"
                    )}
                    placeholder="e.g., &apos;Jan 2023 - Present&apos; or &apos;2020 - 2022&apos;"
                  />
                  <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[7px] sm:text-[9px] font-medium text-violet-700">
                    DATE
                  </div>
                </div>

                {/* Description Section */}
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-[10px] sm:text-xs font-medium text-violet-700">
                    Key Features & Technical Achievements
                  </Label>
                  <div className="space-y-2 pl-0">
                    {project.description.map((desc, descIndex) => (
                      <div key={descIndex} className="flex gap-1 items-start group/item">
                        <div className="flex-1">
                          <Tiptap
                            content={desc} 
                            onChange={(newContent) => {
                              const updated = [...projects];
                              updated[index].description[descIndex] = newContent;
                              onChange(updated);

                              if (improvedPoints[index]?.[descIndex]) {
                                setImprovedPoints(prev => {
                                  const newState = { ...prev };
                                  if (newState[index]) {
                                    delete newState[index][descIndex];
                                    if (Object.keys(newState[index]).length === 0) {
                                      delete newState[index];
                                    }
                                  }
                                  return newState;
                                });
                              }
                            }}
                            className={cn(
                              "min-h-[60px] text-xs md:text-sm bg-white/50 border-gray-200 rounded-lg",
                              "focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20",
                              "hover:border-violet-500/30 hover:bg-white/60 transition-colors",
                              "placeholder:text-gray-400",
                              improvedPoints[index]?.[descIndex] && [
                                "border-purple-400",
                                "bg-gradient-to-r from-purple-50/80 to-indigo-50/80",
                                "shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)]",
                                "hover:bg-gradient-to-r hover:from-purple-50/90 hover:to-indigo-50/90"
                              ]
                            )}
                          />

                          {improvedPoints[index]?.[descIndex] && (
                            <div className="absolute -top-2.5 right-12 px-2 py-0.5 bg-purple-100 rounded-full">
                              <span className="text-[10px] font-medium text-purple-600 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                AI Suggestion
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          {improvedPoints[index]?.[descIndex] ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  // Remove the improvement state after accepting
                                  setImprovedPoints(prev => {
                                    const newState = { ...prev };
                                    if (newState[index]) {
                                      delete newState[index][descIndex];
                                      if (Object.keys(newState[index]).length === 0) {
                                        delete newState[index];
                                      }
                                    }
                                    return newState;
                                  });
                                }}
                                className={cn(
                                  "p-0 group-hover/item:opacity-100",
                                  "h-8 w-8 rounded-lg",
                                  "bg-green-50/80 hover:bg-green-100/80",
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
                                onClick={() => undoImprovement(index, descIndex)}
                                className={cn(
                                  "p-0 group-hover/item:opacity-100",
                                  "h-8 w-8 rounded-lg",
                                  "bg-rose-50/80 hover:bg-rose-100/80",
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
                            </>
                          ) : (
                            <>
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
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => rewritePoint(index, descIndex)}
                                      disabled={loadingPointAI[index]?.[descIndex]}
                                      className={cn(
                                        "p-0 group-hover/item:opacity-100",
                                        "h-8 w-8 rounded-lg",
                                        "bg-purple-50/80 hover:bg-purple-100/80",
                                        "text-purple-600 hover:text-purple-700",
                                        "border border-purple-200/60",
                                        "shadow-sm",
                                        "transition-all duration-300",
                                        "hover:scale-105 hover:shadow-md",
                                        "hover:-translate-y-0.5"
                                      )}
                                    >
                                      {loadingPointAI[index]?.[descIndex] ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Sparkles className="h-4 w-4" />
                                      )}
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
                                    <AIImprovementPrompt
                                      value={improvementConfig[index]?.[descIndex] || ''}
                                      onChange={(value) => setImprovementConfig(prev => ({
                                        ...prev,
                                        [index]: {
                                          ...(prev[index] || {}),
                                          [descIndex]: value
                                        }
                                      }))}
                                      onSubmit={() => rewritePoint(index, descIndex)}
                                      isLoading={loadingPointAI[index]?.[descIndex]}
                                    />
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* AI Suggestions */}
                    <AISuggestions
                      suggestions={aiSuggestions[index] || []}
                      onApprove={(suggestion) => approveSuggestion(index, suggestion)}
                      onDelete={(suggestionId) => deleteSuggestion(index, suggestionId)}
                    />

                    {project.description.length === 0 && !aiSuggestions[index]?.length && (
                      <div className="text-[10px] sm:text-xs text-gray-500 italic px-4 py-3 bg-gray-50/50 rounded-lg">
                        Add points to describe your project&apos;s features and achievements
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updated = [...projects];
                        updated[index].description = [...updated[index].description, ""];
                        onChange(updated);
                      }}
                      className={cn(
                        "flex-1 text-violet-600 hover:text-violet-700 transition-colors text-[10px] sm:text-xs",
                        "border-violet-200 hover:border-violet-300 hover:bg-violet-50/50"
                      )}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Point
                    </Button>

                    
                    <AIGenerationSettingsTooltip
                      index={index}
                      loadingAI={loadingAI[index]}
                      generateAIPoints={generateAIPoints}
                      aiConfig={aiConfig[index] || { numPoints: 3, customPrompt: '' }}
                      onNumPointsChange={(value) => setAiConfig(prev => ({
                        ...prev,
                        [index]: { ...prev[index], numPoints: value }
                      }))}
                      onCustomPromptChange={(value) => setAiConfig(prev => ({
                        ...prev,
                        [index]: { ...prev[index], customPrompt: value }
                      }))}
                      colorClass={{
                        button: "text-violet-600",
                        border: "border-violet-200",
                        hoverBorder: "hover:border-violet-300",
                        hoverBg: "hover:bg-violet-50/50",
                        tooltipBg: "bg-violet-50",
                        tooltipBorder: "border-2 border-violet-300",
                        tooltipShadow: "shadow-lg shadow-violet-100/50",
                        text: "text-violet-600",
                        hoverText: "hover:text-violet-700"
                      }}
                    />
                  </div>
                </div>

                {/* Technologies Section */}
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-[10px] sm:text-xs font-medium text-violet-700">
                    Technologies & Tools Used
                  </Label>
                  
                  <div className="space-y-2">
                    {/* Technologies Display */}
                    <div className="flex flex-wrap gap-1.5">
                      {(project.technologies || []).map((tech, techIndex) => (
                        <Badge
                          key={techIndex}
                          variant="secondary"
                          className={cn(
                            "bg-white/60 hover:bg-white/80 text-violet-700 border border-violet-200 py-0.5",
                            "transition-all duration-300 group/badge cursor-default text-[10px] sm:text-xs"
                          )}
                        >
                          {tech}
                          <button
                            onClick={() => removeTechnology(index, techIndex)}
                            className="ml-1.5 hover:text-red-500 opacity-50 hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>

                    {/* New Technology Input */}
                    <div className="relative group flex gap-2">
                      <Input
                        value={newTechnologies[index] || ''}
                        onChange={(e) => setNewTechnologies({ ...newTechnologies, [index]: e.target.value })}
                        onKeyPress={(e) => handleTechKeyPress(e, index)}
                        className={cn(
                          "h-9 bg-white/50 border-gray-200 rounded-lg",
                          "focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20",
                          "hover:border-violet-500/30 hover:bg-white/60 transition-colors",
                          "placeholder:text-gray-400",
                          "text-[10px] sm:text-xs"
                        )}
                        placeholder="Type a technology and press Enter or click +"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addTechnology(index)}
                        className="h-9 px-2 bg-white/50 hover:bg-white/60"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[7px] sm:text-[9px] font-medium text-violet-700">
                        ADD TECHNOLOGY
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Error Alert Dialog at the end */}
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
    </>
  );
}, areProjectsPropsEqual); 