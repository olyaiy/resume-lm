'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from 'next/cache';

export async function getSubscriptionStatus() {
  // Existing getSubscriptionStatus implementation
}

export async function createCheckoutSession(priceId: string) {
  // Existing createCheckoutSession implementation
}

export async function cancelSubscription() {
  // Existing cancelSubscription implementation
} 