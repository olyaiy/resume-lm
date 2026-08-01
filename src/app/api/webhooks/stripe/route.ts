// src/app/api/webhooks/stripe/route.ts

import { headers } from 'next/headers'
import Stripe from 'stripe'
import { manageSubscriptionStatusChange } from '@/utils/actions/stripe/actions'
import { createServiceClient } from '@/utils/supabase/server'
import { AnalyticsEvents } from '@/lib/analytics/events'
import { captureServerAnalyticsEvent } from '@/lib/analytics/server'
import {
  getInvoiceSubscriptionId,
  isFirstPaidInvoice,
  shouldCaptureTrialStarted,
} from '@/lib/stripe/billing-events'
import type { Subscription } from '@/lib/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

const relevantEvents = new Set([
  'checkout.session.completed',
  'invoice.paid',
  'invoice.payment_failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.deleted'
]);

type ServiceSupabaseClient = Awaited<ReturnType<typeof createServiceClient>>;

type InvoiceWithSubscription = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription | null;
};

function getCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
): string {
  if (typeof customer === 'string') {
    return customer;
  }

  if (customer?.id) {
    return customer.id;
  }

  throw new Error('Stripe object is missing customer id');
}

function getSubscriptionId(
  subscription: string | Stripe.Subscription | null | undefined
): string | null {
  if (!subscription) {
    return null;
  }

  if (typeof subscription === 'string') {
    return subscription;
  }

  return subscription.id;
}

async function reserveWebhookEvent(
  supabase: ServiceSupabaseClient,
  event: Stripe.Event
): Promise<'process' | 'skip'> {
  const { data: existingEvent, error: existingEventError } = await supabase
    .from('stripe_webhook_events')
    .select('event_id, processed_at')
    .eq('event_id', event.id)
    .maybeSingle();

  if (existingEventError) throw existingEventError;

  if (existingEvent?.processed_at) {
    return 'skip';
  }

  if (!existingEvent) {
    const { error: insertError } = await supabase
      .from('stripe_webhook_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
      });

    if (insertError) {
      const isDuplicateEvent = (insertError as { code?: string }).code === '23505';
      if (!isDuplicateEvent) throw insertError;

      const { data: duplicateEvent, error: duplicateEventError } = await supabase
        .from('stripe_webhook_events')
        .select('event_id, processed_at')
        .eq('event_id', event.id)
        .maybeSingle();

      if (duplicateEventError) throw duplicateEventError;
      if (duplicateEvent?.processed_at) {
        return 'skip';
      }
    }
  }

  return 'process';
}

async function markWebhookEventProcessed(
  supabase: ServiceSupabaseClient,
  eventId: string
): Promise<void> {
  const { error } = await supabase
    .from('stripe_webhook_events')
    .update({ processed_at: new Date().toISOString() })
    .eq('event_id', eventId);

  if (error) throw error;
}

async function handleSubscriptionChange(
  stripeCustomerId: string,
  subscriptionId: string
): Promise<Partial<Subscription>> {
  try {
    // Enhanced initial logging
    console.log('🔔 Subscription Status Update:', {
      event: 'subscription_change',
      timestamp: new Date().toISOString(),
      customerId: stripeCustomerId,
      subscriptionId,
    });

    // Update subscription in database
    const subscriptionData = await manageSubscriptionStatusChange(
      subscriptionId,
      stripeCustomerId
    );
    
    console.log('✨ Final Subscription State:', {
      result: 'success',
      updatedAt: new Date().toISOString(),
      subscriptionId,
    });

    return subscriptionData;
  } catch (error) {
    console.error('❌ Subscription Update Failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      errorObject: error,
      timestamp: new Date().toISOString(),
      customerId: stripeCustomerId,
      subscriptionId,
    });
    throw error;
  }
}

function getSubscriptionEventProperties(
  subscriptionData: Partial<Subscription>,
  eventType: string
) {
  return {
    stripe_subscription_id: subscriptionData.stripe_subscription_id ?? null,
    subscription_status: subscriptionData.subscription_status ?? null,
    subscription_plan: subscriptionData.subscription_plan ?? null,
    current_period_end: subscriptionData.current_period_end ?? null,
    event_type: eventType,
  };
}

async function captureTrialStartedEvent(input: {
  eventType: string;
  subscription: Stripe.Subscription;
  previousStatus?: Stripe.Subscription.Status;
  subscriptionData: Partial<Subscription>;
}) {
  if (
    !shouldCaptureTrialStarted({
      eventType: input.eventType,
      status: input.subscription.status,
      previousStatus: input.previousStatus,
    })
  ) {
    return;
  }

  const userId = input.subscriptionData.user_id;
  if (!userId) return;

  await captureServerAnalyticsEvent({
    distinctId: userId,
    event: AnalyticsEvents.TrialStarted,
    insertId: `${input.subscription.id}:trial_started`,
    properties: {
      ...getSubscriptionEventProperties(input.subscriptionData, input.eventType),
      trial_start: input.subscription.trial_start
        ? new Date(input.subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: input.subscription.trial_end
        ? new Date(input.subscription.trial_end * 1000).toISOString()
        : null,
    },
  });
}

async function captureSubscriptionCanceledEvent(input: {
  eventType: string;
  subscription: Stripe.Subscription;
  subscriptionData: Partial<Subscription>;
}) {
  if (input.eventType !== 'customer.subscription.deleted') return;

  const userId = input.subscriptionData.user_id;
  if (!userId) return;

  await captureServerAnalyticsEvent({
    distinctId: userId,
    event: AnalyticsEvents.SubscriptionCanceled,
    insertId: `${input.subscription.id}:subscription_canceled`,
    properties: {
      ...getSubscriptionEventProperties(input.subscriptionData, input.eventType),
      canceled_at: input.subscription.canceled_at
        ? new Date(input.subscription.canceled_at * 1000).toISOString()
        : null,
      ended_at: input.subscription.ended_at
        ? new Date(input.subscription.ended_at * 1000).toISOString()
        : null,
    },
  });
}

async function captureInvoicePaymentFailedEvent(input: {
  eventType: string;
  invoice: Stripe.Invoice;
  subscriptionData: Partial<Subscription>;
}) {
  if (input.eventType !== 'invoice.payment_failed') return;

  const userId = input.subscriptionData.user_id;
  if (!userId) return;

  await captureServerAnalyticsEvent({
    distinctId: userId,
    event: AnalyticsEvents.InvoicePaymentFailed,
    insertId: `${input.invoice.id}:invoice_payment_failed:${input.invoice.attempt_count ?? 'unknown'}`,
    properties: {
      ...getSubscriptionEventProperties(input.subscriptionData, input.eventType),
      stripe_invoice_id: input.invoice.id,
      amount_due: input.invoice.amount_due,
      amount_remaining: input.invoice.amount_remaining,
      currency: input.invoice.currency,
      billing_reason: input.invoice.billing_reason,
      attempt_count: input.invoice.attempt_count,
      next_payment_attempt: input.invoice.next_payment_attempt
        ? new Date(input.invoice.next_payment_attempt * 1000).toISOString()
        : null,
    },
  });
}

async function captureFirstInvoicePaidEvent(input: {
  invoice: InvoiceWithSubscription;
  subscriptionId: string;
  subscriptionData: Partial<Subscription>;
}) {
  const userId = input.subscriptionData.user_id;
  if (!userId) return;

  let paidSubscriptionInvoices: Stripe.Invoice[];
  try {
    const invoices = await stripe.invoices.list({
      subscription: input.subscriptionId,
      status: 'paid',
      limit: 100,
    });
    paidSubscriptionInvoices = invoices.data;
  } catch (error) {
    // Leave this webhook unprocessed so Stripe retries if the history query is
    // temporarily unavailable. The stable PostHog insert id keeps a retry
    // from creating a duplicate lifecycle event.
    console.warn('Unable to determine first paid invoice', {
      invoiceId: input.invoice.id,
      subscriptionId: input.subscriptionId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }

  if (
    !isFirstPaidInvoice({
      invoice: input.invoice,
      paidSubscriptionInvoices,
    })
  ) {
    return;
  }

  await captureServerAnalyticsEvent({
    distinctId: userId,
    event: AnalyticsEvents.FirstInvoicePaid,
    insertId: `${input.invoice.id}:first_invoice_paid`,
    properties: {
      ...getSubscriptionEventProperties(input.subscriptionData, 'invoice.paid'),
      stripe_invoice_id: input.invoice.id,
      amount_paid: input.invoice.amount_paid,
      currency: input.invoice.currency,
      billing_reason: input.invoice.billing_reason,
    },
  });
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

    const supabase = await createServiceClient();
    const webhookEventAction = await reserveWebhookEvent(supabase, event);
    if (webhookEventAction === 'skip') {
      console.log('↩️ Duplicate webhook event already processed, skipping:', event.id);
      return new Response(
        JSON.stringify({ received: true, processed: false, duplicate: true }),
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
        const subscriptionId = getSubscriptionId(session.subscription as string | Stripe.Subscription | null);
        
        if (session.mode === 'subscription' && subscriptionId) {
          const subscriptionData = await handleSubscriptionChange(
            getCustomerId(session.customer as string | Stripe.Customer | Stripe.DeletedCustomer | null),
            subscriptionId
          );
          if (subscriptionData.user_id) {
            await captureServerAnalyticsEvent({
              distinctId: subscriptionData.user_id,
              event: AnalyticsEvents.CheckoutCompleted,
              properties: getSubscriptionEventProperties(subscriptionData, event.type),
            });
          }
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as InvoiceWithSubscription;
        const subscriptionId = getInvoiceSubscriptionId(invoice);
        
        if (subscriptionId) {
          const subscriptionData = await handleSubscriptionChange(
            getCustomerId(invoice.customer as string | Stripe.Customer | Stripe.DeletedCustomer | null),
            subscriptionId
          );
          await captureFirstInvoicePaidEvent({
            invoice,
            subscriptionId,
            subscriptionData,
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as InvoiceWithSubscription;
        const subscriptionId = getInvoiceSubscriptionId(invoice);

        if (subscriptionId) {
          const subscriptionData = await handleSubscriptionChange(
            getCustomerId(invoice.customer as string | Stripe.Customer | Stripe.DeletedCustomer | null),
            subscriptionId
          );
          await captureInvoicePaymentFailedEvent({
            eventType: event.type,
            invoice,
            subscriptionData,
          });
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const previousAttributes = (event.data.previous_attributes ?? {}) as Partial<Stripe.Subscription>;
        const subscriptionItem = subscription.items.data[0];
        const currentPeriodEnd = subscriptionItem?.current_period_end
          ? new Date(subscriptionItem.current_period_end * 1000).toISOString()
          : null;
        
        // Enhanced logging for subscription updates
        console.log('📝 Subscription Update Details:', {
          event: event.type,
          customerId: subscription.customer,
          subscriptionId: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd,
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
            activeUntil: currentPeriodEnd,
            willAutoRenew: false
          });
        }
        
        const subscriptionData = await handleSubscriptionChange(
          getCustomerId(subscription.customer),
          subscription.id
        );
        await captureTrialStartedEvent({
          eventType: event.type,
          subscription,
          previousStatus: previousAttributes.status,
          subscriptionData,
        });
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
        
        const subscriptionData = await handleSubscriptionChange(
          getCustomerId(subscription.customer),
          subscription.id
        );
        await captureSubscriptionCanceledEvent({
          eventType: event.type,
          subscription,
          subscriptionData,
        });
        console.log('✅ Subscription deletion processed successfully');
        break;
      }

      case 'customer.deleted': {
        const customer = event.data.object as Stripe.Customer;

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
        throw new Error(`Unhandled relevant Stripe event type: ${event.type}`);
      }
    }

    await markWebhookEventProcessed(supabase, event.id);

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
