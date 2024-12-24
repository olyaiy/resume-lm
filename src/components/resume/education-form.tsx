'use client';

import { Education } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface EducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

export function EducationForm({ education, onChange }: EducationFormProps) {
  const addEducation = () => {
    onChange([...education, {
      school: "",
      degree: "",
      field: "",
      location: "",
      start_date: "",
      end_date: null,
      current: false,
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
        <Card key={index} className="bg-white/40 backdrop-blur-md border-white/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Education {index + 1}</CardTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => removeEducation(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>School</Label>
                <Input
                  value={edu.school}
                  onChange={(e) => updateEducation(index, 'school', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={edu.location}
                  onChange={(e) => updateEducation(index, 'location', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Degree</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Field of Study</Label>
                <Input
                  value={edu.field}
                  onChange={(e) => updateEducation(index, 'field', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={edu.start_date}
                  onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                />
              </div>
              {!edu.current && (
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={edu.end_date || ''}
                    onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={edu.current}
                onCheckedChange={(checked) => updateEducation(index, 'current', checked)}
              />
              <Label>Currently Studying</Label>
            </div>
            <div className="space-y-2">
              <Label>GPA</Label>
              <Input
                type="number"
                step="0.01"
                value={edu.gpa || ''}
                onChange={(e) => updateEducation(index, 'gpa', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Achievements</Label>
              <Input
                value={edu.achievements?.join('\n')}
                onChange={(e) => updateEducation(index, 'achievements', 
                  e.target.value.split('\n').filter(Boolean)
                )}
                placeholder="Enter each achievement on a new line"
              />
            </div>
          </CardContent>
        </Card>
      ))}
      <Button 
        variant="outline" 
        className="w-full"
        onClick={addEducation}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Education
      </Button>
    </div>
  );
} 