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
          className="text-xs bg-white/80 hover:bg-gradient-to-r from-teal-500/10 to-cyan-500/10 
          border-teal-600 hover:border-teal-800 text-teal-700 hover:text-teal-800 
          backdrop-blur-sm transition-all duration-500 hover:-translate-y-[1px] w-full 
          shadow-sm hover:shadow-md"
        >
          <Save className="w-3 h-3 mr-1" />
          Saved Styles
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-b from-white/95 to-white/90 
        backdrop-blur-2xl border-white/60 shadow-2xl pt-12">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl bg-gradient-to-r from-teal-700 to-cyan-700 
              bg-clip-text text-transparent font-semibold">
              Saved Document Styles
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingNew(true)}
              className="text-xs bg-gradient-to-r hover:from-teal-500/10 hover:to-cyan-500/10 
                border-teal-600/40 hover:border-teal-600 text-teal-700 hover:text-teal-800
                transition-all duration-500 hover:-translate-y-[1px]"
            >
              <Plus className="w-3 h-3 mr-1" />
              Save Current
            </Button>
          </div>
          <DialogDescription className="text-slate-600">
            Save current document settings or apply saved styles to your resume.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isAddingNew && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-teal-50/50 to-cyan-50/50 
              p-4 rounded-xl border border-teal-200/30 shadow-sm">
              <Input
                placeholder="Enter style name..."
                value={newStyleName}
                onChange={(e) => setNewStyleName(e.target.value)}
                className="flex-1 border-teal-200/40 focus:border-teal-400 bg-white/80"
                autoFocus
              />
              <Button
                onClick={handleSaveStyle}
                disabled={!newStyleName.trim()}
                size="sm"
                className="whitespace-nowrap bg-gradient-to-r from-teal-600 to-cyan-600 
                  text-white hover:from-teal-700 hover:to-cyan-700 transition-all 
                  duration-500 hover:-translate-y-[1px] shadow-sm hover:shadow-md"
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
                className="text-slate-600 hover:text-slate-800"
              >
                Cancel
              </Button>
            </div>
          )}
          <div className={isAddingNew ? "" : "border-t border-teal-100 pt-4"}>
            <Label className="text-sm font-medium mb-2 block text-slate-700">Saved Styles</Label>
            <ScrollArea className="h-[300px] rounded-xl border border-teal-200/30 bg-gradient-to-b 
              from-white/50 to-white/30 backdrop-blur-sm">
              <div className="p-4 space-y-3">
                {savedStyles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <Save className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No saved styles yet</p>
                  </div>
                ) : (
                  savedStyles.map((style) => (
                    <div
                      key={style.timestamp}
                      className="flex items-center justify-between group rounded-xl border 
                        border-teal-600 p-3 hover:bg-gradient-to-r hover:from-teal-50/50 
                        hover:to-cyan-50/50 transition-all duration-500 hover:-translate-y-[1px] 
                        hover:shadow-sm"
                    >
                      <span className="text-sm font-medium text-slate-700">{style.name}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApplyStyle(style.settings)}
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300 
                            text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                          title="Apply Style"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStyle(style.timestamp)}
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300 
                            text-rose-500 hover:text-rose-600 hover:bg-rose-50"
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
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="border-teal-200/40 hover:border-teal-400 text-teal-700 
              hover:text-teal-800 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 
              transition-all duration-500 hover:-translate-y-[1px]"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 