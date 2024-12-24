'use client';

import { WorkExperience } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";

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
      end_date: null,
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
    <div className="space-y-6">
      {experiences.map((exp, index) => (
        <Card key={index} className="relative group bg-gradient-to-r from-cyan-500/5 via-cyan-500/10 to-blue-500/5 backdrop-blur-md border-cyan-500/20 hover:shadow-lg transition-all duration-300 hover:border-cyan-500/30">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-cyan-100/80 rounded-lg p-1 cursor-move">
              <GripVertical className="h-4 w-4 text-cyan-600" />
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="flex justify-end mb-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => removeExperience(index)}
                className="text-gray-400 hover:text-red-500 transition-colors duration-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Position and Dates Row */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 relative group">
                  <Input
                    value={exp.position}
                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                    className="text-lg font-semibold bg-white/50 border-gray-200 rounded-lg
                      focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20 
                      hover:border-cyan-500/30 hover:bg-white/60 transition-colors
                      placeholder:text-gray-400"
                    placeholder="Position Title"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-gray-500">
                    POSITION
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="relative group">
                      <Input
                        type="date"
                        value={exp.start_date}
                        onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                        className="w-auto bg-white/50 border-gray-200 rounded-lg
                          focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20
                          hover:border-cyan-500/30 hover:bg-white/60 transition-colors"
                      />
                      <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-gray-500">
                        START DATE
                      </div>
                    </div>
                    <span>-</span>
                    {!exp.current ? (
                      <div className="relative group">
                        <Input
                          type="date"
                          value={exp.end_date || ''}
                          onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                          className="w-auto bg-white/50 border-gray-200 rounded-lg
                            focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20
                            hover:border-cyan-500/30 hover:bg-white/60 transition-colors"
                        />
                        <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-gray-500">
                          END DATE
                        </div>
                      </div>
                    ) : (
                      <span className="text-teal-600 font-medium">Present</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Company and Location Row */}
              <div className="flex flex-col md:flex-row md:items-start gap-4 text-gray-600">
                <div className="relative group flex-1">
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    className="font-medium bg-white/50 border-gray-200 rounded-lg
                      focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20
                      hover:border-cyan-500/30 hover:bg-white/60 transition-colors
                      placeholder:text-gray-400"
                    placeholder="Company Name"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-gray-500">
                    COMPANY
                  </div>
                </div>
                <div className="relative group flex-1">
                  <Input
                    value={exp.location}
                    onChange={(e) => updateExperience(index, 'location', e.target.value)}
                    className="bg-white/50 border-gray-200 rounded-lg
                      focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20
                      hover:border-cyan-500/30 hover:bg-white/60 transition-colors
                      placeholder:text-gray-400"
                    placeholder="Location"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-gray-500">
                    LOCATION
                  </div>
                </div>
              </div>

              {/* Current Position Switch */}
              <div className="flex items-center space-x-2 text-sm text-cyan-700 pt-2">
                <Switch
                  checked={exp.current}
                  onCheckedChange={(checked) => {
                    updateExperience(index, 'current', checked);
                    if (checked) {
                      updateExperience(index, 'end_date', null);
                    }
                  }}
                  className="data-[state=checked]:bg-cyan-600"
                />
                <Label>I currently work here</Label>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <Label className="text-sm font-medium text-gray-600">Key Responsibilities & Achievements</Label>
                  <span className="text-[10px] text-gray-500">One achievement per line</span>
                </div>
                <Textarea
                  value={exp.description.join('\n')}
                  onChange={(e) => updateExperience(index, 'description', e.target.value.split('\n'))}
                  placeholder="• Enter each achievement on a new line&#10;• Start with strong action verbs&#10;• Quantify results where possible"
                  className="min-h-[150px] bg-white/50 border-gray-200 rounded-lg
                    focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20
                    hover:border-cyan-500/30 hover:bg-white/60 transition-colors
                    placeholder:text-gray-400"
                />
              </div>

              {/* Technologies */}
              <div className="space-y-2">
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
                  className="bg-white/50 border-gray-200 rounded-lg
                    focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20
                    hover:border-cyan-500/30 hover:bg-white/60 transition-colors
                    placeholder:text-gray-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button 
        variant="outline" 
        onClick={addExperience}
        className="w-full bg-gradient-to-r from-cyan-500/5 via-cyan-500/10 to-blue-500/5 hover:from-cyan-500/10 hover:via-cyan-500/15 hover:to-blue-500/10 border-dashed border-cyan-500/30 hover:border-cyan-500/40 text-cyan-700 hover:text-cyan-800 transition-all duration-300"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Work Experience
      </Button>
    </div>
  );
} 