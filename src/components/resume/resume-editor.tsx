'use client';

import { Resume } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";
import { ChangeEvent } from "react";
import { Textarea } from "../ui/textarea";

interface ResumeEditorProps {
  resume: Resume;
  onChange: (resume: Resume) => void;
}

export function ResumeEditor({ resume, onChange }: ResumeEditorProps) {
  const handleBasicInfoChange = (field: keyof Resume, value: string) => {
    onChange({ ...resume, [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={resume.first_name || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => 
                  handleBasicInfoChange('first_name', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={resume.last_name || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => 
                  handleBasicInfoChange('last_name', e.target.value)
                }
              />
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={resume.email || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => 
                handleBasicInfoChange('email', e.target.value)
              }
            />
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="summary">Professional Summary</Label>
            <Textarea
              id="summary"
              value={resume.professional_summary || ''}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => 
                handleBasicInfoChange('professional_summary', e.target.value)
              }
              className="h-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add more sections for work experience, education, skills, etc. */}
    </div>
  );
} 