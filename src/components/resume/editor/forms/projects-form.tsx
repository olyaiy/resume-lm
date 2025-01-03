'use client';

import { Project, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";

import { useState, useRef, useEffect } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { DescriptionPoint } from "../../shared/description-point";
import { AISuggestions } from "../../shared/ai-suggestions";
import { TechnologiesInput } from "../../shared/technologies-input";
import { AIGenerationSettings } from "../../shared/ai-generation-settings";
import { generateProjectPoints, improveProject } from "../ai/resume-modification-ai";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
  targetRole?: string;
}

export function ProjectsForm({ projects, onChange, profile, targetRole = "Software Engineer" }: ProjectsFormProps) {
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
        targetRole,
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

      const improvedPoint = await improveProject(point, customPrompt, {
        model: selectedModel || '',
        apiKeys
      });
      
      // Store both original and improved versions
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

      // Update the project with the improved version
      const updated = [...projects];
      updated[projectIndex].description[pointIndex] = improvedPoint;
      onChange(updated);
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

  return (
    <>
      <div className="space-y-3">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={addProject}
            className={cn(
              "flex-1 h-8",
              "bg-gradient-to-r from-violet-500/5 via-violet-500/10 to-purple-500/5",
              "hover:from-violet-500/10 hover:via-violet-500/15 hover:to-purple-500/10",
              "border-2 border-dashed border-violet-500/30 hover:border-violet-500/40",
              "text-violet-700 hover:text-violet-800",
              "transition-all duration-300",
              "rounded-xl"
            )}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Project
          </Button>

          <ImportFromProfileDialog<Project>
            profile={profile}
            onImport={handleImportFromProfile}
            type="projects"
            buttonClassName="flex-1 mb-0 h-8"
          />
        </div>

        {projects.map((project, index) => (
          <Card 
            key={index} 
            className={cn(
              "relative group transition-all duration-300",
              "bg-gradient-to-r from-violet-500/5 via-violet-500/10 to-purple-500/5",
              "backdrop-blur-md border-2 border-violet-500/30",
              "hover:border-violet-500/40 hover:shadow-lg hover:scale-[1.002]",
              "shadow-sm"
            )}
          >
            <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-violet-100/80 rounded-lg p-1 cursor-move shadow-sm">
                <GripVertical className="h-3.5 w-3.5 text-violet-600" />
              </div>
            </div>
            
            <CardContent className="p-4 space-y-4">
              {/* Header with Delete Button */}
              <div className="space-y-3">
                {/* Project Name - Full Width */}
                <div className="flex items-start gap-3">
                  <div className="relative flex-1">
                    <Input
                      value={project.name}
                      onChange={(e) => updateProject(index, 'name', e.target.value)}
                      className={cn(
                        "text-sm font-semibold tracking-tight h-8 py-1",
                        "bg-white/50 border-gray-200 rounded-lg",
                        "focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20",
                        "hover:border-violet-500/30 hover:bg-white/60 transition-colors",
                        "placeholder:text-gray-400"
                      )}
                      placeholder="Project Name"
                    />
                    <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[7px] font-medium text-violet-700">
                      PROJECT NAME
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeProject(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-300 h-8 w-8"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* URLs Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="relative">
                    <Input
                      value={project.url || ''}
                      onChange={(e) => updateProject(index, 'url', e.target.value)}
                      className={cn(
                        "text-sm font-medium bg-white/50 border-gray-200 rounded-lg h-8 py-1",
                        "focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20",
                        "hover:border-violet-500/30 hover:bg-white/60 transition-colors",
                        "placeholder:text-gray-400"
                      )}
                      placeholder="Live URL"
                    />
                    <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[7px] font-medium text-violet-700">
                      LIVE URL
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      value={project.github_url || ''}
                      onChange={(e) => updateProject(index, 'github_url', e.target.value)}
                      className={cn(
                        "h-8 py-1 bg-white/50 border-gray-200 rounded-lg",
                        "focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20",
                        "hover:border-violet-500/30 hover:bg-white/60 transition-colors",
                        "placeholder:text-gray-400"
                      )}
                      placeholder="GitHub URL"
                    />
                    <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[7px] font-medium text-violet-700">
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
                    className="w-full h-8 py-1 bg-white/50 border-gray-200 rounded-lg
                      focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20
                      hover:border-violet-500/30 hover:bg-white/60 transition-colors"
                    placeholder="e.g., 'Jan 2023 - Present' or '2020 - 2022'"
                  />
                  <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[7px] font-medium text-violet-700">
                    DATE
                  </div>
                </div>

                {/* Description Section */}
                <div className="space-y-2">
                  <Label className="text-[11px] font-medium text-violet-700">
                    Key Features & Technical Achievements
                  </Label>
                  <div className="space-y-2 pl-0">
                    {project.description.map((desc, descIndex) => (
                      <DescriptionPoint
                        key={descIndex}
                        value={desc}
                        onChange={(value) => {
                          const updated = [...projects];
                          updated[index].description[descIndex] = value;
                          onChange(updated);
                          
                          // Clear improvement state when manually edited
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
                        onDelete={() => {
                          const updated = [...projects];
                          updated[index].description = updated[index].description.filter((_, i) => i !== descIndex);
                          onChange(updated);
                        }}
                        onImprove={() => rewritePoint(index, descIndex)}
                        onAcceptImprovement={() => {
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
                        onUndoImprovement={() => undoImprovement(index, descIndex)}
                        isImproved={!!improvedPoints[index]?.[descIndex]}
                        isLoading={loadingPointAI[index]?.[descIndex]}
                        placeholder="Start with a strong technical action verb"
                        improvementPrompt={improvementConfig[index]?.[descIndex] || ''}
                        onImprovementPromptChange={(value) => setImprovementConfig(prev => ({
                          ...prev,
                          [index]: {
                            ...(prev[index] || {}),
                            [descIndex]: value
                          }
                        }))}
                        improvementPromptPlaceholder="e.g., Focus on technical implementation details and performance metrics"
                      />
                    ))}

                    {/* AI Suggestions */}
                    <AISuggestions
                      suggestions={aiSuggestions[index] || []}
                      onApprove={(suggestion) => approveSuggestion(index, suggestion)}
                      onDelete={(suggestionId) => deleteSuggestion(index, suggestionId)}
                    />

                    {project.description.length === 0 && !aiSuggestions[index]?.length && (
                      <div className="text-[11px] text-gray-500 italic px-3 py-2 bg-gray-50/50 rounded-lg">
                        Add points to describe your project&apos;s features and achievements
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
                        "flex-1 text-violet-600 hover:text-violet-700 transition-colors text-[11px] h-7",
                        "border-violet-200 hover:border-violet-300 hover:bg-violet-50/50"
                      )}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
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
                              "flex-1 text-violet-600 hover:text-violet-700 transition-colors text-[11px] h-7",
                              "border-violet-200 hover:border-violet-300 hover:bg-violet-50/50"
                            )}
                          >
                            Write points with AI
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent 
                          side="bottom" 
                          align="start"
                          sideOffset={2}
                          className={cn(
                            "w-72 p-3",
                            "bg-violet-50",
                            "border-2 border-violet-300",
                            "shadow-lg shadow-violet-100/50",
                            "rounded-lg"
                          )}
                        >
                          <AIGenerationSettings
                            numPoints={aiConfig[index]?.numPoints || 3}
                            customPrompt={aiConfig[index]?.customPrompt || ''}
                            onNumPointsChange={(value) => setAiConfig(prev => ({
                              ...prev,
                              [index]: { ...prev[index], numPoints: value }
                            }))}
                            onCustomPromptChange={(value) => setAiConfig(prev => ({
                              ...prev,
                              [index]: { ...prev[index], customPrompt: value }
                            }))}
                            promptPlaceholder="e.g., Focus on technical implementation details and performance metrics"
                          />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* Technologies Section */}
                <TechnologiesInput
                  value={project.technologies || []}
                  onChange={(technologies) => updateProject(index, 'technologies', technologies)}
                  label="Technologies & Tools Used"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Error Alert Dialog at the end */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-red-200/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              {errorMessage.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              {errorMessage.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowErrorDialog(false)}
              className={cn(
                "bg-gradient-to-r from-red-600 to-rose-600",
                "hover:from-red-700 hover:to-rose-700",
                "text-white shadow-lg hover:shadow-xl transition-all duration-500"
              )}
            >
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 