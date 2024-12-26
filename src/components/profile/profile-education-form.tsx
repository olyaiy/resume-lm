'use client';

import { Education } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ProfileEducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

export function ProfileEducationForm({ education, onChange }: ProfileEducationFormProps) {
  const addEducation = () => {
    onChange([...education, {
      school: "",
      degree: "",
      field: "",
      location: "",
      date: "",
      gpa: undefined,
      achievements: []
    }]);
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeEducation = (index: number) => {
    onChange(education.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {education.map((edu, index) => (
        <Card key={index} className="relative group bg-gradient-to-r from-indigo-500/5 via-indigo-500/10 to-blue-500/5 backdrop-blur-md border-2 border-indigo-500/30 hover:border-indigo-500/40 hover:shadow-lg transition-all duration-300 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* School Name and Delete Button Row */}
              <div className="flex items-center justify-between gap-4">
                <div className="relative group flex-1">
                  <Input
                    value={edu.school}
                    onChange={(e) => updateEducation(index, 'school', e.target.value)}
                    className="text-lg font-semibold bg-white/50 border-gray-200 rounded-lg
                      focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20
                      hover:border-indigo-500/30 hover:bg-white/60 transition-colors
                      placeholder:text-gray-400"
                    placeholder="Institution Name"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-indigo-700">
                    INSTITUTION
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeEducation(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Location */}
              <div className="relative group">
                <Input
                  value={edu.location}
                  onChange={(e) => updateEducation(index, 'location', e.target.value)}
                  className="bg-white/50 border-gray-200 rounded-lg
                    focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20
                    hover:border-indigo-500/30 hover:bg-white/60 transition-colors
                    placeholder:text-gray-400"
                  placeholder="City, Country"
                />
                <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-indigo-700">
                  LOCATION
                </div>
              </div>

              {/* Degree and Field Row */}
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="relative group flex-1">
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    className="bg-white/50 border-gray-200 rounded-lg
                      focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20
                      hover:border-indigo-500/30 hover:bg-white/60 transition-colors
                      placeholder:text-gray-400"
                    placeholder="Bachelor's, Master's, etc."
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-indigo-700">
                    DEGREE
                  </div>
                </div>
                <div className="relative group flex-1">
                  <Input
                    value={edu.field}
                    onChange={(e) => updateEducation(index, 'field', e.target.value)}
                    className="bg-white/50 border-gray-200 rounded-lg
                      focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20
                      hover:border-indigo-500/30 hover:bg-white/60 transition-colors
                      placeholder:text-gray-400"
                    placeholder="Field of Study"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-indigo-700">
                    FIELD OF STUDY
                  </div>
                </div>
              </div>

              {/* Dates Row */}
              <div className="relative group">
                <Input
                  type="text"
                  value={edu.date}
                  onChange={(e) => updateEducation(index, 'date', e.target.value)}
                  className="bg-white/50 border-gray-200 rounded-lg
                    focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20
                    hover:border-indigo-500/30 hover:bg-white/60 transition-colors w-full"
                  placeholder="e.g., '2019 - 2023' or '2020 - Present'"
                />
                <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-indigo-700">
                  DATE
                </div>
              </div>

              {/* Current Status Note */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Use 'Present' in the date field for current education</span>
              </div>

              {/* GPA */}
              <div className="relative group w-full md:w-1/3">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={edu.gpa || ''}
                  onChange={(e) => updateEducation(index, 'gpa', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="bg-white/50 border-gray-200 rounded-lg
                    focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20
                    hover:border-indigo-500/30 hover:bg-white/60 transition-colors
                    placeholder:text-gray-400"
                  placeholder="0.00"
                />
                <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-indigo-700">
                  GPA (OPTIONAL)
                </div>
              </div>

              {/* Achievements */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <Label className="text-sm font-medium text-indigo-700">Achievements & Activities</Label>
                  <span className="text-[10px] text-gray-500">One achievement per line</span>
                </div>
                <Textarea
                  value={edu.achievements?.join('\n')}
                  onChange={(e) => updateEducation(index, 'achievements', 
                    e.target.value.split('\n').filter(Boolean)
                  )}
                  placeholder="• Dean's List 2020-2021&#10;• President of Computer Science Club&#10;• First Place in Hackathon 2022"
                  className="min-h-[150px] bg-white/50 border-gray-200 rounded-lg
                    focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20
                    hover:border-indigo-500/30 hover:bg-white/60 transition-colors
                    placeholder:text-gray-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button 
        variant="outline" 
        className="w-full bg-gradient-to-r from-indigo-500/5 via-indigo-500/10 to-blue-500/5 hover:from-indigo-500/10 hover:via-indigo-500/15 hover:to-blue-500/10 border-dashed border-indigo-500/30 hover:border-indigo-500/40 text-indigo-700 hover:text-indigo-800 transition-all duration-300"
        onClick={addEducation}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Education
      </Button>
    </div>
  );
} 