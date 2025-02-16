"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/app/auth/login/actions";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "./auth-context";

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
  const [error, setError] = useState<string>();
  const { 
    formData, 
    setFormData, 
    setFieldLoading, 
    validations, 
    validateField,
    touchedFields,
    setFieldTouched 
  } = useAuth();
 

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);

    // Mark all fields as touched on submit
    const fields = ['email', 'password'] as const;
    fields.forEach(field => setFieldTouched(field));

    // Validate all fields
    Object.entries(formData).forEach(([field, value]) => {
      validateField(field as keyof typeof formData, value);
    });

    // Check if all required fields are valid
    const isValid = fields.every(field => validations[field]?.isValid);

    if (!isValid) {
      setError("Please fix the validation errors before submitting");
      return;
    }

    try {
      setFieldLoading('submit', true);
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      
      const result = await login(formDataToSend);
      if (!result.success) {
        setError("Invalid credentials. If you just signed up, please check your email for a verification link.");
      }
    } catch (error: unknown) {
      setError("An error occurred during login");
      console.error("Login error:", error);
    } finally {
      setFieldLoading('submit', false);
    }
  }

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    setFormData({ [field]: value });
    validateField(field, value);
    // Simulate field validation loading state
    setFieldLoading(field, true);
    const timer = setTimeout(() => {
      setFieldLoading(field, false);
    }, 500);
    return () => clearTimeout(timer);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
        <div className="relative">
          {/* <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 " /> */}
          <Input 
            autoFocus
            id="login-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => setFieldTouched('email')}
            placeholder="you@example.com"
            required
            // className="pl-10"
            validation={validations.email}
            isTouched={touchedFields.email}
            autoComplete="username"
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
          <Link 
            href="/auth/reset-password"
            className="text-sm text-muted-foreground hover:text-violet-600 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          {/* <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" /> */}
          <Input
            id="login-password"
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onBlur={() => setFieldTouched('password')}
            placeholder="••••••••"
            required
            minLength={6}
            // className="pl-10"
            validation={validations.password}
            isTouched={touchedFields.password}
            autoComplete="current-password"
          />
        </div>
      </div>
      {error && (
        <Alert variant="destructive" className="bg-red-50/50 text-red-900 border-red-200/50">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <SubmitButton />
    </form>
  );
} 