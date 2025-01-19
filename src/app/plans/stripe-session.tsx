"use server";

import { Stripe } from "stripe";
import { checkAuth } from "@/app/auth/login/actions";
import { createOrRetrieveCustomer } from "@/utils/stripe/actions";

const apiKey = process.env.STRIPE_SECRET_KEY as string;
const stripe = new Stripe(apiKey);

interface NewSessionOptions {
    priceId: string;
}

// Function to create a Stripe Checkout Session
export const postStripeSession = async ({ priceId }: NewSessionOptions) => {
    // Check if user is authenticated
    const { authenticated, user } = await checkAuth();
    
    if (!authenticated || !user?.id || !user?.email) {
        throw new Error('User must be authenticated to create a checkout session');
    }

    try {
        // Get or create Stripe customer
        const customerId = await createOrRetrieveCustomer({
            uuid: user.id,
            email: user.email
        });

        const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkout-return?session_id={CHECKOUT_SESSION_ID}`;

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
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

        if (!session.client_secret) {
            throw new Error('Failed to create Stripe session');
        }

        return {
            clientSecret: session.client_secret
        };
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to create checkout session');
    }
}
