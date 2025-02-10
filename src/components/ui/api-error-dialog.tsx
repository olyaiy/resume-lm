'use client';

import { AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ApiErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorMessage: { title: string; description: string };
  onUpgrade: () => void;
  onSettings: () => void;
}

export function ApiErrorDialog({ 
  open, 
  onOpenChange,
  errorMessage,
  onUpgrade,
  onSettings
}: ApiErrorDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn(
        "bg-white/95 backdrop-blur-xl",
        "border-2 border-red-200/40",
        "p-0 gap-0 pb-8"
      )}>
        <div className={cn(
          "flex flex-col items-center gap-4 p-6",
          "text-red-500 text-center"
        )}>
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-red-50">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-red-600 text-lg">
              {errorMessage.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              {errorMessage.description}
            </AlertDialogDescription>
          </div>

          <div className="w-full h-px bg-red-100" />
          
          <div className="text-sm text-red-400 mb-2">
            Unlock premium features and advanced AI capabilities
          </div>
          
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="relative group w-full">
              <div className="absolute -inset-[3px] bg-gradient-to-r from-amber-500/0 via-orange-500/0 to-red-500/0 rounded-lg opacity-75 blur-md group-hover:from-amber-500/50 group-hover:via-orange-500/50 group-hover:to-red-500/50 transition-all duration-300 ease-in-out" />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-orange-400/0 to-red-400/0 rounded-lg opacity-100 group-hover:via-orange-400/10 transition-all duration-300 ease-in-out" />
              
              <Button
                onClick={onUpgrade}
                className={cn(
                  "relative w-full",
                  "bg-gradient-to-r from-amber-500 to-orange-500",
                  "hover:from-amber-500 hover:via-orange-500 hover:to-red-500",
                  "text-white font-medium",
                  "shadow-lg hover:shadow-xl hover:shadow-orange-500/20",
                  "transition-all duration-300 ease-in-out",
                  "hover:-translate-y-0.5",
                  "flex items-center justify-center gap-1.5"
                )}
              >
                <Sparkles className="h-4 w-4 transition-transform duration-300 ease-in-out group-hover:scale-110" />
                <span className="transition-all duration-300 ease-in-out group-hover:translate-x-0.5">
                  Upgrade to Pro
                </span>
              </Button>
            </div>
            
            <Button
              variant="outline"
              onClick={onSettings}
              className={cn(
                "w-full",
                "text-xs text-gray-500 hover:text-gray-600",
                "hover:bg-gray-50/50",
                "border border-gray-200",
                "h-8",
                "transition-all duration-300",
                "hover:-translate-y-0.5",
                "hover:shadow-sm"
              )}
            >
              Set API Keys
            </Button>
          </div>

          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className={cn(
                " text-xs text-gray-700 hover:text-gray-900",
                "h-7 px-2",
                "hover:bg-gray-50/50",
                "transition-colors duration-200 border border-gray-500 bg-gray-200" 
              )}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
} 