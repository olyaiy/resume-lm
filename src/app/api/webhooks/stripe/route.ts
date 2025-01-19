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
  }
) {
  try {
    // Log the subscription change
    console.log('📝 Processing subscription change:', {
      customerId: stripeCustomerId,
      ...subscriptionData
    });

    // Update subscription in database
    await manageSubscriptionStatusChange(
      subscriptionData.subscriptionId,
      stripeCustomerId,
      subscriptionData.status === 'active'
    );
    
    console.log('✅ Subscription change processed successfully');
  } catch (error) {
    console.error('❌ Error processing subscription change:', error);
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
        
        await handleSubscriptionChange(
          subscription.customer as string,
          {
            subscriptionId: subscription.id,
            planId: subscription.items.data[0].price.id,
            status: subscription.status === 'active' ? 'active' : 'canceled',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
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
