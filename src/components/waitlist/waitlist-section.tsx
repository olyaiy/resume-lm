'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, Mail, User, CheckCircle2, XCircle } from "lucide-react";
import { joinWaitlist } from "@/app/auth/login/actions";
import { useState } from "react";

const gradientClasses = {
  base: "bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600",
  hover: "hover:from-violet-500 hover:via-blue-500 hover:to-violet-500",
  shadow: "shadow-lg shadow-violet-500/25",
  animation: "transition-all duration-500 animate-gradient-x",
};

export function WaitlistSection() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const formData = new FormData(e.currentTarget);
      
      // Log form data
      const formDataObj = {
        email: formData.get('email'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
      };
      console.log('Submitting form with data:', formDataObj);

      const result = await joinWaitlist(formData);
      console.log('Received result from server:', result);

      if (result.success) {
        console.log('Successfully joined waitlist');
        setStatus('success');
        (e.target as HTMLFormElement).reset();
      } else {
        console.error('Failed to join waitlist:', result.error);
        setStatus('error');
        setErrorMessage(result.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  }

  if (status === 'success') {
    return (
      <section className="relative w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100/20 via-transparent to-blue-100/20 rounded-xl" />
        <div className="absolute inset-0 backdrop-blur-xl bg-white/40 rounded-xl border border-white/40 shadow-lg" />
        <div className="relative z-10 p-8 flex flex-col items-center justify-center text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
          <h3 className="text-xl font-semibold">Thank you for joining!</h3>
          <p className="text-muted-foreground">We&apos;ll notify you when ResumeLM launches.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-100/20 via-transparent to-blue-100/20 rounded-xl" />
      <div className="absolute inset-0 backdrop-blur-xl bg-white/40 rounded-xl border border-white/40 shadow-lg" />
      
      {/* Content */}
      <div className="relative z-10 p-5">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-violet-500" aria-hidden="true" />
            <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              Early Access Waitlist
            </span>
          </div>
          <h2 className="text-xl font-bold mb-2">Join the ResumeLM Waitlist</h2>
          <p className="text-muted-foreground text-sm">
            Be among the first to experience our AI-powered resume builder
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="First Name"
                  required
                  className="pl-8 h-9 bg-white/60 border-white/40 focus:border-violet-500 transition-colors"
                />
              </div>
            </div>
            
            <div>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Last Name"
                  required
                  className="pl-8 h-9 bg-white/60 border-white/40 focus:border-violet-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="relative">
              <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email Address"
                required
                className="pl-8 h-9 bg-white/60 border-white/40 focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <XCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Button 
            type="submit"
            disabled={status === 'loading'}
            className={`w-full ${gradientClasses.base} ${gradientClasses.hover} ${gradientClasses.shadow} ${gradientClasses.animation} group h-9`}
          >
            {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>

          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
              <span className="text-xs text-muted-foreground/50">Benefits</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
            </div>
            <div className="flex justify-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center">
                <Sparkles className="mr-1 w-3 h-3 text-violet-500" />
                Priority Access
              </span>
              <span className="flex items-center">
                <Sparkles className="mr-1 w-3 h-3 text-blue-500" />
                Extended Trial
              </span>
              <span className="flex items-center">
                <Sparkles className="mr-1 w-3 h-3 text-violet-500" />
                Special Pricing
              </span>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
} 