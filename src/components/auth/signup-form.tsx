'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/app/auth/login/actions";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SubmitButtonProps {
  disabled?: boolean;
}

export function SignupForm() {
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);

  function SubmitButton({ disabled }: SubmitButtonProps) {
    const { pending } = useFormStatus();
    return (
      <Button 
        type="submit" 
        disabled={pending || disabled}
        className="w-full"
      >
        {pending ? "Creating Account..." : "Create Account"}
      </Button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setSuccess(false);

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    if (formData.get("password") !== formData.get("confirmPassword")) {
      setError("Passwords do not match");
      return;
    }

    const result = await signup(formData);
    if (!result.success) {
      setError(result.error || "Failed to create account");
      return;
    }

    setSuccess(true);
    form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <Alert className="bg-emerald-50 text-emerald-900 border-emerald-200">
          <AlertDescription>
            Account created successfully! Please check your email to confirm your account.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="John Doe"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
        />
      </div>

      <SubmitButton disabled={success} />
    </form>
  );
} 