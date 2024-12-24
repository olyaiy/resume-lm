'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface AuthResult {
  success: boolean;
  error?: string;
}

export async function login(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { success: false, error: error.message }
  }

  redirect('/')
  return { success: true }
}

export async function signup(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { success: false, error: error.message }
  }

  redirect('/')
  return { success: true }
} 

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/auth/login');
  } 