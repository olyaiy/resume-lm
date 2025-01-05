'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useState, useEffect } from "react";

interface WelcomeDialogProps {
  isOpen: boolean;
}

export function WelcomeDialog({ isOpen: initialIsOpen }: WelcomeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Set initial state when the prop changes
  useEffect(() => {
    setIsOpen(initialIsOpen);
  }, [initialIsOpen]);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={setIsOpen}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Welcome to ResumeLM! 🎉
          </DialogTitle>
        </DialogHeader>
        
        <div className="pt-4 space-y-4">
          <h3 className="font-medium text-foreground">Here&apos;s how to get started:</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-0.5">Fill out your profile with your work experience, education, and skills</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">Create base resumes for different types of roles you&apos;re interested in</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">Use your base resumes to create tailored versions for specific job applications</span>
            </li>
          </ol>
          <div className="pt-2 space-y-2">
            <Link href="/profile">
              <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                Start by Filling Your Profile
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              I&apos;ll do this later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 