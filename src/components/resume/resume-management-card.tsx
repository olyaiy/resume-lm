import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateResumeDialog } from "./create-resume-dialog";
import { ResumeList } from "./resume-list";
import { Resume } from "@/lib/types";

interface ResumeManagementCardProps {
  type: 'base' | 'tailored';
  resumes: Resume[];
  baseResumes?: Resume[];
  icon: React.ReactNode;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  gradientFrom: string;
  gradientTo: string;
  accentColor: {
    bg: string;
    border: string;
    hover: string;
    text: string;
  };
}

export function ResumeManagementCard({
  type,
  resumes,
  baseResumes,
  icon,
  title,
  description,
  emptyTitle,
  emptyDescription,
  gradientFrom,
  gradientTo,
  accentColor,
}: ResumeManagementCardProps) {
  return (
    <Card className="overflow-hidden border-white/40 shadow-xl backdrop-blur-xl hover:shadow-2xl transition-all duration-300">
      <div className={`p-6 border-b bg-gradient-to-r from-${gradientFrom}/10 to-${gradientTo}/10`}>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className={`text-xl font-semibold bg-gradient-to-r from-${gradientFrom} to-${gradientTo} bg-clip-text text-transparent flex items-center gap-2`}>
              {icon}
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {description} ({resumes.length})
            </p>
          </div>
          <CreateResumeDialog type={type} baseResumes={type === 'tailored' ? baseResumes : undefined}>
            <Button 
              variant="outline" 
              className={`bg-white/50 border-${accentColor.border} hover:border-${accentColor.hover} hover:bg-white/60`}
              disabled={type === 'tailored' && (!baseResumes || baseResumes.length === 0)}
            >
              <Plus className={`h-4 w-4 mr-2 text-${accentColor.text}`} />
              New {type === 'base' ? 'Template' : 'Resume'}
            </Button>
          </CreateResumeDialog>
        </div>
      </div>
      <div className="p-4">
        <ResumeList 
          resumes={resumes}
          title={title}
          emptyMessage={
            <div className="text-center py-8">
              <div className={`bg-${accentColor.bg} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                {icon}
              </div>
              <h3 className="font-medium text-gray-900 mb-1">{emptyTitle}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {emptyDescription}
              </p>
              <CreateResumeDialog type={type} baseResumes={type === 'tailored' ? baseResumes : undefined}>
                <Button 
                  variant="outline" 
                  className={`bg-white/50 border-${accentColor.border} hover:border-${accentColor.hover} hover:bg-white/60`}
                  disabled={type === 'tailored' && (!baseResumes || baseResumes.length === 0)}
                >
                  <Plus className={`h-4 w-4 mr-2 text-${accentColor.text}`} />
                  Create First {type === 'base' ? 'Resume' : 'Tailored Resume'}
                </Button>
              </CreateResumeDialog>
            </div>
          }
        />
      </div>
    </Card>
  );
} 