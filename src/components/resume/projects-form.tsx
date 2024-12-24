'use client';

import { Project } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface ProjectsFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

export function ProjectsForm({ projects, onChange }: ProjectsFormProps) {
  const addProject = () => {
    onChange([...projects, {
      name: "",
      description: [],
      technologies: [],
      url: "",
      github_url: "",
      start_date: "",
      end_date: null,
      highlights: []
    }]);
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeProject = (index: number) => {
    onChange(projects.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {projects.map((project, index) => (
        <Card key={index} className="relative group bg-gradient-to-r from-violet-500/5 via-violet-500/10 to-purple-500/5 backdrop-blur-md border-2 border-violet-500/30 hover:border-violet-500/40 hover:shadow-lg transition-all duration-300 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Project Name and Delete Button Row */}
              <div className="flex items-center justify-between gap-4">
                <div className="relative group flex-1">
                  <Input
                    value={project.name}
                    onChange={(e) => updateProject(index, 'name', e.target.value)}
                    className="text-lg font-semibold bg-white/50 border-gray-200 rounded-lg
                      focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20
                      hover:border-violet-500/30 hover:bg-white/60 transition-colors
                      placeholder:text-gray-400"
                    placeholder="Project Name"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-violet-700">
                    PROJECT NAME
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeProject(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* URLs Row */}
              <div className="flex flex-col md:flex-row md:items-start gap-4 text-gray-600">
                <div className="relative group flex-1">
                  <Input
                    type="url"
                    value={project.url || ''}
                    onChange={(e) => updateProject(index, 'url', e.target.value)}
                    className="bg-white/50 border-gray-200 rounded-lg
                      focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20
                      hover:border-violet-500/30 hover:bg-white/60 transition-colors
                      placeholder:text-gray-400"
                    placeholder="https://your-project.com"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-violet-700">
                    LIVE URL
                  </div>
                </div>
                <div className="relative group flex-1">
                  <Input
                    type="url"
                    value={project.github_url || ''}
                    onChange={(e) => updateProject(index, 'github_url', e.target.value)}
                    className="bg-white/50 border-gray-200 rounded-lg
                      focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20
                      hover:border-violet-500/30 hover:bg-white/60 transition-colors
                      placeholder:text-gray-400"
                    placeholder="https://github.com/username/project"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-violet-700">
                    GITHUB URL
                  </div>
                </div>
              </div>

              {/* Technologies */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <Label className="text-sm font-medium text-violet-700">Technologies & Tools Used</Label>
                  <span className="text-[10px] text-gray-500">Separate with commas</span>
                </div>
                <Input
                  value={project.technologies?.join(', ')}
                  onChange={(e) => updateProject(index, 'technologies', 
                    e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  )}
                  placeholder="React, TypeScript, Node.js, etc."
                  className="bg-white/50 border-gray-200 rounded-lg
                    focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20
                    hover:border-violet-500/30 hover:bg-white/60 transition-colors
                    placeholder:text-gray-400"
                />
              </div>

              {/* Dates Row */}
              <div className="flex items-center gap-3 text-gray-600">
                <div className="relative group">
                  <Input
                    type="date"
                    value={project.start_date}
                    onChange={(e) => updateProject(index, 'start_date', e.target.value)}
                    className="w-auto bg-white/50 border-gray-200 rounded-lg
                      focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20
                      hover:border-violet-500/30 hover:bg-white/60 transition-colors"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-violet-700">
                    START DATE
                  </div>
                </div>
                <span>-</span>
                <div className="relative group">
                  <Input
                    type="date"
                    value={project.end_date || ''}
                    onChange={(e) => updateProject(index, 'end_date', e.target.value)}
                    className="w-auto bg-white/50 border-gray-200 rounded-lg
                      focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20
                      hover:border-violet-500/30 hover:bg-white/60 transition-colors"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[10px] font-medium text-violet-700">
                    END DATE
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <Label className="text-sm font-medium text-violet-700">Description</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updated = [...projects];
                      updated[index].description = [...updated[index].description, ""];
                      onChange(updated);
                    }}
                    className="text-violet-600 hover:text-violet-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Point
                  </Button>
                </div>
                <div className="space-y-3">
                  {project.description.map((desc, descIndex) => (
                    <div key={descIndex} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <Input
                          value={desc}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[index].description[descIndex] = e.target.value;
                            onChange(updated);
                          }}
                          placeholder="Describe a key feature or achievement"
                          className="bg-white/50 border-gray-200 rounded-lg
                            focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20
                            hover:border-violet-500/30 hover:bg-white/60 transition-colors
                            placeholder:text-gray-400"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const updated = [...projects];
                          updated[index].description = updated[index].description.filter((_, i) => i !== descIndex);
                          onChange(updated);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {project.description.length === 0 && (
                    <div className="text-sm text-gray-500 italic">
                      Add points to describe your project's features and achievements
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button 
        variant="outline" 
        className="w-full bg-gradient-to-r from-violet-500/5 via-violet-500/10 to-purple-500/5 hover:from-violet-500/10 hover:via-violet-500/15 hover:to-purple-500/10 border-dashed border-violet-500/30 hover:border-violet-500/40 text-violet-700 hover:text-violet-800 transition-all duration-300"
        onClick={addProject}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Project
      </Button>
    </div>
  );
} 