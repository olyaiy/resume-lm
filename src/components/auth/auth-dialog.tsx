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
  const colors = value === "login" 
    ? { active: "violet", hover: "violet" }
    : { active: "blue", hover: "blue" };

  return (
    <TabsTrigger 
      value={value}
      className={`
        relative overflow-hidden rounded-xl text-sm font-medium transition-all duration-500
        data-[state=inactive]:text-muted-foreground/70
        data-[state=active]:text-${colors.active}-600
        data-[state=active]:bg-gradient-to-br
        data-[state=active]:from-white/80
        data-[state=active]:to-white/60
        data-[state=active]:shadow-lg
        data-[state=active]:shadow-${colors.active}-500/10
        data-[state=active]:border
        data-[state=active]:border-${colors.active}-200/50
        data-[state=inactive]:hover:bg-white/50
        data-[state=inactive]:hover:text-${colors.hover}-600
        group
      `}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-${colors.active}-500/5 via-blue-500/5 to-${colors.active}-500/5 opacity-0 data-[state=active]:opacity-100 transition-opacity duration-500`} />
      <div className="relative z-10 flex items-center justify-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full bg-${colors.active}-500 opacity-0 group-data-[state=active]:opacity-100 transition-all duration-500 group-data-[state=active]:scale-100 scale-0`} />
        {children}
      </div>
    </TabsTrigger>
  );
}

function SocialAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGithubSignIn = async () => {
    console.log('🚀 Starting GitHub sign-in process...');
    try {
      setIsLoading(true);
      console.log('📡 Calling signInWithGithub server action...');
      const result = await signInWithGithub();
      
      console.log('📥 Received result from server action:', result);
      if (!result.success) {
        console.error('❌ GitHub sign in error:', result.error);
      } else if (result.url) {
        console.log('✅ Received OAuth URL:', result.url);
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('💥 Failed to sign in with GitHub:', error);
    } finally {
      setIsLoading(false);
      console.log('🔄 Sign-in process completed');
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/50 px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        className="w-full bg-white/50 hover:bg-white/80"
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
            GitHub
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
        className="sm:max-w-[425px] p-0 bg-white/95 border-white/40 shadow-2xl animate-in fade-in-0 zoom-in-95 z-50 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
      >
        <AuthProvider>
          <DialogTitle className="px-8 pt-8 text-center relative">
            <div className="inline-flex items-center justify-center space-x-2 mb-2">
              <Sparkles className="w-5 h-5 text-violet-500" aria-hidden="true" />
              <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                AI-Powered Resume Builder
              </span>
            </div>
            <Logo className="text-3xl mb-2" asLink={false} />
          </DialogTitle>
          <DialogDescription className="text-center px-8 text-muted-foreground text-sm">
            Please Sign In or Sign Up to start your journey towards landing your dream job. 
          </DialogDescription>

          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as "login" | "signup")} 
            className="w-full relative mt-6"
          >
            <TabsList className="w-full h-16 bg-gradient-to-r from-white/30 via-white/40 to-white/30 border-b border-white/40 p-2 grid grid-cols-2 gap-3">
              <TabButton value="login">Sign In</TabButton>
              <TabButton value="signup">Sign Up</TabButton>
            </TabsList>

            <div className="p-8 relative bg-white/50">
              <div 
                className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-gradient-to-br from-violet-200/5 via-blue-200/5 to-violet-200/5 rounded-full blur-xl -z-10 " 
                aria-hidden="true"
              />
              <div 
                className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-gradient-to-br from-blue-200/5 via-violet-200/5 to-blue-200/5 rounded-full blur-xl -z-10  " 
                aria-hidden="true"
              />
              
              <TabsContent value="login" className="relative z-20">
                <LoginForm />
                <SocialAuth />
              </TabsContent>
              <TabsContent value="signup" className="relative z-20">
                <SignupForm />
                <SocialAuth />
              </TabsContent>
            </div>
          </Tabs>
        </AuthProvider>
      </DialogContent>
    </Dialog>
  );
} 