import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DocumentSettings } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { Check, Save, Trash2, Plus } from "lucide-react";

interface SavedStylesDialogProps {
  currentSettings: DocumentSettings;
  onApplyStyle: (settings: DocumentSettings) => void;
}

interface SavedStyle {
  name: string;
  settings: DocumentSettings;
  timestamp: number;
}

export function SavedStylesDialog({ currentSettings, onApplyStyle }: SavedStylesDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedStyles, setSavedStyles] = useState<SavedStyle[]>([]);
  const [newStyleName, setNewStyleName] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Load saved styles from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("resumelm-saved-styles");
    if (saved) {
      setSavedStyles(JSON.parse(saved));
    }
  }, []);

  // Save current settings with name
  const handleSaveStyle = () => {
    if (!newStyleName.trim()) return;

    const newStyle: SavedStyle = {
      name: newStyleName,
      settings: currentSettings,
      timestamp: Date.now(),
    };

    const updatedStyles = [...savedStyles, newStyle];
    setSavedStyles(updatedStyles);
    localStorage.setItem("resumelm-saved-styles", JSON.stringify(updatedStyles));
    setNewStyleName("");
    setIsAddingNew(false);
  };

  // Delete a saved style
  const handleDeleteStyle = (timestamp: number) => {
    const updatedStyles = savedStyles.filter((style) => style.timestamp !== timestamp);
    setSavedStyles(updatedStyles);
    localStorage.setItem("resumelm-saved-styles", JSON.stringify(updatedStyles));
  };

  // Apply a saved style
  const handleApplyStyle = (settings: DocumentSettings) => {
    onApplyStyle(settings);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs text-muted-foreground hover:text-teal-600 border-slate-400 hover:border-teal-600 transition-colors w-full"
        >
          <Save className="w-3 h-3 mr-1" />
          Saved Styles
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Saved Document Styles</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingNew(true)}
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Save Current
            </Button>
          </div>
          <DialogDescription>
            Save current document settings or apply saved styles to your resume.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isAddingNew && (
            <div className="flex items-center gap-2 bg-slate-50/50 p-3 rounded-lg border border-slate-200/50">
              <Input
                placeholder="Enter style name..."
                value={newStyleName}
                onChange={(e) => setNewStyleName(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button
                onClick={handleSaveStyle}
                disabled={!newStyleName.trim()}
                size="sm"
                className="whitespace-nowrap"
              >
                Save Style
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingNew(false);
                  setNewStyleName("");
                }}
              >
                Cancel
              </Button>
            </div>
          )}
          <div className={isAddingNew ? "" : "border-t border-slate-200/50 pt-4"}>
            <Label className="text-sm font-medium mb-2 block">Saved Styles</Label>
            <ScrollArea className="h-[200px] rounded-md border border-slate-200/50">
              <div className="p-4 space-y-2">
                {savedStyles.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No saved styles yet
                  </p>
                ) : (
                  savedStyles.map((style) => (
                    <div
                      key={style.timestamp}
                      className="flex items-center justify-between group rounded-lg border border-slate-200/50 p-2 hover:bg-slate-50/50"
                    >
                      <span className="text-sm font-medium">{style.name}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApplyStyle(style.settings)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Apply Style"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStyle(style.timestamp)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
                          title="Delete Style"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 