'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Sparkles, Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";
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
        relative flex-1 h-12 px-6 text-sm font-medium rounded-xl
        transition-all duration-300 ease-out
        data-[state=inactive]:text-slate-600 data-[state=inactive]:bg-transparent
        data-[state=active]:text-white data-[state=active]:bg-gradient-to-r 
        data-[state=active]:from-violet-600 data-[state=active]:to-blue-600
        data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-100/60
        border-0 shadow-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2
        data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/25
      "
    >
      <span className="relative z-10 font-semibold">{children}</span>
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
    <div className="space-y-4 mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="bg-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-slate-500 font-medium">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        className="
          w-full h-12 bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300
          text-slate-700 font-medium transition-all duration-200
          focus:ring-2 focus:ring-violet-500 focus:ring-offset-2
          rounded-xl
        "
        onClick={handleGithubSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Github className="mr-2 h-5 w-5" />
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
          sm:max-w-[580px] w-full max-h-[80vh] p-0 bg-white border border-slate-200/80 shadow-2xl 
          animate-in fade-in-0 zoom-in-95 duration-200
          rounded-2xl overflow-hidden overflow-y-auto
        "
      >
        <AuthProvider>
          {/* Header Section */}
          <div className="px-8 py-4 border-b border-slate-100/80 bg-gradient-to-br from-slate-50/50 to-white">
            <DialogTitle className="sr-only">Authentication</DialogTitle>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-100">
                  <Sparkles className="w-4 h-4 text-violet-600" aria-hidden="true" />
                </div>
                <div className="flex flex-col">
                  <Logo className="text-lg text-slate-900" asLink={false} />
                  <span className="text-xs font-medium text-slate-500">AI Resume Builder</span>
                </div>
              </div>
              <DialogDescription className="text-sm text-slate-600 leading-snug">
                Create professional resumes with AI
              </DialogDescription>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="px-8 pt-6">
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as "login" | "signup")} 
              className="w-full"
            >
              <TabsList className="
                w-full h-14 bg-slate-100/80 border-0 p-2
                flex gap-2 rounded-2xl backdrop-blur-sm
              ">
                <TabButton value="login">
                  Sign In
                </TabButton>
                <TabButton value="signup">
                  Create Account
                </TabButton>
              </TabsList>

              {/* Forms Content */}
              <div className="mt-6 pb-8">
                <TabsContent value="login" className="mt-0 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Welcome back</h3>
                    <p className="text-sm text-slate-600 mb-6">Sign in to your account to continue</p>
                    <LoginForm />
                  </div>
                  <SocialAuth />
                </TabsContent>
                
                <TabsContent value="signup" className="mt-0 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Get started for free</h3>
                    <p className="text-sm text-slate-600 mb-6">Create your account and build your first resume</p>
                    <SignupForm />
                  </div>
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