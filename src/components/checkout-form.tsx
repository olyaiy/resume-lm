'use client'

import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { useSearchParams } from 'next/navigation'
import { usePostHog } from "posthog-js/react";

import { postStripeSession } from "@/app/(dashboard)/subscription/stripe-session";
import { AnalyticsEvents, sanitizeAnalyticsProperties } from "@/lib/analytics/events";

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string,
);

export function CheckoutForm() {
    const searchParams = useSearchParams()
    const posthog = usePostHog()
    const priceId = searchParams.get('price_id')!
    const includeTrial = searchParams.get('trial') === 'true'
    const [clientSecret, setClientSecret] = React.useState<string | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    React.useEffect(() => {
        let isMounted = true;

        async function createCheckoutSession() {
            try {
                const stripeResponse = await postStripeSession({ priceId, includeTrial });

                if (!isMounted) return;

                if (stripeResponse.kind === "portal") {
                    window.location.href = stripeResponse.url;
                    return;
                }

                if (stripeResponse.kind === "error") {
                    setErrorMessage(stripeResponse.message);
                    return;
                }

                setClientSecret(stripeResponse.clientSecret);
                posthog?.capture(AnalyticsEvents.CheckoutStarted, sanitizeAnalyticsProperties({
                    $geoip_disable: true,
                    price_id: priceId,
                    include_trial: includeTrial,
                }));
            } catch (error) {
                if (!isMounted) return;

                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "Unable to start checkout. Please try again."
                );
            }
        }

        createCheckoutSession();

        return () => {
            isMounted = false;
        };
    }, [priceId, includeTrial, posthog]);

    if (errorMessage) {
        return (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
            </div>
        );
    }

    if (!clientSecret) {
        return (
            <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600">
                Preparing secure checkout...
            </div>
        );
    }

    const options = { clientSecret };

    return (
        <div className="space-y-8">
            <div id="checkout">
                <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                    <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
            </div>

            {/* <div className="mt-8 space-y-4">
                <StatusCard title="Simple User ID Check" isLoading={isLoading}>
                    <div className="space-y-2">
                        <p>
                            <span className="font-medium">User ID:</span>{' '}
                            {userId ? (
                                <span className="text-green-600">{userId}</span>
                            ) : (
                                <span className="text-red-600">No user ID found</span>
                            )}
                        </p>
                    </div>
                </StatusCard>

                <StatusCard title="Subscription Status" isLoading={isLoading}>
                    <div className="space-y-2">
                        {subscriptionStatus?.error ? (
                            <p className="text-red-600">Error: {subscriptionStatus.error}</p>
                        ) : (
                            <>
                                <p>
                                    <span className="font-medium">Has Subscription:</span>{' '}
                                    {subscriptionStatus?.hasSubscription ? (
                                        <span className="text-green-600">Yes</span>
                                    ) : (
                                        <span className="text-red-600">No</span>
                                    )}
                                </p>
                                {subscriptionStatus?.hasSubscription && (
                                    <>
                                        <p>
                                            <span className="font-medium">Plan:</span>{' '}
                                            <span className="text-purple-600">
                                                {subscriptionStatus.plan}
                                            </span>
                                        </p>
                                        <p>
                                            <span className="font-medium">Status:</span>{' '}
                                            <span className={subscriptionStatus.status === 'active' ? 'text-green-600' : 'text-yellow-600'}>
                                                {subscriptionStatus.status}
                                            </span>
                                        </p>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </StatusCard>
            </div> */}
        </div>
    );
}
