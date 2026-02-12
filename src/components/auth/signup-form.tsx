'use client'

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

import { signupWithState } from "@/app/auth/login/actions";
import { initialAuthFormState } from "@/components/auth/auth-form-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignupFormProps {
  onSuccess?: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 hover:from-violet-500 hover:via-blue-500 hover:to-violet-500 shadow-lg shadow-violet-500/25 transition-all duration-500 animate-gradient-x"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating account...
        </>
      ) : (
        "Create Account"
      )}
    </Button>
  );
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [state, formAction] = useActionState(signupWithState, initialAuthFormState);
  const [showPassword, setShowPassword] = useState(false);
  const hasHandledSuccess = useRef(false);

  useEffect(() => {
    if (!onSuccess || state.status !== "success" || hasHandledSuccess.current) return;

    hasHandledSuccess.current = true;
    onSuccess();
  }, [onSuccess, state.status]);

  useEffect(() => {
    if (state.status !== "success") {
      hasHandledSuccess.current = false;
    }
  }, [state.status]);

  const nameError = state.fieldErrors?.name?.[0];
  const emailError = state.fieldErrors?.email?.[0];
  const passwordError = state.fieldErrors?.password?.[0];

  if (state.status === "success" && !onSuccess) {
    return (
      <Alert className="bg-emerald-50/50 text-emerald-900 border-emerald-200/50">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        <AlertDescription>
          {state.message ?? "Account created successfully. Please check your email to confirm your account."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name" className="text-sm font-medium">
          Full Name
        </Label>
        <Input
          autoFocus
          id="signup-name"
          name="name"
          type="text"
          placeholder="John Doe"
          required
          minLength={2}
          maxLength={50}
          autoComplete="name"
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? "signup-name-error" : undefined}
        />
        {nameError && (
          <p id="signup-name-error" className="text-xs text-red-500" role="status" aria-live="polite">
            {nameError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "signup-email-error" : undefined}
        />
        {emailError && (
          <p id="signup-email-error" className="text-xs text-red-500" role="status" aria-live="polite">
            {emailError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-sm font-medium">
          Password
        </Label>
        <div className="relative">
          <Input
            id="signup-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            required
            minLength={6}
            maxLength={100}
            aria-invalid={Boolean(passwordError)}
            aria-describedby={passwordError ? "signup-password-error" : "signup-password-hint"}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {passwordError ? (
          <p id="signup-password-error" className="text-xs text-red-500" role="status" aria-live="polite">
            {passwordError}
          </p>
        ) : (
          <p id="signup-password-hint" className="text-xs text-muted-foreground">
            Use at least 6 characters, including one uppercase letter and one number.
          </p>
        )}
      </div>

      {state.status === "error" && state.message && (
        <Alert variant="destructive" className="bg-red-50/50 text-red-900 border-red-200/50" role="alert">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <SubmitButton />
    </form>
  );
}
