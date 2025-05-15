"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { resetPasswordForEmail } from "@/app/auth/login/actions";
import Link from "next/link";

interface FormState {
  error?: string;
  success?: boolean;
}

export function ResetPasswordForm() {
  const [formState, setFormState] = useState<FormState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState({});
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      const result = await resetPasswordForEmail(formData);
      
      if (!result.success) {
        setFormState({ error: result.error || "Failed to send reset email" });
        return;
      }
      
      setEmail("");
      setFormState({ success: true });
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      setFormState({ error: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      {formState.error && (
        <Alert variant="destructive" className="bg-red-50/50 text-red-900 border-red-200/50">
          <AlertDescription>{formState.error}</AlertDescription>
        </Alert>
      )}
      
      {formState.success ? (
        <Alert className="bg-emerald-50/50 text-emerald-900 border-emerald-200/50">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <AlertDescription>
            Check your email for a password reset link.
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="pl-10 bg-white/50 border-white/40 focus:border-violet-500/50 focus:ring-violet-500/30 transition-all duration-300"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 hover:from-violet-500 hover:via-blue-500 hover:to-violet-500 shadow-lg shadow-violet-500/25 transition-all duration-500 animate-gradient-x"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>

          <div className="text-center text-sm">
            <Link 
              href="/"
              className="text-muted-foreground hover:text-violet-600 transition-colors"
            >
              Back to login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
} 