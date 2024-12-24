'use client';

import { WorkExperience } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

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
    <div className="space-y-4">
      {experiences.map((exp, index) => (
        <Card key={index} className="bg-white/40 backdrop-blur-md border-white/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Experience {index + 1}</CardTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => removeExperience(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={exp.company}
                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Input
                  value={exp.position}
                  onChange={(e) => updateExperience(index, 'position', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={exp.location}
                onChange={(e) => updateExperience(index, 'location', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={exp.start_date}
                  onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                />
              </div>
              {!exp.current && (
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={exp.end_date || ''}
                    onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={exp.current}
                onCheckedChange={(checked) => updateExperience(index, 'current', checked)}
              />
              <Label>Current Position</Label>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={exp.description.join('\n')}
                onChange={(e) => updateExperience(index, 'description', e.target.value.split('\n'))}
                placeholder="Enter each bullet point on a new line"
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Technologies</Label>
              <Input
                value={exp.technologies?.join(', ')}
                onChange={(e) => updateExperience(index, 'technologies', 
                  e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                )}
                placeholder="Comma-separated technologies"
              />
            </div>
          </CardContent>
        </Card>
      ))}
      <Button 
        variant="outline" 
        className="w-full"
        onClick={addExperience}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Work Experience
      </Button>
    </div>
  );
} 