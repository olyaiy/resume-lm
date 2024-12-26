'use client';

import { WorkExperience, Project, Profile, Education } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Import } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type ImportItem = WorkExperience | Project | Education;

interface ImportFromProfileDialogProps<T extends ImportItem> {
  profile: Profile;
  onImport: (items: T[]) => void;
  type: 'work_experience' | 'projects' | 'education';
  buttonClassName?: string;
}

export function ImportFromProfileDialog<T extends ImportItem>({ 
  profile, 
  onImport, 
  type,
  buttonClassName 
}: ImportFromProfileDialogProps<T>) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const items = type === 'work_experience' 
    ? profile.work_experience 
    : type === 'projects'
    ? profile.projects
    : profile.education;

  const title = type === 'work_experience' 
    ? 'Work Experience' 
    : type === 'projects'
    ? 'Projects'
    : 'Education';

  const handleImport = () => {
    const itemsToImport = items.filter((item) => {
      const id = getItemId(item);
      return selectedItems.includes(id);
    }) as T[];
    
    onImport(itemsToImport);
    setOpen(false);
    setSelectedItems([]);
  };

  const getItemId = (item: ImportItem): string => {
    if (type === 'work_experience') {
      return (item as WorkExperience).company + (item as WorkExperience).position;
    } else if (type === 'projects') {
      return (item as Project).name;
    } else {
      const edu = item as Education;
      return `${edu.school}-${edu.degree}-${edu.field}`;
    }
  };

  const getItemTitle = (item: ImportItem): string => {
    if (type === 'work_experience') {
      return (item as WorkExperience).position;
    } else if (type === 'projects') {
      return (item as Project).name;
    } else {
      const edu = item as Education;
      return `${edu.degree} in ${edu.field}`;
    }
  };

  const getItemSubtitle = (item: ImportItem): string => {
    if (type === 'work_experience') {
      return (item as WorkExperience).company;
    } else if (type === 'projects') {
      return ((item as Project).technologies || []).join(', ');
    } else {
      return (item as Education).school;
    }
  };

  const getItemDate = (item: ImportItem): string => {
    if (type === 'work_experience') {
      const exp = item as WorkExperience;
      return `${exp.start_date} - ${exp.current ? 'Present' : exp.end_date}`;
    } else if (type === 'projects') {
      const proj = item as Project;
      return proj.start_date ? `${proj.start_date}${proj.end_date ? ` - ${proj.end_date}` : ''}` : '';
    } else {
      const edu = item as Education;
      return `${edu.start_date} - ${edu.current ? 'Present' : edu.end_date}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "mb-6 w-full h-16",
            "bg-gradient-to-r from-teal-500/5 via-teal-500/10 to-cyan-500/5",
            "hover:from-teal-500/10 hover:via-teal-500/15 hover:to-cyan-500/10",
            "border-2 border-dashed border-teal-500/30 hover:border-teal-500/40",
            "text-teal-700 hover:text-teal-800",
            "transition-all duration-300",
            "rounded-xl",
            buttonClassName
          )}
        >
          <Import className="h-5 w-5 mr-2" />
          Import from Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import {title}</DialogTitle>
          <DialogDescription>
            Select the {title.toLowerCase()} you want to import from your profile
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] mt-4">
          <div className="space-y-4">
            {items.map((item) => {
              const id = getItemId(item);
              return (
                <div
                  key={id}
                  className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 bg-white/50 hover:bg-white/80 transition-colors"
                >
                  <Checkbox
                    id={id}
                    checked={selectedItems.includes(id)}
                    onCheckedChange={(checked) => {
                      setSelectedItems(prev =>
                        checked
                          ? [...prev, id]
                          : prev.filter(x => x !== id)
                      );
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <div className="font-semibold text-base mb-1">{getItemTitle(item)}</div>
                      <div className="text-sm text-muted-foreground">{getItemSubtitle(item)}</div>
                      {getItemDate(item) && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {getItemDate(item)}
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedItems.length === 0}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700"
          >
            Import Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 