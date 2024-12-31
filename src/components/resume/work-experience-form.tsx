'use client';

import { WorkExperience, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical, Check, X, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImportFromProfileDialog } from "./import-from-profile-dialog";
import { generateWorkExperiencePoints, improveWorkExperience } from "@/utils/ai";
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import Tiptap from "../ui/tiptap";

interface AISuggestion {
  id: string;
  point: string;
}

interface WorkExperienceFormProps {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
  profile: Profile;
  targetRole?: string;
}

interface ImprovedPoint {
  original: string;
  improved: string;
}

interface ImprovementConfig {
  [key: number]: { [key: number]: string }; // expIndex -> pointIndex -> prompt
}

export function WorkExperienceForm({ experiences, onChange, profile, targetRole = "Software Engineer" }: WorkExperienceFormProps) {
  const [aiSuggestions, setAiSuggestions] = useState<{ [key: number]: AISuggestion[] }>({});
  const [loadingAI, setLoadingAI] = useState<{ [key: number]: boolean }>({});
  const [loadingPointAI, setLoadingPointAI] = useState<{ [key: number]: { [key: number]: boolean } }>({});
  const [aiConfig, setAiConfig] = useState<{ [key: number]: { numPoints: number; customPrompt: string } }>({});
  const [popoverOpen, setPopoverOpen] = useState<{ [key: number]: boolean }>({});
  const textareaRefs = useRef<{ [key: number]: HTMLTextAreaElement }>({});
  const [improvedPoints, setImprovedPoints] = useState<{ [key: number]: { [key: number]: ImprovedPoint } }>({});
  const [improvementConfig, setImprovementConfig] = useState<ImprovementConfig>({});

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

  const addExperience = () => {
    onChange([{
      company: "",
      position: "",
      location: "",
      date: "",
      description: [],
      technologies: []
    }, ...experiences]);
  };

  const updateExperience = (index: number, field: keyof WorkExperience, value: string | string[]) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeExperience = (index: number) => {
    onChange(experiences.filter((_, i) => i !== index));
  };

  const handleImportFromProfile = (importedExperiences: WorkExperience[]) => {
    onChange([...importedExperiences, ...experiences]);
  };

  const generateAIPoints = async (index: number) => {
    const exp = experiences[index];
    const config = aiConfig[index] || { numPoints: 3, customPrompt: '' };
    setLoadingAI(prev => ({ ...prev, [index]: true }));
    setPopoverOpen(prev => ({ ...prev, [index]: false }));
    
    try {
      const result = await generateWorkExperiencePoints(
        exp.position,
        exp.company,
        exp.technologies || [],
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

  const approveSuggestion = (expIndex: number, suggestion: AISuggestion) => {
    const updated = [...experiences];
    updated[expIndex].description = [...updated[expIndex].description, suggestion.point];
    onChange(updated);
    
    // Remove the suggestion after approval
    setAiSuggestions(prev => ({
      ...prev,
      [expIndex]: prev[expIndex].filter(s => s.id !== suggestion.id)
    }));
  };

  const deleteSuggestion = (expIndex: number, suggestionId: string) => {
    setAiSuggestions(prev => ({
      ...prev,
      [expIndex]: prev[expIndex].filter(s => s.id !== suggestionId)
    }));
  };

  const rewritePoint = async (expIndex: number, pointIndex: number) => {
    const exp = experiences[expIndex];
    const point = exp.description[pointIndex];
    const customPrompt = improvementConfig[expIndex]?.[pointIndex];
    
    setLoadingPointAI(prev => ({
      ...prev,
      [expIndex]: { ...(prev[expIndex] || {}), [pointIndex]: true }
    }));
    
    try {
      const improvedPoint = await improveWorkExperience(point, customPrompt);
      
      // Store both original and improved versions
      setImprovedPoints(prev => ({
        ...prev,
        [expIndex]: {
          ...(prev[expIndex] || {}),
          [pointIndex]: {
            original: point,
            improved: improvedPoint
          }
        }
      }));

      // Update the experience with the improved version
      const updated = [...experiences];
      updated[expIndex].description[pointIndex] = improvedPoint;
      onChange(updated);
    } catch (error) {
      console.error('Failed to improve point:', error);
    } finally {
      setLoadingPointAI(prev => ({
        ...prev,
        [expIndex]: { ...(prev[expIndex] || {}), [pointIndex]: false }
      }));
    }
  };

  const undoImprovement = (expIndex: number, pointIndex: number) => {
    const improvedPoint = improvedPoints[expIndex]?.[pointIndex];
    if (improvedPoint) {
      const updated = [...experiences];
      updated[expIndex].description[pointIndex] = improvedPoint.original;
      onChange(updated);
      
      // Remove the improvement from state
      setImprovedPoints(prev => {
        const newState = { ...prev };
        if (newState[expIndex]) {
          delete newState[expIndex][pointIndex];
          if (Object.keys(newState[expIndex]).length === 0) {
            delete newState[expIndex];
          }
        }
        return newState;
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={addExperience}
          className={cn(
            "flex-1 h-9",
            "bg-gradient-to-r from-cyan-500/5 via-cyan-500/10 to-blue-500/5",
            "hover:from-cyan-500/10 hover:via-cyan-500/15 hover:to-blue-500/10",
            "border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/40",
            "text-cyan-700 hover:text-cyan-800",
            "transition-all duration-300",
            "rounded-xl"
          )}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Work Experience
        </Button>

        <ImportFromProfileDialog<WorkExperience>
          profile={profile}
          onImport={handleImportFromProfile}
          type="work_experience"
          buttonClassName="flex-1 mb-0 h-9"
        />
      </div>

      {experiences.map((exp, index) => (
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
          
          <CardContent className="p-4 space-y-4">
            {/* Header with Delete Button */}
            <div className="space-y-3">
              {/* Position Title - Full Width */}
              <div className="flex items-start gap-3">
                <div className="relative flex-1">
                  <Input
                    value={exp.position}
                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                    className={cn(
                      "text-sm md:text-base font-semibold tracking-tight h-9",
                      "bg-white/50 border-gray-200 rounded-lg",
                      "focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20",
                      "hover:border-cyan-500/30 hover:bg-white/60 transition-colors",
                      "placeholder:text-gray-400"
                    )}
                    placeholder="Position Title"
                  />
                  <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[7px] md:text-[9px] font-medium text-gray-500">
                    POSITION
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeExperience(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Company and Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="relative">
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    className={cn(
                      "text-sm font-medium bg-white/50 border-gray-200 rounded-lg h-9",
                      "focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20",
                      "hover:border-cyan-500/30 hover:bg-white/60 transition-colors",
                      "placeholder:text-gray-400"
                    )}
                    placeholder="Company Name"
                  />
                  <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[7px] md:text-[9px] font-medium text-gray-500">
                    COMPANY
                  </div>
                </div>
                <div className="relative">
                  <Input
                    value={exp.location}
                    onChange={(e) => updateExperience(index, 'location', e.target.value)}
                    className={cn(
                      "bg-white/50 border-gray-200 rounded-lg h-9",
                      "focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20",
                      "hover:border-cyan-500/30 hover:bg-white/60 transition-colors",
                      "placeholder:text-gray-400"
                    )}
                    placeholder="Location"
                  />
                  <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[7px] md:text-[9px] font-medium text-gray-500">
                    LOCATION
                  </div>
                </div>
              </div>

              {/* Dates Row */}
              <div className="relative group">
                <Input
                  type="text"
                  value={exp.date}
                  onChange={(e) => updateExperience(index, 'date', e.target.value)}
                  className={cn(
                    "w-full bg-white/50 border-gray-200 rounded-lg h-9",
                    "focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20",
                    "hover:border-cyan-500/30 hover:bg-white/60 transition-colors"
                  )}
                  placeholder="e.g., &apos;Jan 2023 - Present&apos; or &apos;2020 - 2022&apos;"
                />
                <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[7px] md:text-[9px] font-medium text-gray-500">
                  DATE
                </div>
                <span className="ml-2 text-[9px] md:text-[11px] text-gray-500">Use &apos;Present&apos; in the date field for current positions</span>
              </div>

              {/* Description Section */}
              <div className="space-y-3">
                <Label className="text-[11px] md:text-xs font-medium text-gray-600">
                  Key Responsibilities & Achievements
                </Label>
                <div className="space-y-2 pl-0">
                  {exp.description.map((desc, descIndex) => (
                    <div key={descIndex} className="flex gap-1 items-start group/item">
                      <div className="flex-1">
                        <Tiptap 
                          content={desc} 
                          onChange={(newContent) => {
                            const updated = [...experiences];
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
                            "focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20",
                            "hover:border-cyan-500/30 hover:bg-white/60 transition-colors",
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
                                const updated = [...experiences];
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
                                  <div className="space-y-2">
                                    <div>
                                      <Label className="text-[11px] font-medium text-purple-700">Prompt for AI (Optional)</Label>
                                      <Textarea
                                        value={improvementConfig[index]?.[descIndex] || ''}
                                        onChange={(e) => setImprovementConfig(prev => ({
                                          ...prev,
                                          [index]: {
                                            ...(prev[index] || {}),
                                            [descIndex]: e.target.value
                                          }
                                        }))}
                                        placeholder="e.g., Make it more impactful and quantifiable"
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
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* AI Suggestions */}
                  {aiSuggestions[index]?.length > 0 && (
                    <div className={cn(
                      "relative group/suggestions",
                      "p-4 mt-3",
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
                                      "min-h-[60px] text-sm",
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

                  {exp.description.length === 0 && !aiSuggestions[index]?.length && (
                    <div className="text-[11px] md:text-xs text-gray-500 italic px-4 py-3 bg-gray-50/50 rounded-lg">
                      Add points to describe your responsibilities and achievements
                    </div>
                  )}
                </div>
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const updated = [...experiences];
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
                              placeholder="e.g., Focus on leadership and team management achievements"
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
              {/* <div className="space-y-2 pt-1">
                <div className="flex justify-between items-baseline">
                  <Label className="text-[11px] md:text-xs font-medium text-gray-600">Technologies & Skills Used</Label>
                  <span className="text-[7px] md:text-[9px] text-gray-500">Separate with commas</span>
                </div>
                <Input
                  value={exp.technologies?.join(', ')}
                  onChange={(e) => updateExperience(index, 'technologies', 
                    e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  )}
                  placeholder="React, TypeScript, Node.js, etc."
                  className={cn(
                    "bg-white/50 border-gray-200 rounded-lg h-9",
                    "focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20",
                    "hover:border-cyan-500/30 hover:bg-white/60 transition-colors",
                    "placeholder:text-gray-400"
                  )}
                />
              </div> */}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 