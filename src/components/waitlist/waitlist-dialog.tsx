'use client';

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Sparkles, Mail, User } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const gradientClasses = {
  base: "bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600",
  hover: "hover:from-violet-500 hover:via-blue-500 hover:to-violet-500",
  shadow: "shadow-lg shadow-violet-500/25",
  animation: "transition-all duration-500 animate-gradient-x",
};

export function WaitlistDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className={`${gradientClasses.base} ${gradientClasses.hover} ${gradientClasses.shadow} px-8 ${gradientClasses.animation} group`}
        >
          Join the Waitlist
          <ArrowRight className="ml-2.5 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </DialogTrigger>

      <DialogContent 
        className="sm:max-w-[500px] p-0 bg-white/95 border-white/40 shadow-2xl animate-in fade-in-0 zoom-in-95"
      >
        <div className="px-8 pt-8 pb-0 text-center relative">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-violet-600/5 via-blue-600/5 to-violet-600/5 blur-2xl" />
          <div className="relative">
            <div className="inline-flex items-center justify-center space-x-2 mb-3">
              <Sparkles className="w-5 h-5 text-violet-500" aria-hidden="true" />
              <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Early Access Waitlist
              </span>
            </div>
            <DialogTitle className="text-center">
              <Logo className="text-4xl mb-3" asLink={false} />
            </DialogTitle>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Join our waitlist to be among the first to experience our AI-powered resume builder 
              and receive exclusive early access benefits.
            </p>
          </div>
        </div>

        <div className="p-8 relative">
          {/* Decorative background elements */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-violet-100/20 via-transparent to-blue-100/20 rounded-b-lg"
            aria-hidden="true"
          />
          
          {/* Form */}
          <form className="relative z-20 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    id="firstName"
                    placeholder="John"
                    className="pl-9 bg-white/60 border-white/40 focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    className="pl-9 bg-white/60 border-white/40 focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-9 bg-white/60 border-white/40 focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <Button 
              type="submit"
              className={`w-full ${gradientClasses.base} ${gradientClasses.hover} ${gradientClasses.shadow} ${gradientClasses.animation} group h-11`}
            >
              Join Waitlist
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>

            <div className="space-y-3 text-center">
              <p className="text-xs text-muted-foreground">
                We&apos;ll notify you when we launch. No spam, just updates!
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
                <span className="text-xs text-muted-foreground/50">Early Access Benefits</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
              </div>
              <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center">
                  <Sparkles className="mr-1.5 w-3 h-3 text-violet-500" />
                  Priority Access
                </span>
                <span className="flex items-center">
                  <Sparkles className="mr-1.5 w-3 h-3 text-blue-500" />
                  Extended Trial
                </span>
                <span className="flex items-center">
                  <Sparkles className="mr-1.5 w-3 h-3 text-violet-500" />
                  Special Pricing
                </span>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 