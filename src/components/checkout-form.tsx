'use client'

import React, { useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { useSearchParams } from 'next/navigation'

import { postStripeSession } from "@/app/(dashboard)/subscription/stripe-session";

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string,
);

export function CheckoutForm() {
    const searchParams = useSearchParams()
    const priceId = searchParams.get('price_id')!
    const includeTrial = searchParams.get('trial') === 'true'

    const fetchClientSecret = useCallback(async () => {
        const stripeResponse = await postStripeSession({ priceId, includeTrial });
        return stripeResponse.clientSecret;
    }, [priceId, includeTrial]);

    React.useEffect(() => {
        async function checkStatuses() {
            try {
                // Remove unused Promise.all call
                await Promise.all([
                    // DELETE THIS BLOCK
                ]);
            } finally {
                // Empty finally block can remain
            }
        }

        checkStatuses();
    }, []);

    const options = { fetchClientSecret };

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

