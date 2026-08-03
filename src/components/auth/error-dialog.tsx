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
import { AUTH_ERROR_CODES } from "@/lib/auth-intent";
import { withUtmParameters } from "@/lib/analytics/attribution";

const trackedSupportUrl = withUtmParameters("https://x.com/alexfromvan", {
  utm_source: "resumelm",
  utm_medium: "social",
  utm_campaign: "auth-error",
});

interface ErrorDialogProps {
  isOpen: boolean;
}

export function ErrorDialog({ isOpen: initialIsOpen }: ErrorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    setIsOpen(initialIsOpen);
  }, [initialIsOpen]);

  const isSignInError = error !== AUTH_ERROR_CODES.emailConfirmation;
  const errorMessage = isOpen
    ? error === AUTH_ERROR_CODES.oauthMissingCode
      ? 'Google did not return an authorization code. Please start sign-in again.'
      : error === AUTH_ERROR_CODES.oauthProviderDenied
        ? 'Google sign-in was cancelled. You can try again whenever you are ready.'
        : error === AUTH_ERROR_CODES.oauthStateMismatch
          ? 'This sign-in session expired or was already used. Please start again.'
          : error === AUTH_ERROR_CODES.oauthProviderError
            ? 'Google could not complete the sign-in request. Please try again.'
            : error === AUTH_ERROR_CODES.oauthExchangeFailed
              ? 'We could not finish your sign-in. Please try again.'
              : 'There was an issue with your email confirmation. Please check your inbox and try again.'
    : null;

  const retryParams = new URLSearchParams();
  const next = searchParams.get('next');
  const plan = searchParams.get('plan');
  if (next) retryParams.set('next', next);
  if (plan) retryParams.set('plan', plan);
  const retryHref = `/auth/login${retryParams.toString() ? `?${retryParams.toString()}` : ''}`;

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
            {isSignInError
              ? 'There was an error completing the authentication flow. This could be because:'
              : 'There was an error confirming your email address. This could be because:'}
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            {isSignInError ? (
              <>
                <li>The sign-in session expired or was already used</li>
                <li>Google sign-in was cancelled or returned an error</li>
                <li>The authorization exchange could not be completed</li>
              </>
            ) : (
              <>
                <li>The confirmation link has expired</li>
                <li>The link was already used</li>
                <li>The link is invalid</li>
              </>
            )}
          </ul>
          <div className="pt-4 space-y-2">
            <Link href={retryHref}>
              <Button className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white">
                Try Logging In Again
              </Button>
            </Link>
            <Link href={trackedSupportUrl} target="_blank" rel="noopener noreferrer" data-analytics-id="outbound-support-x">
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
