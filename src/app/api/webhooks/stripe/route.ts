// src/app/api/webhooks/stripe/route.ts

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: unknown) {
      const error = err as Error
      console.error(`⚠️ Webhook signature verification failed: ${error.message}`)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Handle the event based on type
    switch (event.type) {
      // Checkout and Payment Events
      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session
        console.log('💰 Checkout completed:', checkoutSession.id)
        break

      case 'checkout.session.expired':
        const expiredSession = event.data.object as Stripe.Checkout.Session
        console.log('⏰ Checkout expired:', expiredSession.id)
        break

      // Payment Events
      case 'payment_intent.succeeded':
        const successfulPayment = event.data.object as Stripe.PaymentIntent
        console.log(`💳 Payment succeeded: ${successfulPayment.id}`)
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        console.log(`❌ Payment failed: ${failedPayment.id}`)
        break

      // Invoice Events
      case 'invoice.paid':
        const paidInvoice = event.data.object as Stripe.Invoice
        console.log(`📃 Invoice paid: ${paidInvoice.id}`)
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        console.log(`❌ Invoice payment failed: ${failedInvoice.id}`)
        break

      // Subscription Lifecycle Events
      case 'customer.subscription.created':
        const newSubscription = event.data.object as Stripe.Subscription
        console.log(`✨ New subscription: ${newSubscription.id}`)
        break

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription
        console.log(`📝 Subscription updated: ${updatedSubscription.id}`)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        console.log(`🗑️ Subscription cancelled: ${deletedSubscription.id}`)
        break

      case 'customer.subscription.trial_will_end':
        const trialEndingSoon = event.data.object as Stripe.Subscription
        console.log(`⚠️ Trial ending soon: ${trialEndingSoon.id}`)
        break

      // Customer Lifecycle Events
      case 'customer.created':
        const newCustomer = event.data.object as Stripe.Customer
        console.log(`👤 New customer: ${newCustomer.id}`)
        break

      case 'customer.updated':
        const updatedCustomer = event.data.object as Stripe.Customer
        console.log(`📝 Customer updated: ${updatedCustomer.id}`)
        break

      case 'customer.deleted':
        const deletedCustomer = event.data.object as Stripe.Customer
        console.log(`🗑️ Customer deleted: ${deletedCustomer.id}`)
        break

      // Catch any unhandled events
      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    console.error('🔥 Webhook error:', err)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Disable body parsing, need raw body for Stripe webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
}
