'use client';

import { WorkExperience } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkExperienceFormProps {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
}

export function WorkExperienceForm({ experiences, onChange }: WorkExperienceFormProps) {
  const addExperience = () => {
    onChange([...experiences, {
      company: "",
      position: "",
      location: "",
      start_date: "",
      end_date: "",
      current: false,
      description: [],
      technologies: []
    }]);
  };

  const updateExperience = (index: number, field: keyof WorkExperience, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeExperience = (index: number) => {
    onChange(experiences.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
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
            <div className="space-y-6">
              {/* Position Title - Full Width */}
              <div className="flex items-start gap-4">
                <div className="relative flex-1">
                  <Input
                    value={exp.position}
                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                    className={cn(
                      "text-lg font-semibold tracking-tight",
                      "bg-white/50 border-gray-200 rounded-lg",
                      "focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20",
                      "hover:border-cyan-500/30 hover:bg-white/60 transition-colors",
                      "placeholder:text-gray-400"
                    )}
                    placeholder="Position Title"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-gray-500">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    className={cn(
                      "font-medium bg-white/50 border-gray-200 rounded-lg",
                      "focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20",
                      "hover:border-cyan-500/30 hover:bg-white/60 transition-colors",
                      "placeholder:text-gray-400"
                    )}
                    placeholder="Company Name"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-gray-500">
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
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-gray-500">
                    LOCATION
                  </div>
                </div>
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
                <div className="relative">
                  <Input
                    type="date"
                    value={exp.start_date}
                    onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                    className={cn(
                      "w-full bg-white/50 border-gray-200 rounded-lg",
                      "focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20",
                      "hover:border-cyan-500/30 hover:bg-white/60 transition-colors"
                    )}
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-gray-500">
                    START DATE
                  </div>
                </div>
                {!exp.current ? (
                  <div className="relative">
                    <Input
                      type="date"
                      value={exp.end_date || ''}
                      onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                      className={cn(
                        "w-full bg-white/50 border-gray-200 rounded-lg",
                        "focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20",
                        "hover:border-cyan-500/30 hover:bg-white/60 transition-colors"
                      )}
                    />
                    <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-gray-500">
                      END DATE
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="text-teal-600 font-medium">Present</span>
                  </div>
                )}
              </div>

              {/* Current Position Switch */}
              <div className="flex items-center space-x-2 text-sm text-cyan-700">
                <Switch
                  checked={exp.current}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateExperience(index, 'end_date', null);
                    }
                    updateExperience(index, 'current', checked);
                  }}
                  className="data-[state=checked]:bg-cyan-600"
                />
                <Label>I currently work here</Label>
              </div>

              {/* Description Section */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium text-gray-600">Key Responsibilities & Achievements</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updated = [...experiences];
                      updated[index].description = [...updated[index].description, ""];
                      onChange(updated);
                    }}
                    className="text-cyan-600 hover:text-cyan-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Point
                  </Button>
                </div>
                <div className="space-y-3 pl-0">
                  {exp.description.map((desc, descIndex) => (
                    <div key={descIndex} className="flex gap-3 items-start group/item">
                      <div className="flex-1">
                        <Input
                          value={desc}
                          onChange={(e) => {
                            const updated = [...experiences];
                            updated[index].description[descIndex] = e.target.value;
                            onChange(updated);
                          }}
                          placeholder="Start with a strong action verb"
                          className={cn(
                            "bg-white/50 border-gray-200 rounded-lg",
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
                        className="opacity-0 group-hover/item:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {exp.description.length === 0 && (
                    <div className="text-sm text-gray-500 italic px-4 py-3 bg-gray-50/50 rounded-lg">
                      Add points to describe your responsibilities and achievements
                    </div>
                  )}
                </div>
              </div>

              {/* Technologies Section */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-baseline">
                  <Label className="text-sm font-medium text-gray-600">Technologies & Skills Used</Label>
                  <span className="text-[10px] text-gray-500">Separate with commas</span>
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

      <Button 
        variant="outline" 
        onClick={addExperience}
        className={cn(
          "w-full h-16",
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
    </div>
  );
} 