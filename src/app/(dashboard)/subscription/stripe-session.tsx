"use server";

import { Stripe } from "stripe";
import { checkAuth } from "@/app/(auth)/auth/login/actions";
import { getServerAnalyticsContext } from "@/lib/analytics/server";
import { createOrRetrieveCustomer } from "@/utils/actions/stripe/actions";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { captureServerAnalyticsEvent } from "@/lib/analytics/server";
import {
    buildCheckoutIdempotencyKey,
    buildCheckoutSessionMetadata,
    buildSubscriptionMetadata,
    isBlockingCheckoutSubscription,
    isMatchingOpenCheckoutSession,
} from "@/lib/stripe/checkout-guard";

let stripeClient: Stripe | null = null;

function getStripeClient() {
    if (!stripeClient) {
        const apiKey = process.env.STRIPE_SECRET_KEY;
        if (!apiKey) throw new Error("STRIPE_SECRET_KEY is not configured");
        stripeClient = new Stripe(apiKey, {
            apiVersion: "2025-04-30.basil",
        });
    }
    return stripeClient;
}

interface NewSessionOptions {
    priceId: string;
    includeTrial?: boolean;
}

export type StripeSessionResult =
    | { kind: "checkout"; clientSecret: string }
    | { kind: "portal"; url: string; reason: "existing_subscription" }
    | { kind: "error"; message: string };

function getCheckoutErrorCategory(error: unknown): string {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("price") || message.includes("valid")) return "invalid_checkout_configuration";
    if (message.includes("customer")) return "customer_lookup_failed";
    if (message.includes("stripe")) return "stripe_session_creation_failed";
    return "checkout_session_creation_failed";
}

async function captureCheckoutStarted(input: {
    userId: string;
    sessionId: string;
    priceId: string;
    includeTrial: boolean;
    context: Awaited<ReturnType<typeof getServerAnalyticsContext>>;
}) {
    await captureServerAnalyticsEvent({
        distinctId: input.userId,
        event: AnalyticsEvents.CheckoutStarted,
        insertId: `${input.sessionId}:${AnalyticsEvents.CheckoutStarted}`,
        context: input.context,
        properties: {
            price_id: input.priceId,
            include_trial: input.includeTrial,
            checkout_surface: "embedded",
            stripe_checkout_session_id: input.sessionId,
        },
    });
}

async function createBillingPortalSession(customerId: string) {
    const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/subscription`;

    return getStripeClient().billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });
}

// Function to create a Stripe Checkout Session
export const postStripeSession = async ({ priceId, includeTrial = false }: NewSessionOptions): Promise<StripeSessionResult> => {
    // Check if user is authenticated
    const { authenticated, user } = await checkAuth();
    
    if (!authenticated || !user?.id || !user?.email) {
        throw new Error('User must be authenticated to create a checkout session');
    }

    try {
        const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
        if (!proPriceId) {
            throw new Error('NEXT_PUBLIC_STRIPE_PRO_PRICE_ID is not configured');
        }

        if (priceId !== proPriceId) {
            await captureServerAnalyticsEvent({
                distinctId: user.id,
                event: AnalyticsEvents.CheckoutError,
                properties: {
                    price_id: priceId,
                    include_trial: includeTrial,
                    error_category: "invalid_checkout_configuration",
                },
            });
            return {
                kind: "error",
                message: "This checkout link is no longer valid. Please restart checkout from the subscription page.",
            };
        }

        // Get or create Stripe customer
        const customerId = await createOrRetrieveCustomer({
            uuid: user.id,
            email: user.email
        });

        const existingSubscriptions = await getStripeClient().subscriptions.list({
            customer: customerId,
            price: priceId,
            status: "all",
            limit: 10,
        });

        const blockingSubscription = existingSubscriptions.data.find((subscription) =>
            isBlockingCheckoutSubscription(subscription.status)
        );

        if (blockingSubscription) {
            console.log('🛑 Existing Stripe subscription found before checkout', {
                userId: user.id,
                customerId,
                subscriptionId: blockingSubscription.id,
                status: blockingSubscription.status,
                priceId,
            });

            const portalSession = await createBillingPortalSession(customerId);
            return {
                kind: "portal",
                url: portalSession.url,
                reason: "existing_subscription",
            };
        }

        const analyticsContext = await getServerAnalyticsContext();
        const checkoutMetadata = buildCheckoutSessionMetadata({
            userId: user.id,
            priceId,
            includeTrial,
            analyticsContext,
        });

        const openSessions = await getStripeClient().checkout.sessions.list({
            customer: customerId,
            status: "open",
            limit: 10,
        });

        const reusableSession = openSessions.data.find((session) =>
            isMatchingOpenCheckoutSession(session, checkoutMetadata)
        );

        if (reusableSession?.client_secret) {
            console.log('♻️ Reusing existing open checkout session', {
                userId: user.id,
                customerId,
                sessionId: reusableSession.id,
                priceId,
                includeTrial,
                context: analyticsContext,
            });

            await captureCheckoutStarted({
                userId: user.id,
                sessionId: reusableSession.id,
                priceId,
                includeTrial,
                context: analyticsContext,
            });

            return {
                kind: "checkout",
                clientSecret: reusableSession.client_secret,
            };
        }

        const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/subscription/checkout-return?session_id={CHECKOUT_SESSION_ID}`;

        console.log('🧾 Creating checkout session', {
            userId: user.id,
            priceId,
            includeTrial,
            returnUrl
        });

        const session = await getStripeClient().checkout.sessions.create({
            customer: customerId,
            ui_mode: "embedded",
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            allow_promotion_codes: true,
            return_url: returnUrl,
            client_reference_id: user.id,
            metadata: checkoutMetadata,
            // Require credit card upfront
            payment_method_collection: 'always',
            subscription_data: {
                metadata: buildSubscriptionMetadata({
                    userId: user.id,
                    priceId,
                    includeTrial,
                    analyticsContext,
                }),
                ...(includeTrial && {
                    trial_period_days: 7,
                }),
            },
        }, {
            idempotencyKey: buildCheckoutIdempotencyKey({
                userId: user.id,
                priceId,
                includeTrial,
            }),
        });

        if (!session.client_secret) {
            throw new Error('Failed to create Stripe session');
        }

        await captureCheckoutStarted({
            userId: user.id,
            sessionId: session.id,
            priceId,
            includeTrial,
            context: analyticsContext,
        });

        return {
            kind: "checkout",
            clientSecret: session.client_secret
        };
    } catch (error) {
        await captureServerAnalyticsEvent({
            distinctId: user.id,
            event: AnalyticsEvents.CheckoutError,
            properties: {
                price_id: priceId,
                include_trial: includeTrial,
                error_category: getCheckoutErrorCategory(error),
            },
        });
        console.error('Error creating checkout session:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to create checkout session');
    }
}

// Function to create a Stripe Portal Session
export const createPortalSession = async () => {
    'use server';
    
    // Check if user is authenticated
    const { authenticated, user } = await checkAuth();
    
    if (!authenticated || !user?.id || !user?.email) {
        throw new Error('User must be authenticated to access the billing portal');
    }

    try {
        // Get or create Stripe customer
        const customerId = await createOrRetrieveCustomer({
            uuid: user.id,
            email: user.email
        });

        const portalSession = await createBillingPortalSession(customerId);

        return {
            url: portalSession.url
        };
    } catch (error) {
        console.error('Error creating portal session:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to create portal session');
    }
}
