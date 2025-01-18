"use server";

import { Stripe } from "stripe";

const apiKey = process.env.STRIPE_SECRET_KEY as string;

const stripe = new Stripe(apiKey);

interface NewSessionOptions {
    priceId: string
}

// Function to create a Stripe Checkout Session
export const postStripeSession = async ({priceId}: NewSessionOptions) => {
    const returnUrl = 'http://localhost:3000/checkout-return?session_id={CHECKOUT_SESSION_ID}'

    const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        return_url: returnUrl,
      });

    // Debug logging
    console.log('🔍 Stripe Session Response:', {
        id: session.id,
        clientSecret: session.client_secret,
        customerId: session.customer,
        subscriptionId: session.subscription,
        paymentStatus: session.payment_status,
        status: session.status,
        mode: session.mode,
        // Add any other relevant fields you want to inspect
    });

    if(!session.client_secret) throw new Error('Error initiating Stripe session');

    return {
        clientSecret: session.client_secret
    }
}
