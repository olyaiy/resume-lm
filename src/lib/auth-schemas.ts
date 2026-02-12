import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

const signupPasswordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(100, "Password must be at most 100 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, apostrophes, and hyphens"),
  email: emailSchema,
  password: signupPasswordSchema,
});
