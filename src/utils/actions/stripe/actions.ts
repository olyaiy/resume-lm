'use server';

import { Stripe } from "stripe";
import { createClient, createServiceClient } from '@/utils/supabase/server';
import { Subscription } from '@/lib/types';
import { getSubscriptionAccessState } from '@/lib/subscription-access';
import {
  mapStripeSubscriptionToAppSubscription,
  shouldSkipStaleInactiveSubscriptionUpdate,
} from '@/lib/stripe/subscription-sync';

// Lazy-initialize Stripe only when needed (allows running without Stripe for local dev)
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured. Stripe features are disabled.');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-04-30.basil'
    });
  }
  return _stripe;
}

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
  const { data: subscription } = await supabase
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
  const customer = await getStripe().customers.create({
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
      // Keep the record neutral until a real trial/subscription is created
      subscription_plan: 'free',
      subscription_status: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id',
      ignoreDuplicates: false
    });

  if (subscriptionError) throw subscriptionError;
}

// Manage subscription status change
export async function manageSubscriptionStatusChange(
  subscriptionId: string,
  customerId: string
): Promise<Partial<Subscription>> {
  console.log('🔄 Starting subscription status change:', {
    subscriptionId,
    customerId,
    timestamp: new Date().toISOString()
  });

  const supabase = await createServiceClient();
  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;

  if (!proPriceId) {
    throw new Error('NEXT_PUBLIC_STRIPE_PRO_PRICE_ID is not configured');
  }

  // Get customer's UUID from Stripe metadata
  console.log('🔍 Retrieving customer data from Stripe...');
  const customerData = await getStripe().customers.retrieve(customerId);
  if ('deleted' in customerData) {
    console.error('❌ Customer has been deleted');
    throw new Error('Customer has been deleted');
  }
  const uuid = customerData.metadata.supabaseUUID;
  if (!uuid) {
    throw new Error(`Stripe customer ${customerId} is missing metadata.supabaseUUID`);
  }
  console.log('✅ Retrieved customer UUID:', uuid);

  console.log('📦 Retrieving subscription details from Stripe...');
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method', 'items.data.price']
  });
  const subscriptionItem = subscription.items.data[0];
  if (!subscriptionItem) {
    throw new Error(`Stripe subscription ${subscription.id} has no subscription items`);
  }

  console.log('✅ Retrieved subscription details:', {
    id: subscription.id,
    status: subscription.status,
    currentPeriodEnd: subscriptionItem.current_period_end
      ? new Date(subscriptionItem.current_period_end * 1000).toISOString()
      : null
  });

  // Prepare subscription data
  const subscriptionData: Partial<Subscription> = mapStripeSubscriptionToAppSubscription({
    userId: uuid,
    customerId,
    subscriptionId: subscription.id,
    priceId: subscriptionItem.price.id,
    stripeStatus: subscription.status,
    currentPeriodEnd: subscriptionItem.current_period_end
      ? new Date(subscriptionItem.current_period_end * 1000)
      : null,
    trialEnd: subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    proPriceId,
  });

  console.log('\n📋 Prepared subscription data:', subscriptionData);

  try {
    const { data: currentSubscription, error: currentSubscriptionError } = await supabase
      .from('subscriptions')
      .select('user_id, stripe_customer_id, stripe_subscription_id, subscription_plan, subscription_status, current_period_end, trial_end, updated_at')
      .eq('user_id', uuid)
      .maybeSingle();

    if (currentSubscriptionError) {
      console.error('❌ Error reading current subscription before upsert:', currentSubscriptionError);
      throw currentSubscriptionError;
    }

    if (
      shouldSkipStaleInactiveSubscriptionUpdate({
        currentSubscription,
        incomingSubscription: subscriptionData,
      })
    ) {
      console.warn('⚠️ Skipping stale inactive subscription update because a different active subscription is current:', {
        incomingSubscriptionId: subscriptionData.stripe_subscription_id,
        currentSubscriptionId: currentSubscription?.stripe_subscription_id,
        userId: uuid,
      });

      return {
        user_id: uuid,
        stripe_customer_id: currentSubscription?.stripe_customer_id ?? customerId,
        stripe_subscription_id: currentSubscription?.stripe_subscription_id ?? null,
        subscription_plan: currentSubscription?.subscription_plan ?? 'pro',
        subscription_status: currentSubscription?.subscription_status ?? 'active',
        current_period_end: currentSubscription?.current_period_end ?? null,
        trial_end: currentSubscription?.trial_end ?? null,
        updated_at: currentSubscription?.updated_at ?? new Date().toISOString(),
      };
    }

    console.log('🔄 Upserting subscription in database...');
    const { error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('❌ Error upserting subscription:', error);
      throw error;
    }
    console.log('✅ Subscription upserted successfully');

    console.log('🎉 Subscription management completed successfully!');
    return subscriptionData;
  } catch (error) {
    console.error('💥 Error managing subscription:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
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
    // Delete customer in Stripe (ignore if customer doesn't exist in current Stripe mode)
    try {
      await getStripe().customers.del(subscription.stripe_customer_id);
    } catch (error: unknown) {
      const stripeError = error as { code?: string };
      // Ignore "resource_missing" errors (customer created in different Stripe mode)
      if (stripeError.code !== 'resource_missing') {
        throw error;
      }
      console.warn(`Stripe customer ${subscription.stripe_customer_id} not found (likely created in different Stripe mode), continuing with deletion`);
    }
  }

  // Delete subscription record
  const { error: subscriptionError } = await supabase
    .from('subscriptions')
    .delete()
    .eq('user_id', uuid);

  if (subscriptionError) throw subscriptionError;
}

// Helper to get subscription status
export async function getSubscriptionStatus() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  console.log(' looking for user ', user.id);

  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select(`
      subscription_plan,
      subscription_status,
      current_period_end,
      trial_end,
      stripe_customer_id,
      stripe_subscription_id
    `)
    .eq('user_id', user.id)
    .single();

  if (subscriptionError) {
    // If no subscription found, return a default free plan instead of throwing
    void subscriptionError
    if (subscriptionError.code === 'PGRST116') {
      return {
        subscription_plan: 'Free',
        subscription_status: 'active',
        current_period_end: null,
        trial_end: null,
        stripe_customer_id: null,
        stripe_subscription_id: null
      };
    }
    throw new Error('Failed to fetch subscription status');
  }

  return subscription;
}

export async function checkSubscriptionPlan() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      plan: '',
      status: '',
      currentPeriodEnd: '',
      trialEnd: '',
      isTrialing: false,
      hasProAccess: false,
    };
  }

  const { data } = await supabase
    .from('subscriptions')
    .select('subscription_plan, subscription_status, stripe_subscription_id, current_period_end, trial_end')
    .eq('user_id', user.id)
    .maybeSingle();

  const subscriptionState = getSubscriptionAccessState(data);
  const effectivePlan = data ? subscriptionState.effectivePlan : '';

  console.log('🧮 checkSubscriptionPlan', {
    userId: user.id,
    subscription_plan: data?.subscription_plan,
    subscription_status: data?.subscription_status,
    stripe_subscription_id: data?.stripe_subscription_id,
    current_period_end: data?.current_period_end,
    trial_end: data?.trial_end,
    isTrialing: subscriptionState.isTrialing,
    hasProAccess: subscriptionState.hasProAccess,
    effectivePlan,
  });
  
  return {
    plan: effectivePlan,
    status: data?.subscription_status || '',
    currentPeriodEnd: data?.current_period_end || '',
    trialEnd: data?.trial_end || '',
    isTrialing: subscriptionState.isTrialing,
    hasProAccess: subscriptionState.hasProAccess,
  };
}

// Check if user has ever started a subscription/trial (used for gating)
export async function hasActiveSubscriptionOrTrial(userId: string): Promise<boolean> {
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id, subscription_status, trial_end, current_period_end')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  // If they've ever had a Stripe subscription ID, they've gone through checkout/trial.
  return Boolean(data.stripe_subscription_id);
}

export async function getSubscriptionPlan(returnId: true): Promise<{ plan: string; id: string }>;
export async function getSubscriptionPlan(returnId?: boolean): Promise<string | { plan: string; id: string }>;
export async function getSubscriptionPlan(returnId?: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    if (returnId) return { plan: '', id: '' };
    return '';
  }

  const { data } = await supabase
    .from('subscriptions')
    .select('subscription_plan, subscription_status, stripe_subscription_id, current_period_end, trial_end')
    .eq('user_id', user.id)
    .maybeSingle();

  const subscriptionState = getSubscriptionAccessState(data);
  const effectivePlan = data ? subscriptionState.effectivePlan : '';

  if (returnId) {
    return {
      plan: effectivePlan,
      id: user.id || ''
    };
  }

  return effectivePlan;
}
