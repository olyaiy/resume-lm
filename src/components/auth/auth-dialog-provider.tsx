'use client';

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import { Github, Loader2 } from "lucide-react";

import { signInWithGithub } from "@/app/auth/login/actions";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type AuthTab = "login" | "signup";

interface AuthDialogContextValue {
  openDialog: (tab?: AuthTab) => void;
}

const AuthDialogContext = createContext<AuthDialogContextValue | undefined>(undefined);

function TabButton({ value, children }: { value: AuthTab; children: React.ReactNode }) {
  return (
    <TabsTrigger
      value={value}
      className="
        relative flex-1 h-8 px-3 text-sm font-medium rounded-md
        transition-all duration-200 ease-out
        data-[state=inactive]:text-slate-600 data-[state=inactive]:bg-transparent
        data-[state=active]:text-violet-700 data-[state=active]:bg-violet-50 data-[state=active]:shadow-sm
        data-[state=inactive]:hover:text-violet-600 data-[state=inactive]:hover:bg-violet-50/50
        border-0 shadow-none
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-400 focus-visible:ring-offset-0
      "
    >
      {children}
    </TabsTrigger>
  );
}

function SocialAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleGithubSignIn = async () => {
    setErrorMessage(undefined);

    try {
      setIsLoading(true);
      const result = await signInWithGithub();

      if (!result.success) {
        const message = result.error || "Failed to sign in with GitHub.";
        setErrorMessage(message);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
        return;
      }

      setErrorMessage("Failed to start GitHub sign in.");
    } catch (error) {
      console.error("Failed to sign in with GitHub:", error);
      setErrorMessage("Failed to start GitHub sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3 mt-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="bg-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-slate-500">or</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="
          w-full h-10 bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300
          text-slate-700 font-medium transition-all duration-200
          focus:ring-2 focus:ring-slate-500 focus:ring-offset-1
          rounded-lg
        "
        onClick={handleGithubSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </>
        )}
      </Button>

      {errorMessage && (
        <Alert variant="destructive" className="bg-red-50/50 text-red-900 border-red-200/50" role="alert">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export function AuthDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AuthTab>("signup");
  const [formVersion, setFormVersion] = useState(0);

  const resetDialog = useCallback(() => {
    setActiveTab("signup");
    setFormVersion((version) => version + 1);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    resetDialog();
  }, [resetDialog]);

  const openDialog = useCallback((tab: AuthTab = "signup") => {
    setActiveTab(tab);
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        closeDialog();
        return;
      }

      setOpen(true);
    },
    [closeDialog]
  );

  const handleSignupSuccess = useCallback(() => {
    toast.success("Account created. Check your email to confirm your account.");
    closeDialog();
  }, [closeDialog]);

  const contextValue = useMemo(
    () => ({
      openDialog,
    }),
    [openDialog]
  );

  return (
    <AuthDialogContext.Provider value={contextValue}>
      {children}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="
            sm:max-w-[420px] w-full max-h-[min(85vh,720px)] p-0 bg-white border border-slate-200 shadow-xl
            animate-in fade-in-0 zoom-in-95 duration-200
            rounded-xl overflow-hidden overflow-y-auto
          "
        >
          <DialogTitle className="sr-only">Authentication</DialogTitle>
          <DialogDescription className="sr-only">Sign in or create an account</DialogDescription>

          <div className="px-6 pt-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AuthTab)} className="w-full">
              <TabsList
                className="
                  w-full h-10 bg-violet-50/30 border border-violet-100/50 p-1
                  flex gap-0.5 rounded-lg
                "
              >
                <TabButton value="login">Sign In</TabButton>
                <TabButton value="signup">Create Account</TabButton>
              </TabsList>

              <div className="mt-5 pb-6">
                <TabsContent value="login" className="mt-0 space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Welcome back</h3>
                    <p className="text-sm text-slate-600 mt-1">Sign in to continue</p>
                  </div>
                  <LoginForm key={`login-${formVersion}`} />
                  <SocialAuth />
                </TabsContent>

                <TabsContent value="signup" className="mt-0 space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Get started</h3>
                    <p className="text-sm text-slate-600 mt-1">Create your free account</p>
                  </div>
                  <SignupForm key={`signup-${formVersion}`} onSuccess={handleSignupSuccess} />
                  <SocialAuth />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </AuthDialogContext.Provider>
  );
}

export function useAuthDialog() {
  const context = useContext(AuthDialogContext);
  if (!context) {
    throw new Error("useAuthDialog must be used inside AuthDialogProvider");
  }
  return context;
}
