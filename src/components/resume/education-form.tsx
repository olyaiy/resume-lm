'use client';

import { Education, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ImportFromProfileDialog } from "./import-from-profile-dialog";

interface EducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
  profile: Profile;
}

export function EducationForm({ education, onChange, profile }: EducationFormProps) {
  const addEducation = () => {
    onChange([{
      school: "",
      degree: "",
      field: "",
      location: "",
      date: "",
      gpa: undefined,
      achievements: []
    }, ...education]);
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeEducation = (index: number) => {
    onChange(education.filter((_, i) => i !== index));
  };

  const handleImportFromProfile = (importedEducation: Education[]) => {
    onChange([...importedEducation, ...education]);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1 h-8 bg-gradient-to-r from-indigo-500/5 via-indigo-500/10 to-blue-500/5 hover:from-indigo-500/10 hover:via-indigo-500/15 hover:to-blue-500/10 border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/40 text-indigo-700 hover:text-indigo-800 transition-all duration-300 rounded-xl"
          onClick={addEducation}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Education
        </Button>

        <ImportFromProfileDialog<Education>
          profile={profile}
          onImport={handleImportFromProfile}
          type="education"
          buttonClassName="flex-1 mb-0 h-8 bg-gradient-to-r from-indigo-500/5 via-indigo-500/10 to-blue-500/5 hover:from-indigo-500/10 hover:via-indigo-500/15 hover:to-blue-500/10 border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/40 text-indigo-700 hover:text-indigo-800"
        />
      </div>

      {education.map((edu, index) => (
        <Card key={index} className="relative group bg-gradient-to-r from-indigo-500/5 via-indigo-500/10 to-blue-500/5 backdrop-blur-md border-2 border-indigo-500/30 hover:border-indigo-500/40 hover:shadow-lg transition-all duration-300 shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* School Name and Delete Button Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="relative group flex-1 min-w-0">
                  <Input
                    value={edu.school}
                    onChange={(e) => updateEducation(index, 'school', e.target.value)}
                    className="text-base font-semibold bg-white/50 border-gray-200 rounded-lg h-9
                      focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20
                      hover:border-indigo-500/30 hover:bg-white/60 transition-colors
                      placeholder:text-gray-400"
                    placeholder="Institution Name"
                  />
                  <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[10px] font-medium text-indigo-700">
                    INSTITUTION
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeEducation(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 shrink-0 h-9 w-9"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Location */}
              <div className="relative group">
                <Input
                  value={edu.location}
                  onChange={(e) => updateEducation(index, 'location', e.target.value)}
                  className="bg-white/50 border-gray-200 rounded-lg h-9
                    focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20
                    hover:border-indigo-500/30 hover:bg-white/60 transition-colors
                    placeholder:text-gray-400"
                  placeholder="City, Country"
                />
                <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[10px] font-medium text-indigo-700">
                  LOCATION
                </div>
              </div>

              {/* Degree and Field Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative group">
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    className="bg-white/50 border-gray-200 rounded-lg h-9
                      focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20
                      hover:border-indigo-500/30 hover:bg-white/60 transition-colors
                      placeholder:text-gray-400"
                    placeholder="Bachelor's, Master's, etc."
                  />
                  <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[10px] font-medium text-indigo-700">
                    DEGREE
                  </div>
                </div>
                <div className="relative group">
                  <Input
                    value={edu.field}
                    onChange={(e) => updateEducation(index, 'field', e.target.value)}
                    className="bg-white/50 border-gray-200 rounded-lg h-9
                      focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20
                      hover:border-indigo-500/30 hover:bg-white/60 transition-colors
                      placeholder:text-gray-400"
                    placeholder="Field of Study"
                  />
                  <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[10px] font-medium text-indigo-700">
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
                  className="bg-white/50 border-gray-200 rounded-lg h-9
                    focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20
                    hover:border-indigo-500/30 hover:bg-white/60 transition-colors w-full"
                  placeholder="e.g., '2019 - 2023' or '2020 - Present'"
                />
                <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[10px] font-medium text-indigo-700">
                  DATE
                </div>
              </div>

              {/* Current Status Note */}
              <div className="flex items-center space-x-2 -mt-2">
                <span className="text-[10px] text-gray-500">Use 'Present' in the date field for current education</span>
              </div>

              {/* GPA */}
              <div className="relative group w-full sm:w-1/2 lg:w-1/3">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={edu.gpa || ''}
                  onChange={(e) => updateEducation(index, 'gpa', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="bg-white/50 border-gray-200 rounded-lg h-9
                    focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20
                    hover:border-indigo-500/30 hover:bg-white/60 transition-colors
                    placeholder:text-gray-400"
                  placeholder="0.00"
                />
                <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[10px] font-medium text-indigo-700">
                  GPA (OPTIONAL)
                </div>
              </div>

              {/* Achievements */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <Label className="text-xs font-medium text-indigo-700">Achievements & Activities</Label>
                  <span className="text-[10px] text-gray-500">One achievement per line</span>
                </div>
                <Textarea
                  value={edu.achievements?.join('\n')}
                  onChange={(e) => updateEducation(index, 'achievements', 
                    e.target.value.split('\n').filter(Boolean)
                  )}
                  placeholder="• Dean's List 2020-2021&#10;• President of Computer Science Club&#10;• First Place in Hackathon 2022"
                  className="min-h-[120px] bg-white/50 border-gray-200 rounded-lg
                    focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20
                    hover:border-indigo-500/30 hover:bg-white/60 transition-colors
                    placeholder:text-gray-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 