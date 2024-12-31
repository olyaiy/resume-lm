"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/app/auth/login/actions";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock } from "lucide-react";

interface SubmitButtonProps {
  setError: (error: string) => void;
}

export function LoginForm() {
  const [error, setError] = useState<string>();

  function SubmitButton({ setError }: SubmitButtonProps) {
    const { pending } = useFormStatus();
    return (
      <Button 
        type="submit" 
        onClick={async (e) => {
          e.preventDefault();
          const form = e.currentTarget.form;
          if (!form) return;
          const formData = new FormData(form);
          const result = await login(formData);
          if (!result.success) {
            setError("Invalid credentials");
          }
        }} 
        disabled={pending}
        className="w-full bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 hover:from-violet-500 hover:via-blue-500 hover:to-violet-500 shadow-lg shadow-violet-500/25 transition-all duration-500 animate-gradient-x"
      >
        {pending ? "Signing in..." : "Sign In"}
      </Button>
    );
  }

  return (
    <form className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="pl-10 bg-white/50 border-white/40 focus:border-violet-500/50 focus:ring-violet-500/30 transition-all duration-300"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="pl-10 bg-white/50 border-white/40 focus:border-violet-500/50 focus:ring-violet-500/30 transition-all duration-300"
          />
        </div>
      </div>
      {error && (
        <Alert variant="destructive" className="bg-red-50/50 text-red-900 border-red-200/50">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <SubmitButton setError={setError} />
    </form>
  );
} 