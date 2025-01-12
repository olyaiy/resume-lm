'use client';

import { Skill, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import { useState, KeyboardEvent } from 'react';

interface SkillsFormProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
  profile: Profile;
}

export function SkillsForm({
  skills,
  onChange,
  profile
}: SkillsFormProps) {
  const [newSkills, setNewSkills] = useState<{ [key: number]: string }>({});

  const addSkillCategory = () => {
    onChange([{
      category: "",
      items: []
    }, ...skills]);
  };

  const updateSkillCategory = (index: number, field: keyof Skill, value: string | string[]) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeSkillCategory = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const addSkill = (categoryIndex: number) => {
    const skillToAdd = newSkills[categoryIndex]?.trim();
    if (!skillToAdd) return;

    const updated = [...skills];
    const currentItems = updated[categoryIndex].items || [];
    if (!currentItems.includes(skillToAdd)) {
      updated[categoryIndex] = {
        ...updated[categoryIndex],
        items: [...currentItems, skillToAdd]
      };
      onChange(updated);
    }
    setNewSkills({ ...newSkills, [categoryIndex]: '' });
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>, categoryIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(categoryIndex);
    }
  };

  const removeSkill = (categoryIndex: number, skillIndex: number) => {
    const updated = skills.map((skill, idx) => {
      if (idx === categoryIndex) {
        return {
          ...skill,
          items: skill.items.filter((_, i) => i !== skillIndex)
        };
      }
      return skill;
    });
    onChange(updated);
  };

  const handleImportFromProfile = (importedSkills: Skill[]) => {
    onChange([...importedSkills, ...skills]);
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="@container">
        <div className={cn(
          "flex flex-col @[400px]:flex-row gap-2",
          "transition-all duration-300 ease-in-out"
        )}>
          <Button 
            variant="outline" 
            className={cn(
              "flex-1 h-9 min-w-[120px]",
              "bg-gradient-to-r from-rose-500/5 via-rose-500/10 to-pink-500/5",
              "hover:from-rose-500/10 hover:via-rose-500/15 hover:to-pink-500/10",
              "border-2 border-dashed border-rose-500/30 hover:border-rose-500/40",
              "text-rose-700 hover:text-rose-800",
              "transition-all duration-300",
              "rounded-xl",
              "whitespace-nowrap text-[11px] @[300px]:text-sm"
            )}
            onClick={addSkillCategory}
          >
            <Plus className="h-4 w-4 mr-2 shrink-0" />
            Add Skill Category
          </Button>

          <ImportFromProfileDialog<Skill>
            profile={profile}
            onImport={handleImportFromProfile}
            type="skills"
            buttonClassName={cn(
              "flex-1 mb-0 h-9 min-w-[120px]",
              "whitespace-nowrap text-[11px] @[300px]:text-sm",
              "bg-gradient-to-r from-rose-500/5 via-rose-500/10 to-pink-500/5",
              "hover:from-rose-500/10 hover:via-rose-500/15 hover:to-pink-500/10",
              "border-2 border-dashed border-rose-500/30 hover:border-rose-500/40",
              "text-rose-700 hover:text-rose-800"
            )}
          />
        </div>
      </div>

      {skills.map((skill, index) => (
        <Card 
          key={index} 
          className={cn(
            "relative group transition-all duration-300",
            "bg-gradient-to-r from-rose-500/5 via-rose-500/10 to-pink-500/5",
            "backdrop-blur-md border-2 border-rose-500/30",
            "shadow-sm"
          )}
        >
          <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div className="space-y-2 sm:space-y-3">
              {/* Category Name and Delete Button Row */}
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="relative group flex-1">
                  <Input
                    value={skill.category}
                    onChange={(e) => updateSkillCategory(index, 'category', e.target.value)}
                    className={cn(
                      "text-sm font-medium h-9",
                      "bg-white/50 border-gray-200 rounded-lg",
                      "focus:border-rose-500/40 focus:ring-2 focus:ring-rose-500/20",
                      "hover:border-rose-500/30 hover:bg-white/60 transition-colors",
                      "placeholder:text-gray-400"
                    )}
                    placeholder="Category Name"
                  />
                  <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[7px] sm:text-[9px] font-medium text-rose-700">
                    CATEGORY
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeSkillCategory(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Skills Display */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {skill.items.map((item, skillIndex) => (
                    <Badge
                      key={skillIndex}
                      variant="secondary"
                      className={cn(
                        "bg-white/60 hover:bg-white/80 text-rose-700 border border-rose-200 py-0.5",
                        "transition-all duration-300 group/badge cursor-default text-[10px] sm:text-xs"
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

                {/* New Skill Input */}
                <div className="relative group flex gap-2">
                  <Input
                    value={newSkills[index] || ''}
                    onChange={(e) => setNewSkills({ ...newSkills, [index]: e.target.value })}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    className={cn(
                      "h-9 bg-white/50 border-gray-200 rounded-lg",
                      "focus:border-rose-500/40 focus:ring-2 focus:ring-rose-500/20",
                      "hover:border-rose-500/30 hover:bg-white/60 transition-colors",
                      "placeholder:text-gray-400",
                      "text-[10px] sm:text-xs"
                    )}
                    placeholder="Type a skill and press Enter or click +"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSkill(index)}
                    className="h-9 px-2 bg-white/50 hover:bg-white/60"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <div className="absolute -top-2 left-2 px-1 bg-white/80 text-[7px] sm:text-[9px] font-medium text-rose-700">
                    ADD SKILL
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 