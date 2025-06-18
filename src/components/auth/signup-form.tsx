'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/app/auth/login/actions";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2 } from "lucide-react";
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
          Creating Account...
        </>
      ) : (
        "Create Account"
      )}
    </Button>
  );
}

interface FormState {
  error?: string;
  success?: boolean;
}

export function SignupForm() {
  const [formState, setFormState] = useState<FormState>({});
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
    setFormState({});

    // Mark all fields as touched on submit
    const fields = ['email', 'password', 'name'] as const;
    fields.forEach(field => setFieldTouched(field));

    // Validate all fields
    Object.entries(formData).forEach(([field, value]) => {
      if (field !== 'confirmPassword') {
        validateField(field as keyof typeof formData, value);
      }
    });

    // Check if all required fields are valid
    const isValid = fields.every(field => validations[field]?.isValid);

    if (!isValid) {
      setFormState({ error: "Please fix the validation errors before submitting" });
      return;
    }

    try {
      setFieldLoading('submit', true);
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('name', formData.name || '');
      
      const result = await signup(formDataToSend);
      if (!result.success) {
        setFormState({ error: result.error || "Failed to create account" });
        return;
      }

      setFormState({ success: true });
    } catch (error: unknown) {
      console.error("Signup error:", error);
      setFormState({ error: "An unexpected error occurred" });
    } finally {
      setFieldLoading('submit', false);
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({ [field]: value });
    validateField(field, value);
    setFieldLoading(field, true);
    const timer = setTimeout(() => {
      setFieldLoading(field, false);
    }, 500);
    return () => clearTimeout(timer);
  };

  return (
    <>
      {formState.success ? (
        <Alert className="bg-emerald-50/50 text-emerald-900 border-emerald-200/50">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <AlertDescription>
            Account created successfully! Please check your email to confirm your account.
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {formState.error && (
            <Alert variant="destructive" className="bg-red-50/50 text-red-900 border-red-200/50">
              <AlertDescription>{formState.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
            <div className="relative">
              {/* <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" /> */}
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={() => setFieldTouched('name')}
                placeholder="John Doe"
                required
                minLength={2}
                maxLength={50}
                // className="pl-10"
                validation={validations.name}
                isTouched={touchedFields.name}
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              {/* <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" /> */}
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => setFieldTouched('email')}
                placeholder="you@example.com"
                required
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                // className="pl-10"
                validation={validations.email}
                isTouched={touchedFields.email}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              {/* <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" /> */}
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => setFieldTouched('password')}
                placeholder="••••••••"
                required
                minLength={6}
                maxLength={100}
                // className="pl-10"
                validation={validations.password}
                isTouched={touchedFields.password}
              />
            </div>
          </div>

          <SubmitButton />
        </form>
      )}
    </>
  );
} 