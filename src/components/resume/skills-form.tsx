'use client';

import { Skill } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface SkillsFormProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

export function SkillsForm({ skills, onChange }: SkillsFormProps) {
  const addSkillCategory = () => {
    onChange([...skills, {
      category: "",
      items: []
    }]);
  };

  const updateSkillCategory = (index: number, field: keyof Skill, value: any) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeSkillCategory = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {skills.map((skill, index) => (
        <Card key={index} className="bg-white/40 backdrop-blur-md border-white/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Skill Category {index + 1}</CardTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => removeSkillCategory(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                value={skill.category}
                onChange={(e) => updateSkillCategory(index, 'category', e.target.value)}
                placeholder="e.g., Programming Languages, Tools, Soft Skills"
              />
            </div>
            <div className="space-y-2">
              <Label>Skills</Label>
              <Input
                value={skill.items.join(', ')}
                onChange={(e) => updateSkillCategory(index, 'items', 
                  e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                )}
                placeholder="Enter skills separated by commas"
              />
            </div>
          </CardContent>
        </Card>
      ))}
      <Button 
        variant="outline" 
        className="w-full"
        onClick={addSkillCategory}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Skill Category
      </Button>
    </div>
  );
} 