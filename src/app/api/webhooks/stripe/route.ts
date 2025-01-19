// src/app/api/webhooks/stripe/route.ts

import { headers } from 'next/headers'
import Stripe from 'stripe'
import { manageSubscriptionStatusChange } from '@/utils/stripe/actions'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

const relevantEvents = new Set([
  'checkout.session.completed',
  'invoice.paid',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted'
]);

async function handleSubscriptionChange(
  stripeCustomerId: string,
  subscriptionData: {
    subscriptionId: string;
    planId: string;
    status: 'active' | 'canceled';
    currentPeriodEnd: Date;
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
      accessUntil: subscriptionData.currentPeriodEnd.toISOString(),
      trialStatus: subscriptionData.trialEnd ? 'Active' : 'Not Active'
    });

    // Update subscription in database
    await manageSubscriptionStatusChange(
      subscriptionData.subscriptionId,
      stripeCustomerId,
      subscriptionData.status === 'active' && !subscriptionData.cancelAtPeriodEnd
    );
    
    console.log('✨ Final Subscription State:', {
      result: 'success',
      updatedAt: new Date().toISOString(),
      subscriptionId: subscriptionData.subscriptionId,
      status: subscriptionData.status,
      cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
      accessUntil: subscriptionData.currentPeriodEnd.toISOString(),
      note: subscriptionData.cancelAtPeriodEnd 
        ? 'Subscription is cancelled but remains active until period end'
        : subscriptionData.status === 'active' 
          ? 'Subscription is currently active' 
          : 'Subscription is cancelled'
    });
  } catch (error) {
    console.error('❌ Subscription Update Failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      customerId: stripeCustomerId,
      subscriptionId: subscriptionData.subscriptionId
    });
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = (await headers()).get('stripe-signature')

    if (!signature) {
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
      console.log('📦 Processing webhook with idempotency key:', idempotencyKey);
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: unknown) {
      const error = err as Error
      console.error(`⚠️ Webhook signature verification failed: ${error.message}`)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (!relevantEvents.has(event.type)) {
      console.log(`⚠️ Unhandled event type: ${event.type}`);
      return new Response(
        JSON.stringify({ error: `Unhandled event type: ${event.type}` }),
        { 
          status: 400,
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
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
            }
          );
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          
          await handleSubscriptionChange(
            invoice.customer as string,
            {
              subscriptionId: subscription.id,
              planId: subscription.items.data[0].price.id,
              status: 'active',
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
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
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
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
            activeUntil: new Date(subscription.current_period_end * 1000).toISOString(),
            willAutoRenew: false
          });
        }
        
        await handleSubscriptionChange(
          subscription.customer as string,
          {
            subscriptionId: subscription.id,
            planId: subscription.items.data[0].price.id,
            status: subscription.cancel_at_period_end ? 'canceled' : subscription.status === 'active' ? 'active' : 'canceled',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
            cancelAtPeriodEnd: subscription.cancel_at_period_end
          }
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await handleSubscriptionChange(
          subscription.customer as string,
          {
            subscriptionId: subscription.id,
            planId: 'free',
            status: 'canceled',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            trialEnd: null
          }
        );
        break;
      }

      default: {
        console.log(`⚠️ Unhandled event type: ${event.type}`);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (err) {
    console.error('🔥 Webhook error:', err)
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
