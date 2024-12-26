'use client';

import { WorkExperience, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical, Check, X, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImportFromProfileDialog } from "./import-from-profile-dialog";
import { generateWorkExperiencePoints } from "@/utils/ai";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

export function WorkExperienceForm({ experiences, onChange, profile, targetRole = "Software Engineer" }: WorkExperienceFormProps) {
  const [aiSuggestions, setAiSuggestions] = useState<{ [key: number]: AISuggestion[] }>({});
  const [loadingAI, setLoadingAI] = useState<{ [key: number]: boolean }>({});
  const [aiConfig, setAiConfig] = useState<{ [key: number]: { numPoints: number; customPrompt: string } }>({});
  const [popoverOpen, setPopoverOpen] = useState<{ [key: number]: boolean }>({});

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

  const updateExperience = (index: number, field: keyof WorkExperience, value: any) => {
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

  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={addExperience}
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
          Add Work Experience
        </Button>

        <ImportFromProfileDialog<WorkExperience>
          profile={profile}
          onImport={handleImportFromProfile}
          type="work_experience"
          buttonClassName="flex-1 mb-0"
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
          
          <CardContent className="p-6 space-y-8">
            {/* Header with Delete Button */}
            <div className="space-y-4">
              {/* Position Title - Full Width */}
              <div className="flex items-start gap-4">
                <div className="relative flex-1">
                  <Input
                    value={exp.position}
                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                    className={cn(
                      "text-sm md:text-base font-semibold tracking-tight",
                      "bg-white/50 border-gray-200 rounded-lg",
                      "focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20",
                      "hover:border-cyan-500/30 hover:bg-white/60 transition-colors",
                      "placeholder:text-gray-400"
                    )}
                    placeholder="Position Title"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[7px] md:text-[9px] font-medium text-gray-500">
                    POSITION
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeExperience(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 mt-1"
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
                      "text-sm font-medium bg-white/50 border-gray-200 rounded-lg",
                      "focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20",
                      "hover:border-cyan-500/30 hover:bg-white/60 transition-colors",
                      "placeholder:text-gray-400"
                    )}
                    placeholder="Company Name"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[7px] md:text-[9px] font-medium text-gray-500">
                    COMPANY
                  </div>
                </div>
                <div className="relative">
                  <Input
                    value={exp.location}
                    onChange={(e) => updateExperience(index, 'location', e.target.value)}
                    className={cn(
                      "bg-white/50 border-gray-200 rounded-lg",
                      "focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20",
                      "hover:border-cyan-500/30 hover:bg-white/60 transition-colors",
                      "placeholder:text-gray-400"
                    )}
                    placeholder="Location"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[7px] md:text-[9px] font-medium text-gray-500">
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
                  className="w-full bg-white/50 border-gray-200 rounded-lg
                    focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20
                    hover:border-cyan-500/30 hover:bg-white/60 transition-colors"
                  placeholder="e.g., 'Jan 2023 - Present' or '2020 - 2022'"
                />
                <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[7px] md:text-[9px] font-medium text-gray-500">
                  DATE
                </div>
                <span className=" ml-2 text-[9px] md:text-[11px] text-gray-500">Use 'Present' in the date field for current positions</span>
              </div>

              {/* Description Section */}
              <div className="space-y-4">
                <Label className="text-[11px] md:text-xs font-medium text-gray-600">
                  Key Responsibilities & Achievements
                </Label>
                <div className="space-y-3 pl-0">
                  {exp.description.map((desc, descIndex) => (
                    <div key={descIndex} className="flex gap-1 items-start group/item">
                      <div className="flex-1">
                        <Textarea
                          value={desc}
                          onChange={(e) => {
                            const updated = [...experiences];
                            updated[index].description[descIndex] = e.target.value;
                            onChange(updated);
                          }}
                          placeholder="Start with a strong action verb"
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
                          const updated = [...experiences];
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
                  <Popover 
                    open={popoverOpen[index]} 
                    onOpenChange={(open) => setPopoverOpen(prev => ({ ...prev, [index]: open }))}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={loadingAI[index]}
                        className={cn(
                          "flex-1 text-purple-600 hover:text-purple-700 transition-colors text-[11px] md:text-xs",
                          "border-purple-200 hover:border-purple-300 hover:bg-purple-50/50"
                        )}
                      >
                        {loadingAI[index] ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <span className="h-4 w-4 mr-1">✨</span>
                        )}
                        {loadingAI[index] ? 'Generating...' : 'Write points with AI'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-80"
                      align="start"
                      side="top"
                    >
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs">Number of Suggestions</Label>
                          <Input
                            type="number"
                            min={1}
                            max={8}
                            value={aiConfig[index]?.numPoints || 3}
                            onChange={(e) => setAiConfig(prev => ({
                              ...prev,
                              [index]: { ...prev[index], numPoints: parseInt(e.target.value) || 3 }
                            }))}
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Custom Focus (Optional)</Label>
                          <Textarea
                            value={aiConfig[index]?.customPrompt || ''}
                            onChange={(e) => setAiConfig(prev => ({
                              ...prev,
                              [index]: { ...prev[index], customPrompt: e.target.value }
                            }))}
                            placeholder="e.g., Focus on my experience with Docker and Kubernetes, highlighting scalability achievements"
                            className="h-24 text-xs"
                          />
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => generateAIPoints(index)}
                        >
                          Generate Points
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Technologies Section */}
              <div className="space-y-3 pt-2">
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