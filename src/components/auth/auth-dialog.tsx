'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

export function AuthDialog() {
  const [open, setOpen] = useState(false);

  const switchTab = (tab: 'login' | 'signup') => {
    const element = document.querySelector(`[value="${tab}"]`) as HTMLButtonElement;
    element?.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" 
          className="bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 hover:from-violet-500 hover:via-blue-500 hover:to-violet-500 shadow-lg shadow-violet-500/25 px-8 transition-all duration-500 animate-gradient-x group"
        >
          Customize Now
          <ArrowRight className="ml-2.5 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 bg-white/95 backdrop-blur-xl border-white/40 shadow-2xl animate-in fade-in-0 zoom-in-95">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/60 via-blue-50/60 to-indigo-50/60 rounded-lg opacity-50" />
        <VisuallyHidden>
          <DialogTitle>Authentication</DialogTitle>
        </VisuallyHidden>
        
        {/* Header Content */}
        <div className="px-8 pt-8 text-center relative">
          <div className="inline-flex items-center justify-center space-x-2 mb-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              AI-Powered Resume Builder
            </span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">
            Welcome to ResumeLM
          </h2>
          <p className="text-muted-foreground text-sm">
            Join thousands of job seekers who&apos;ve landed their dream jobs with our AI-powered resume builder.
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full relative mt-6">
          <TabsList className="w-full h-14 bg-white/50 border-b border-white/40 rounded-t-lg grid grid-cols-2 p-1">
            <TabsTrigger 
              value="login"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/10 data-[state=active]:via-blue-500/10 data-[state=active]:to-violet-500/10 rounded-md transition-all duration-500"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/10 data-[state=active]:via-blue-500/10 data-[state=active]:to-violet-500/10 rounded-md transition-all duration-500"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          <div className="p-8 relative">
            <div className="absolute top-1/2 left-1/4 w-[200px] h-[200px] bg-gradient-to-r from-violet-200/20 to-blue-200/20 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-1/3 right-1/4 w-[150px] h-[150px] bg-gradient-to-r from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl -z-10" />
            <TabsContent value="login">
              <LoginForm />
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <button onClick={() => switchTab('signup')} className="text-violet-600 hover:text-violet-500 font-medium">
                    Create one now
                  </button>
                </p>
              </div>
            </TabsContent>
            <TabsContent value="signup">
              <SignupForm />
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button onClick={() => switchTab('login')} className="text-violet-600 hover:text-violet-500 font-medium">
                    Sign in instead
                  </button>
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 