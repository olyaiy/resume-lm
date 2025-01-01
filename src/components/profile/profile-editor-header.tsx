import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Save, Trash2, Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProfileEditorHeaderProps {
  isSubmitting: boolean;
  isResetting: boolean;
  onSave: () => Promise<void>;
  onReset: () => Promise<void>;
  hasUnsavedChanges?: boolean;
}

export function ProfileEditorHeader({
  isSubmitting,
  isResetting,
  onSave,
  onReset,
  hasUnsavedChanges = false,
}: ProfileEditorHeaderProps) {
  const router = useRouter();

  return (
    <div className="h-24 border-b border-white/20 bg-gradient-to-r from-white/95 via-white/98 to-white/95 backdrop-blur-xl fixed left-0 right-0 z-40 shadow-lg shadow-black/5">
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff20_0%,#ffffff40_50%,#ffffff20_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-40%,#ffffff30_0%,transparent_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_100%_100%,#ffffff20_0%,transparent_100%)] pointer-events-none" />
      
      {/* Content Container */}
      <div className="max-w-[2000px] mx-auto h-full px-8 flex items-center justify-between relative">
        {/* Left Section */}
        <div className="flex items-center gap-8">
          {hasUnsavedChanges ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div>
                  <Logo className="text-2xl cursor-pointer" asLink={false} />
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                  <AlertDialogDescription>
                    You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => router.push('/')}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Leave
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <div onClick={() => router.push('/')}>
              <Logo className="text-2xl cursor-pointer" asLink={false} />
            </div>
          )}

          {/* Separator with Gradient */}
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-200/50 to-transparent" />

          {/* Profile Title Section with Enhanced Typography */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Profile Editor
                </span>
              </h1>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-violet-50 border border-violet-100">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-xs font-medium text-violet-600">Editing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Save Button */}
          <Button 
            onClick={onSave} 
            disabled={isSubmitting}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-500 shadow-md hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-0.5 h-10 px-5 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,#ffffff20_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving changes...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>

          {/* Reset Profile Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                className="bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 transition-all duration-500 shadow-md hover:shadow-xl hover:shadow-rose-500/20 hover:-translate-y-0.5 h-10 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
                disabled={isResetting}
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,#ffffff20_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Reset Profile
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-xl border-white/40 shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Reset Profile</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground/70">
                  Are you sure you want to reset your profile? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                <AlertDialogCancel 
                  disabled={isResetting}
                  className="bg-white hover:bg-gray-50/80 transition-colors duration-300"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onReset}
                  disabled={isResetting}
                  className="bg-rose-500 text-white hover:bg-rose-600 transition-colors duration-300"
                >
                  {isResetting ? "Resetting..." : "Reset Profile"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
} 