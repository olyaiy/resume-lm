import { cn } from "@/lib/utils";
import { Resume } from "@/lib/types";
import { MiniResumePreview } from "../shared/mini-resume-preview";
import { Check, FileText } from "lucide-react";

interface BaseResumeSelectorProps {
  baseResumes: Resume[];
  selectedResumeId: string;
  onResumeSelect: (value: string) => void;
  isInvalid?: boolean;
}

export function BaseResumeSelector({ 
  baseResumes,
  selectedResumeId,
  onResumeSelect,
  isInvalid 
}: BaseResumeSelectorProps) {
  return (
    <div className={cn(
      "space-y-3",
      isInvalid && "animate-pulse"
    )}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {baseResumes?.map((resume) => {
          const isSelected = selectedResumeId === resume.id;
          
          return (
            <div
              key={resume.id}
              onClick={() => onResumeSelect(resume.id)}
              className={cn(
                "relative cursor-pointer group transition-all duration-300",
                "border-2 rounded-xl p-4 bg-white",
                isSelected 
                  ? "border-pink-500 shadow-lg shadow-pink-500/20 bg-pink-50/50" 
                  : "border-gray-200 hover:border-pink-300 hover:shadow-md",
                isInvalid && !isSelected && "border-red-300 bg-red-50/30"
              )}
            >
              {/* Selection indicator */}
              <div className={cn(
                "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200",
                isSelected 
                  ? "bg-pink-500 text-white scale-100" 
                  : "bg-gray-200 text-gray-400 scale-0 group-hover:scale-100"
              )}>
                <Check className="w-3 h-3" />
              </div>

              {/* Resume preview */}
              <div className="mb-3">
                <MiniResumePreview
                  name={resume.name}
                  type="base"
                  createdAt={resume.created_at}
                  className="w-full h-32"
                />
              </div>

              {/* Resume details */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className={cn(
                      "font-medium text-sm truncate",
                      isSelected ? "text-pink-900" : "text-gray-900"
                    )}>
                      {resume.name}
                    </h3>
                    {resume.target_role && (
                      <p className={cn(
                        "text-xs truncate mt-1",
                        isSelected ? "text-pink-700" : "text-gray-600"
                      )}>
                        {resume.target_role}
                      </p>
                    )}
                  </div>
                </div>

                {/* Creation date */}
                <div className={cn(
                  "text-xs",
                  isSelected ? "text-pink-600" : "text-gray-500"
                )}>
                  Created {new Date(resume.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>

              {/* Selection overlay */}
              {isSelected && (
                <div className="absolute inset-0 bg-pink-500/5 rounded-xl pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {isInvalid && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-xs">!</span>
          </div>
          Please select a base resume to continue.
        </div>
      )}
    </div>
  );
} 