'use server';

import { Stripe } from "stripe";
import { createClient, createServiceClient } from '@/utils/supabase/server';
import { Profile, Subscription } from '@/lib/types';

// Initialize stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

// Create or retrieve a Stripe customer
export async function createOrRetrieveCustomer({
  uuid,
  email
}: {
  uuid: string;
  email: string;
}): Promise<string> {
  const supabase = await createServiceClient();

  // First check if user has a subscription record with stripe_customer_id
  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', uuid)
    .single();

  if (subscription?.stripe_customer_id) {
    return subscription.stripe_customer_id;
  }

  // If no customer exists, create one
  const customerID = await createCustomerInStripe(uuid, email);
  await upsertCustomerToSupabase(uuid, customerID);
  
  return customerID;
}

// Create a new customer in Stripe
async function createCustomerInStripe(uuid: string, email: string): Promise<string> {
  const customer = await stripe.customers.create({
    email,
    metadata: {
      supabaseUUID: uuid
    }
  });
  return customer.id;
}

// Update or insert customer info in Supabase
async function upsertCustomerToSupabase(uuid: string, customerId: string) {
  const supabase = await createServiceClient();

  // Update or create subscription record
  const { error: subscriptionError } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: uuid,
      stripe_customer_id: customerId,
      subscription_plan: 'free',
      subscription_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (subscriptionError) throw subscriptionError;
}

// Manage subscription status change
export async function manageSubscriptionStatusChange(
  subscriptionId: string,
  customerId: string,
  isSubscriptionNew: boolean
) {
  const supabase = await createServiceClient();

  // Get customer's UUID from Stripe metadata
  const customerData = await stripe.customers.retrieve(customerId);
  if ('deleted' in customerData) {
    throw new Error('Customer has been deleted');
  }
  const uuid = customerData.metadata.supabaseUUID;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method']
  });

  // Update subscription info in Supabase
  const subscriptionData: Partial<Subscription> = {
    user_id: uuid,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: customerId,
    subscription_plan: subscription.items.data[0].price.nickname?.toLowerCase() as 'free' | 'pro',
    subscription_status: subscription.status === 'active' ? 'active' : 'canceled',
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    trial_end: subscription.trial_end 
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData);

  if (error) throw error;
}

// Delete customer
export async function deleteCustomerAndData(uuid: string) {
  const supabase = await createServiceClient();

  // Get Stripe customer ID
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', uuid)
    .single();

  if (subscription?.stripe_customer_id) {
    // Delete customer in Stripe
    await stripe.customers.del(subscription.stripe_customer_id);
  }

  // Delete subscription record
  const { error: subscriptionError } = await supabase
    .from('subscriptions')
    .delete()
    .eq('user_id', uuid);

  if (subscriptionError) throw subscriptionError;
}

// Helper to get subscription status
export async function getSubscriptionStatus(uuid: string) {
  const supabase = await createServiceClient();

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', uuid)
    .single();

  if (error) throw error;

  return subscription;
}
