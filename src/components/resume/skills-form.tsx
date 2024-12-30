'use client';

import { Skill, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ImportFromProfileDialog } from "./import-from-profile-dialog";

interface SkillsFormProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
  profile: Profile;
}

export function SkillsForm({ skills, onChange, profile }: SkillsFormProps) {
  const addSkillCategory = () => {
    onChange([{
      category: "",
      items: []
    }, ...skills]);
  };

  const updateSkillCategory = (index: number, field: keyof Skill, value: any) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeSkillCategory = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const handleSkillInput = (index: number, value: string) => {
    const skills = value.split(',').map(skill => skill.trim()).filter(Boolean);
    updateSkillCategory(index, 'items', skills);
  };

  const removeSkill = (categoryIndex: number, skillIndex: number) => {
    const updated = [...skills];
    updated[categoryIndex].items = updated[categoryIndex].items.filter((_, i) => i !== skillIndex);
    onChange(updated);
  };

  const handleImportFromProfile = (importedSkills: Skill[]) => {
    onChange([...importedSkills, ...skills]);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1 h-8 bg-gradient-to-r from-rose-500/5 via-rose-500/10 to-pink-500/5 hover:from-rose-500/10 hover:via-rose-500/15 hover:to-pink-500/10 border-2 border-dashed border-rose-500/30 hover:border-rose-500/40 text-rose-700 hover:text-rose-800 transition-all duration-300 rounded-xl"
          onClick={addSkillCategory}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Skill Category
        </Button>

        <ImportFromProfileDialog<Skill>
          profile={profile}
          onImport={handleImportFromProfile}
          type="skills"
          buttonClassName="flex-1 mb-0 h-8 bg-gradient-to-r from-rose-500/5 via-rose-500/10 to-pink-500/5 hover:from-rose-500/10 hover:via-rose-500/15 hover:to-pink-500/10 border-2 border-dashed border-rose-500/30 hover:border-rose-500/40 text-rose-700 hover:text-rose-800"
        />
      </div>

      {skills.map((skill, index) => (
        <Card key={index} className="relative group bg-gradient-to-r from-rose-500/5 via-rose-500/10 to-pink-500/5 backdrop-blur-md border-2 border-rose-500/30 hover:border-rose-500/40 hover:shadow-lg transition-all duration-300 shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Category Name and Delete Button Row */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative group flex-1">
                  <Input
                    value={skill.category}
                    onChange={(e) => updateSkillCategory(index, 'category', e.target.value)}
                    className="text-base font-medium h-8 bg-white/50 border-gray-200 rounded-lg
                      focus:border-rose-500/40 focus:ring-2 focus:ring-rose-500/20
                      hover:border-rose-500/30 hover:bg-white/60 transition-colors
                      placeholder:text-gray-400"
                    placeholder="Category Name"
                  />
                  <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[9px] font-medium text-rose-700">
                    CATEGORY
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeSkillCategory(index)}
                  className="h-8 w-8 text-gray-400 hover:text-red-500 transition-colors duration-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Skills Input */}
              <div className="space-y-2">
                <div className="relative group">
                  <Input
                    value={skill.items.join(', ')}
                    onChange={(e) => handleSkillInput(index, e.target.value)}
                    className="h-8 bg-white/50 border-gray-200 rounded-lg
                      focus:border-rose-500/40 focus:ring-2 focus:ring-rose-500/20
                      hover:border-rose-500/30 hover:bg-white/60 transition-colors
                      placeholder:text-gray-400"
                    placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js)"
                  />
                  <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[9px] font-medium text-rose-700">
                    SKILLS
                  </div>
                </div>

                {/* Skills Display */}
                <div className="flex flex-wrap gap-1.5">
                  {skill.items.map((item, skillIndex) => (
                    <Badge
                      key={skillIndex}
                      variant="secondary"
                      className={cn(
                        "bg-white/60 hover:bg-white/80 text-rose-700 border border-rose-200 py-0.5",
                        "transition-all duration-300 group/badge cursor-default text-xs"
                      )}
                    >
                      {item}
                      <button
                        onClick={() => removeSkill(index, skillIndex)}
                        className="ml-1.5 hover:text-red-500 opacity-50 hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Helper Text */}
              <div className="text-[9px] text-gray-500 italic">
                Pro tip: Add skills that are relevant to your target role and that you're confident discussing in interviews
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 