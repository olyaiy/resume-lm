'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { Logo } from "@/components/ui/logo";

export function AuthDialog() {
  const [open, setOpen] = useState(false);

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
          <Logo className="text-3xl mb-2" asLink={false} />
          <p className="text-muted-foreground text-sm">
            Please Sign In or Sign Up to start your journey towards landing your dream job. 
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full relative mt-6">
          <TabsList className="w-full h-16 bg-gradient-to-r from-white/30 via-white/40 to-white/30 border-b border-white/40 p-2 grid grid-cols-2 gap-3">
            <TabsTrigger 
              value="login"
              className="relative overflow-hidden rounded-xl text-sm font-medium transition-all duration-500
                data-[state=inactive]:text-muted-foreground/70
                data-[state=active]:text-violet-600
                data-[state=active]:bg-gradient-to-br
                data-[state=active]:from-white/80
                data-[state=active]:to-white/60
                data-[state=active]:shadow-lg
                data-[state=active]:shadow-violet-500/10
                data-[state=active]:border
                data-[state=active]:border-violet-200/50
                data-[state=inactive]:hover:bg-white/50
                data-[state=inactive]:hover:text-violet-600
                group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-blue-500/5 to-violet-500/5 opacity-0 data-[state=active]:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 opacity-0 group-data-[state=active]:opacity-100 transition-all duration-500 group-data-[state=active]:scale-100 scale-0" />
                <span>Sign In</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="relative overflow-hidden rounded-xl text-sm font-medium transition-all duration-500
                data-[state=inactive]:text-muted-foreground/70
                data-[state=active]:text-blue-600
                data-[state=active]:bg-gradient-to-br
                data-[state=active]:from-white/80
                data-[state=active]:to-white/60
                data-[state=active]:shadow-lg
                data-[state=active]:shadow-blue-500/10
                data-[state=active]:border
                data-[state=active]:border-blue-200/50
                data-[state=inactive]:hover:bg-white/50
                data-[state=inactive]:hover:text-blue-600
                group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-violet-500/5 to-blue-500/5 opacity-0 data-[state=active]:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-data-[state=active]:opacity-100 transition-all duration-500 group-data-[state=active]:scale-100 scale-0" />
                <span>Sign Up</span>
              </div>
            </TabsTrigger>
          </TabsList>
          <div className="p-8 relative">
            <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-gradient-to-br from-violet-200/20 via-blue-200/20 to-violet-200/20 rounded-full blur-3xl -z-10 animate-pulse duration-[4000ms]" />
            <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-gradient-to-br from-blue-200/20 via-violet-200/20 to-blue-200/20 rounded-full blur-3xl -z-10 animate-pulse duration-[5000ms]" />
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="signup">
              <SignupForm />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 