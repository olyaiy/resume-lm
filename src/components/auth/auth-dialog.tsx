'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

export function AuthDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" 
          className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/25 px-8">
          Customize Now
          <ArrowRight className="ml-2.5 w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 bg-white/95 backdrop-blur-xl border-white/40">
        <VisuallyHidden>
          <DialogTitle>Authentication</DialogTitle>
        </VisuallyHidden>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="w-full h-14 bg-white/50 border-b border-white/40 rounded-t-lg grid grid-cols-2 p-1">
            <TabsTrigger 
              value="login"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/10 data-[state=active]:to-indigo-500/10 rounded-md transition-all"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/10 data-[state=active]:to-indigo-500/10 rounded-md transition-all"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          <div className="p-6">
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