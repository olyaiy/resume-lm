// src/app/api/webhooks/stripe/route.ts

import { headers } from 'next/headers'
import Stripe from 'stripe'
import { manageSubscriptionStatusChange } from '@/utils/actions/stripe/actions'
import { createServiceClient } from '@/utils/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

const relevantEvents = new Set([
  'checkout.session.completed',
  'invoice.paid',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.deleted'
]);

async function handleSubscriptionChange(
  stripeCustomerId: string,
  subscriptionData: {
    subscriptionId: string | null;
    planId: string;
    status: 'active' | 'canceled';
    currentPeriodEnd: Date | null;
    trialEnd?: Date | null;
    cancelAtPeriodEnd?: boolean;
  }
) {
  try {
    // Enhanced initial logging
    console.log('🔔 Subscription Status Update:', {
      event: 'subscription_change',
      timestamp: new Date().toISOString(),
      customerId: stripeCustomerId,
      subscriptionId: subscriptionData.subscriptionId,
      currentStatus: subscriptionData.status,
      cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
      planId: subscriptionData.planId,
      accessUntil: subscriptionData.currentPeriodEnd ? subscriptionData.currentPeriodEnd.toISOString() : null,
      trialStatus: subscriptionData.trialEnd ? 'Active' : 'Not Active'
    });

    // Update subscription in database
    await manageSubscriptionStatusChange(
      subscriptionData.subscriptionId ?? '',
      stripeCustomerId,
      subscriptionData.status === 'active' && !subscriptionData.cancelAtPeriodEnd
    );
    
    console.log('✨ Final Subscription State:', {
      result: 'success',
      updatedAt: new Date().toISOString(),
      subscriptionId: subscriptionData.subscriptionId,
      status: subscriptionData.status,
      cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
      accessUntil: subscriptionData.currentPeriodEnd ? subscriptionData.currentPeriodEnd.toISOString() : null,
      note: subscriptionData.cancelAtPeriodEnd 
        ? 'Subscription is cancelled but remains active until period end'
        : subscriptionData.status === 'active' 
          ? 'Subscription is currently active' 
          : 'Subscription is cancelled'
    });
  } catch (error) {
    console.error('❌ Subscription Update Failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      errorObject: error,
      timestamp: new Date().toISOString(),
      customerId: stripeCustomerId,
      subscriptionId: subscriptionData.subscriptionId,
      planId: subscriptionData.planId,
      data: subscriptionData
    });
    
    // Log but don't throw the error to prevent webhook failure response
    // This allows the webhook to acknowledge receipt even if DB update fails
    console.error('Continuing webhook processing despite error...');
  }
}

export async function POST(req: Request) {
  try {
    console.log('🌐 Incoming Webhook Request:', {
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    });

    const body = await req.text()
    const signature = (await headers()).get('stripe-signature')

    if (!signature) {
      console.error('❌ Missing Stripe Signature Header');
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const idempotencyKey = (await headers()).get('stripe-idempotency-key');
    if (idempotencyKey) {
      console.log('🔑 Processing webhook with idempotency key:', idempotencyKey);
    }

    let event: Stripe.Event
    try {
      console.log('🔍 Verifying webhook signature...');
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log('✅ Webhook signature verified successfully');
    } catch (err: unknown) {
      const error = err as Error
      console.error('❌ Webhook signature verification failed:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('📨 Received Stripe Event:', {
      type: event.type,
      id: event.id,
      created: new Date(event.created * 1000).toISOString()
    });

    if (!relevantEvents.has(event.type)) {
      console.log('ℹ️ Skipping unhandled event type:', event.type);
      return new Response(
        JSON.stringify({ received: true, processed: false, message: `Event type ${event.type} was received but not processed` }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Handle the event based on type
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          await handleSubscriptionChange(
            session.customer as string,
            {
              subscriptionId: subscription.id,
              planId: subscription.items.data[0].price.id,
              status: 'active',
              currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
              trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
            }
          );
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          
          await handleSubscriptionChange(
            invoice.customer as string,
            {
              subscriptionId: subscription.id,
              planId: subscription.items.data[0].price.id,
              status: 'active',
              currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
              trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
            }
          );
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const previousAttributes = event.data.previous_attributes as Partial<Stripe.Subscription>;
        
        // Enhanced logging for subscription updates
        console.log('📝 Subscription Update Details:', {
          event: 'subscription_updated',
          customerId: subscription.customer,
          subscriptionId: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000).toISOString(),
          changes: {
            willCancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
            previousCancelAtPeriodEnd: previousAttributes.cancel_at_period_end,
            newCancelAtPeriodEnd: subscription.cancel_at_period_end,
            previousStatus: previousAttributes.status,
            newStatus: subscription.status
          }
        });

        // Add specific cancellation notice if detected
        if (subscription.cancel_at_period_end) {
          console.log('🚫 Subscription Cancellation Scheduled:', {
            message: 'Subscription will remain active until period end',
            activeUntil: new Date(subscription.items.data[0].current_period_end * 1000).toISOString(),
            willAutoRenew: false
          });
        }
        
        await handleSubscriptionChange(
          subscription.customer as string,
          {
            subscriptionId: subscription.id,
            planId: subscription.items.data[0].price.id,
            status: subscription.cancel_at_period_end ? 'canceled' : subscription.status === 'active' ? 'active' : 'canceled',
            currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
            cancelAtPeriodEnd: subscription.cancel_at_period_end
          }
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log('🗑️ Processing subscription deletion:', {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          endedAt: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
          status: subscription.status
        });
        
        try {
          await handleSubscriptionChange(
            subscription.customer as string,
            {
              subscriptionId: subscription.id,
              planId: 'free',
              status: 'canceled',
              currentPeriodEnd: null,
              trialEnd: null,
              cancelAtPeriodEnd: false
            }
          );
          console.log('✅ Subscription deletion processed successfully');
        } catch (error) {
          console.error('❌ Failed to process subscription deletion:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            subscriptionId: subscription.id,
            customerId: subscription.customer
          });
          // Continue processing the webhook even if this fails
        }
        break;
      }

      case 'customer.deleted': {
        const customer = event.data.object as Stripe.Customer;
        const supabase = await createServiceClient();

        try {
          const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('stripe_customer_id', customer.id);

          if (error) throw error;
          
          console.log('🗑️ Deleted subscription record for customer:', {
            customerId: customer.id,
            supabaseUUID: customer.metadata.supabaseUUID
          });
        } catch (error) {
          console.error('❌ Failed to clear Stripe customer data:', error);
          throw error;
        }
        break;
      }

      default: {
        console.log(`⚠️ Unhandled event type: ${event.type}`);
      }
    }

    console.log('✅ Webhook processed successfully:', {
      eventType: event.type,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ received: true }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('🔥 Webhook handler failed:', {
      error: error.message,
      stack: error.stack,
      type: error.name,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ error: 'Webhook handler failed' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
