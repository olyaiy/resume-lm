'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Loader2 } from "lucide-react";
import { AuthProvider } from "./auth-context";
import { signInWithGithub } from "@/app/auth/login/actions";
import { Separator } from "@/components/ui/separator";

const gradientClasses = {
  base: "bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600",
  hover: "hover:from-violet-500 hover:via-blue-500 hover:to-violet-500",
  shadow: "shadow-lg shadow-violet-500/25",
  animation: "transition-all duration-500 animate-gradient-x",
};

interface TabButtonProps {
  value: "login" | "signup";
  children: React.ReactNode;
}

interface AuthDialogProps {
  children?: React.ReactNode;
}

function TabButton({ value, children }: TabButtonProps) {
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

  const handleGithubSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithGithub();
      
      if (!result.success) {
        console.error('❌ GitHub sign in error:', result.error);
      } else if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('💥 Failed to sign in with GitHub:', error);
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
          <span className="bg-white px-3 text-slate-500">
            or
          </span>
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
    </div>
  );
}

export function AuthDialog({ children }: AuthDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      {/* AUTH DIALOG TRIGGER BUTTON */}
      <DialogTrigger asChild>
        {children || (
          <Button 
            size="lg" 
            className={`${gradientClasses.base} ${gradientClasses.hover} text-white font-semibold 
            text-lg py-6 px-10 ${gradientClasses.animation} group
            shadow-xl shadow-violet-500/30 hover:shadow-violet-500/40
            ring-2 ring-white/20 hover:ring-white/30
            scale-105 hover:scale-110 transition-all duration-300
            rounded-xl relative overflow-hidden`}
            aria-label="Open authentication dialog"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center justify-center">
              Start Now
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent 
        className="
          sm:max-w-[420px] w-full max-h-[85vh] p-0 bg-white border border-slate-200 shadow-xl 
          animate-in fade-in-0 zoom-in-95 duration-200
          rounded-xl overflow-hidden overflow-y-auto
        "
      >
        <AuthProvider>
          {/* Hidden accessibility elements */}
          <DialogTitle className="sr-only">Authentication</DialogTitle>
          <DialogDescription className="sr-only">Sign in or create an account</DialogDescription>

          {/* Content starts immediately with tabs */}
          <div className="px-6 pt-6">
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as "login" | "signup")} 
              className="w-full"
            >
              <TabsList className="
                w-full h-10 bg-violet-50/30 border border-violet-100/50 p-1
                flex gap-0.5 rounded-lg
              ">
                <TabButton value="login">
                  Sign In
                </TabButton>
                <TabButton value="signup">
                  Create Account
                </TabButton>
              </TabsList>

              {/* Forms Content */}
              <div className="mt-5 pb-6">
                <TabsContent value="login" className="mt-0 space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Welcome back</h3>
                    <p className="text-sm text-slate-600 mt-1">Sign in to continue</p>
                  </div>
                  <LoginForm />
                  <SocialAuth />
                </TabsContent>
                
                <TabsContent value="signup" className="mt-0 space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Get started</h3>
                    <p className="text-sm text-slate-600 mt-1">Create your free account</p>
                  </div>
                  <SignupForm />
                  <SocialAuth />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </AuthProvider>
      </DialogContent>
    </Dialog>
  );
} 