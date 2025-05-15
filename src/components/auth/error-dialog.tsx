'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface ErrorDialogProps {
  isOpen: boolean;
}

export function ErrorDialog({ isOpen: initialIsOpen }: ErrorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsOpen(initialIsOpen);
  }, [initialIsOpen]);

  const errorMessage = isOpen ? (
    searchParams.get('error') === 'auth_code_missing' 
      ? 'We couldn\'t complete your sign-in. Please try again.' 
      : 'There was an issue with your email confirmation. Please check your inbox and try again.'
  ) : null;

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={setIsOpen}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto rounded-full w-12 h-12 bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <DialogTitle className="text-center text-2xl font-semibold text-red-600">
            Authentication Error
          </DialogTitle>
          <DialogDescription>{errorMessage}</DialogDescription>
        </DialogHeader>
        
        <div className="pt-4 space-y-4">
          <p className="text-center text-muted-foreground">
            There was an error confirming your email address. This could be because:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>The confirmation link has expired</li>
            <li>The link was already used</li>
            <li>The link is invalid</li>
          </ul>
          <div className="pt-4 space-y-2">
            <Link href="/">
              <Button className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white">
                Try Logging In Again
              </Button>
            </Link>
            <Link href="https://x.com/alexfromvan" target="_blank" rel="noopener noreferrer">
              <Button 
                variant="outline" 
                className="w-full"
              >
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 