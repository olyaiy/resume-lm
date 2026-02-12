"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { loginWithState } from "@/app/auth/login/actions";
import { initialAuthFormState } from "@/components/auth/auth-form-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
          Signing in...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginWithState, initialAuthFormState);
  const [showPassword, setShowPassword] = useState(false);

  const emailError = state.fieldErrors?.email?.[0];
  const passwordError = state.fieldErrors?.password?.[0];

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          autoFocus
          id="login-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="username"
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "login-email-error" : undefined}
        />
        {emailError && (
          <p id="login-email-error" className="text-xs text-red-500" role="status" aria-live="polite">
            {emailError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password" className="text-sm font-medium">
            Password
          </Label>
          <Link
            href="/auth/reset-password"
            className="text-sm text-muted-foreground hover:text-violet-600 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            minLength={1}
            autoComplete="current-password"
            aria-invalid={Boolean(passwordError)}
            aria-describedby={passwordError ? "login-password-error" : undefined}
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
        {passwordError && (
          <p id="login-password-error" className="text-xs text-red-500" role="status" aria-live="polite">
            {passwordError}
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
