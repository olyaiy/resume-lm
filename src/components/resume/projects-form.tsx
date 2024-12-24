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
      description: "",
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
        <Card key={index} className="bg-white/40 backdrop-blur-md border-white/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Project {index + 1}</CardTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => removeProject(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input
                value={project.name}
                onChange={(e) => updateProject(index, 'name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={project.description}
                onChange={(e) => updateProject(index, 'description', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={project.start_date}
                  onChange={(e) => updateProject(index, 'start_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={project.end_date || ''}
                  onChange={(e) => updateProject(index, 'end_date', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Technologies Used</Label>
              <Input
                value={project.technologies.join(', ')}
                onChange={(e) => updateProject(index, 'technologies', 
                  e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                )}
                placeholder="Comma-separated technologies"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Live URL</Label>
                <Input
                  type="url"
                  value={project.url || ''}
                  onChange={(e) => updateProject(index, 'url', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>GitHub URL</Label>
                <Input
                  type="url"
                  value={project.github_url || ''}
                  onChange={(e) => updateProject(index, 'github_url', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Key Highlights</Label>
              <Textarea
                value={project.highlights.join('\n')}
                onChange={(e) => updateProject(index, 'highlights', 
                  e.target.value.split('\n').filter(Boolean)
                )}
                placeholder="Enter each highlight on a new line"
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>
      ))}
      <Button 
        variant="outline" 
        className="w-full"
        onClick={addProject}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Project
      </Button>
    </div>
  );
} 