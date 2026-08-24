// src/app/api/webhooks/stripe/route.ts

import { headers } from 'next/headers'
import Stripe from 'stripe'
import { manageSubscriptionStatusChange } from '@/utils/actions/stripe/actions'
import { createServiceClient } from '@/utils/supabase/server'
import { reportBillingAlert } from '@/lib/billing/alerts'
import { AnalyticsEvents } from '@/lib/analytics/events'
import { captureServerAnalyticsEvent } from '@/lib/analytics/server'
import {
  normalizeAnalyticsAnonymousId,
  UTM_PARAMETER_NAMES,
  type AnalyticsAttributionContext,
} from '@/lib/analytics/attribution'
import {
  getPaymentFailureRecoveryFields,
  getPaymentRecoveryClearedFields,
  getInvoiceSubscriptionId,
  isFirstPaidInvoice,
  shouldCaptureTrialStarted,
} from '@/lib/stripe/billing-events'
import type { Subscription } from '@/lib/types'

let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured. Stripe features are disabled.');
    }

    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-04-30.basil'
    });
  }

  return stripe;
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

const relevantEvents = new Set([
  'checkout.session.completed',
  'invoice.paid',
  'invoice.payment_failed',
  'invoice.updated',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.deleted'
]);

type ServiceSupabaseClient = Awaited<ReturnType<typeof createServiceClient>>;

type InvoiceWithSubscription = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription | null;
};

async function repairProcessedWebhookState(
  supabase: ServiceSupabaseClient,
  eventId: string,
  processedAt: string | null | undefined,
  status: string | null | undefined,
): Promise<void> {
  if (!processedAt || status === 'processed') {
    return;
  }

  const { error } = await supabase
    .from('stripe_webhook_events')
    .update({
      status: 'processed',
      last_attempt_at: processedAt,
      last_error: null,
    })
    .eq('event_id', eventId)
    .neq('status', 'processed');

  if (error) throw error;
}

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
  const now = new Date();
  const staleProcessingCutoff = now.getTime() - 5 * 60 * 1000;
  const { data: existingEvent, error: existingEventError } = await supabase
    .from('stripe_webhook_events')
    .select('event_id, processed_at, status, attempt_count, last_attempt_at')
    .eq('event_id', event.id)
    .maybeSingle();

  if (existingEventError) throw existingEventError;

  if (existingEvent?.processed_at) {
    await repairProcessedWebhookState(
      supabase,
      event.id,
      existingEvent.processed_at,
      existingEvent.status,
    );
    return 'skip';
  }

  if (existingEvent?.status === 'processed') {
    return 'skip';
  }

  if (!existingEvent) {
    const { error: insertError } = await supabase
      .from('stripe_webhook_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
        status: 'processing',
        attempt_count: 1,
        last_attempt_at: now.toISOString(),
        event_created_at: new Date(event.created * 1000).toISOString(),
      });

    if (insertError) {
      const isDuplicateEvent = (insertError as { code?: string }).code === '23505';
      if (!isDuplicateEvent) throw insertError;

      const { data: duplicateEvent, error: duplicateEventError } = await supabase
        .from('stripe_webhook_events')
        .select('event_id, processed_at, status, attempt_count, last_attempt_at')
        .eq('event_id', event.id)
        .maybeSingle();

      if (duplicateEventError) throw duplicateEventError;
      if (duplicateEvent?.processed_at) {
        await repairProcessedWebhookState(
          supabase,
          event.id,
          duplicateEvent.processed_at,
          duplicateEvent.status,
        );
        return 'skip';
      }

      if (duplicateEvent?.status === 'processed') {
        return 'skip';
      }
      if (
        duplicateEvent?.status === 'processing' &&
        duplicateEvent.last_attempt_at &&
        Date.parse(duplicateEvent.last_attempt_at) > staleProcessingCutoff
      ) {
        return 'skip';
      }
      if (duplicateEvent) {
        const { error: claimError } = await supabase
          .from('stripe_webhook_events')
          .update({
            status: 'processing',
            attempt_count: (duplicateEvent.attempt_count ?? 1) + 1,
            last_attempt_at: now.toISOString(),
            last_error: null,
          })
          .eq('event_id', event.id);
        if (claimError) throw claimError;
      }
    }
  } else {
    if (
      existingEvent.status === 'processing' &&
      existingEvent.last_attempt_at &&
      Date.parse(existingEvent.last_attempt_at) > staleProcessingCutoff
    ) {
      return 'skip';
    }
    const { error: claimError } = await supabase
      .from('stripe_webhook_events')
      .update({
        status: 'processing',
        attempt_count: (existingEvent.attempt_count ?? 1) + 1,
        last_attempt_at: now.toISOString(),
        last_error: null,
      })
      .eq('event_id', event.id);
    if (claimError) throw claimError;
  }

  return 'process';
}

async function markWebhookEventProcessed(
  supabase: ServiceSupabaseClient,
  eventId: string
): Promise<void> {
  const { error } = await supabase
    .from('stripe_webhook_events')
    .update({
      status: 'processed',
      processed_at: new Date().toISOString(),
      last_error: null,
    })
    .eq('event_id', eventId);

  if (error) throw error;
}

async function markWebhookEventFailed(
  supabase: ServiceSupabaseClient,
  eventId: string,
  error: Error,
): Promise<void> {
  const { error: updateError } = await supabase
    .from('stripe_webhook_events')
    .update({
      status: 'failed',
      last_attempt_at: new Date().toISOString(),
      last_error: error.message.slice(0, 2000),
    })
    .eq('event_id', eventId);

  if (updateError) {
    console.error('Unable to persist Stripe webhook failure state', {
      eventId,
      error: updateError,
    });
  }
}

async function handleSubscriptionChange(
  supabase: ServiceSupabaseClient,
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

    if (!subscriptionData.user_id) {
      await reportBillingAlert(supabase, {
        type: 'mapping_missing',
        severity: 'critical',
        alertKey: `mapping-missing:${subscriptionId}`,
        message: `Stripe subscription ${subscriptionId.slice(-8)} has no Supabase user mapping.`,
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId,
        details: {
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: stripeCustomerId,
          subscription_status: subscriptionData.subscription_status ?? null,
        },
      });
    }

    if (
      subscriptionData.user_id &&
      subscriptionData.subscription_plan === 'pro' &&
      subscriptionData.subscription_status === 'active'
    ) {
      await captureServerAnalyticsEvent({
        distinctId: subscriptionData.user_id,
        event: AnalyticsEvents.EntitlementActivated,
        insertId: `${subscriptionId}:${AnalyticsEvents.EntitlementActivated}`,
        properties: getSubscriptionEventProperties(subscriptionData, 'entitlement.activated'),
      });
    }
    
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

function getStripeAnalyticsContext(
  metadata: Stripe.Metadata | null | undefined,
): AnalyticsAttributionContext {
  const currentAttribution = Object.fromEntries(
    UTM_PARAMETER_NAMES.flatMap((name) => {
      const value = metadata?.[name];
      return value ? [[name, value]] : [];
    }),
  );
  const firstTouchAttribution = Object.fromEntries(
    UTM_PARAMETER_NAMES.flatMap((name) => {
      const value = metadata?.[`initial_${name}`];
      return value ? [[name, value]] : [];
    }),
  );

  return {
    anonymousId: normalizeAnalyticsAnonymousId(
      metadata?.analytics_anonymous_id,
    ),
    currentAttribution,
    firstTouchAttribution,
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
    context: getStripeAnalyticsContext(input.subscription.metadata),
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
    context: getStripeAnalyticsContext(input.subscription.metadata),
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
  supabase: ServiceSupabaseClient;
}) {
  if (input.eventType !== 'invoice.payment_failed') return;

  const userId = input.subscriptionData.user_id;
  if (!userId) return;

  const recoveryFields = getPaymentFailureRecoveryFields(input.invoice);
  const { error: recoveryUpdateError } = await input.supabase
    .from('subscriptions')
    .update({
      ...recoveryFields,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (recoveryUpdateError) {
    throw recoveryUpdateError;
  }

  await reportBillingAlert(input.supabase, {
    type: 'payment_failed',
    severity: 'warning',
    alertKey: `payment-failed:${input.invoice.id}`,
    message: `A Stripe invoice payment failed for subscription ${input.subscriptionData.stripe_subscription_id?.slice(-8) ?? 'unknown'}.`,
    stripeSubscriptionId: input.subscriptionData.stripe_subscription_id,
    details: {
      stripe_invoice_id: input.invoice.id,
      amount_due: input.invoice.amount_due,
      amount_remaining: input.invoice.amount_remaining,
      currency: input.invoice.currency,
      attempt_count: input.invoice.attempt_count,
      next_payment_attempt: recoveryFields.next_payment_attempt_at,
    },
  });

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
      next_payment_attempt: recoveryFields.next_payment_attempt_at,
    },
  });
}

async function clearInvoicePaymentRecovery(
  supabase: ServiceSupabaseClient,
  subscriptionData: Partial<Subscription>
) {
  const userId = subscriptionData.user_id;
  if (!userId) return;

  const { error } = await supabase
    .from('subscriptions')
    .update({
      ...getPaymentRecoveryClearedFields(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) throw error;
}

async function updateNextPaymentAttempt(
  supabase: ServiceSupabaseClient,
  invoice: Stripe.Invoice,
  subscriptionData: Partial<Subscription>
) {
  const userId = subscriptionData.user_id;
  if (!userId || !invoice.next_payment_attempt) return;

  const { error } = await supabase
    .from('subscriptions')
    .update({
      next_payment_attempt_at: new Date(invoice.next_payment_attempt * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) throw error;
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
    const invoices = await getStripe().invoices.list({
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
  let supabase: ServiceSupabaseClient | null = null;
  let event: Stripe.Event | null = null;
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

    try {
      console.log('🔍 Verifying webhook signature...');
      event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
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

    if (!event) {
      throw new Error('Stripe webhook event was not constructed');
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

    supabase = await createServiceClient();
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
            supabase,
            getCustomerId(session.customer as string | Stripe.Customer | Stripe.DeletedCustomer | null),
            subscriptionId
          );
          if (subscriptionData.user_id) {
            await captureServerAnalyticsEvent({
              distinctId: subscriptionData.user_id,
              event: AnalyticsEvents.CheckoutCompleted,
              insertId: `${event.id}:checkout_completed`,
              context: getStripeAnalyticsContext(session.metadata),
              properties: {
                ...getSubscriptionEventProperties(subscriptionData, event.type),
                stripe_checkout_session_id: session.id,
              },
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
            supabase,
            getCustomerId(invoice.customer as string | Stripe.Customer | Stripe.DeletedCustomer | null),
            subscriptionId
          );
          await clearInvoicePaymentRecovery(supabase, subscriptionData);
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
            supabase,
            getCustomerId(invoice.customer as string | Stripe.Customer | Stripe.DeletedCustomer | null),
            subscriptionId
          );
          await captureInvoicePaymentFailedEvent({
            eventType: event.type,
            invoice,
            subscriptionData,
            supabase,
          });
        }
        break;
      }

      case 'invoice.updated': {
        const invoice = event.data.object as InvoiceWithSubscription;
        const subscriptionId = getInvoiceSubscriptionId(invoice);

        // Stripe may publish the next retry time on invoice.updated rather
        // than invoice.payment_failed when Automations are enabled.
        if (
          subscriptionId &&
          invoice.status === 'open' &&
          (invoice.attempt_count ?? 0) > 0 &&
          invoice.next_payment_attempt
        ) {
          const subscriptionData = await handleSubscriptionChange(
            supabase,
            getCustomerId(invoice.customer as string | Stripe.Customer | Stripe.DeletedCustomer | null),
            subscriptionId
          );
          await updateNextPaymentAttempt(supabase, invoice, subscriptionData);
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
          supabase,
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
          supabase,
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
    if (supabase && event) {
      await markWebhookEventFailed(supabase, event.id, error);
      await reportBillingAlert(supabase, {
        type: 'webhook_processing_failed',
        severity: 'critical',
        alertKey: `webhook-failed:${event.id}`,
        message: `Stripe webhook ${event.type} failed and will be retried by Stripe.`,
        details: {
          event_type: event.type,
          event_id: event.id,
          error: error.message,
        },
      });
    }
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
