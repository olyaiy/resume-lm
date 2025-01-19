'use client'

import React, { useCallback, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { checkAuth, getUserId, getSubscriptionStatus } from "@/app/auth/login/actions";

import { Skeleton } from "@/components/ui/skeleton";
import { postStripeSession } from "@/app/(dashboard)/subscription/stripe-session";

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string,
);

interface AuthStatus {
    authenticated: boolean;
    user?: { id: string; email?: string } | null;
}

function StatusCard({ title, children, isLoading }: { 
    title: string; 
    children: React.ReactNode; 
    isLoading: boolean;
}) {
    return (
        <div className="p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ) : children}
        </div>
    );
}

function CheckoutContent({ priceId }: { priceId: string }) {
    const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState<{
        hasSubscription: boolean;
        plan?: string;
        status?: string;
        error?: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchClientSecret = useCallback(async () => {
        const stripeResponse = await postStripeSession({ priceId });
        return stripeResponse.clientSecret;
    }, [priceId]);

    React.useEffect(() => {
        async function checkStatuses() {
            try {
                const [status, id, subscription] = await Promise.all([
                    checkAuth(),
                    getUserId(),
                    getSubscriptionStatus()
                ]);
                setAuthStatus(status);
                setUserId(id);
                setSubscriptionStatus(subscription);
            } catch (error) {
                console.error('Error checking statuses:', error);
            } finally {
                setIsLoading(false);
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

            <div className="mt-8 space-y-4">
                <StatusCard title="Full Auth Status" isLoading={isLoading}>
                    <div className="space-y-2">
                        <p>
                            <span className="font-medium">Status:</span>{' '}
                            {authStatus?.authenticated ? (
                                <span className="text-green-600">Authenticated</span>
                            ) : (
                                <span className="text-red-600">Not Authenticated</span>
                            )}
                        </p>
                        {authStatus?.authenticated && authStatus.user && (
                            <>
                                <p>
                                    <span className="font-medium">User ID:</span>{' '}
                                    {authStatus.user.id}
                                </p>
                                <p>
                                    <span className="font-medium">Email:</span>{' '}
                                    {authStatus.user.email}
                                </p>
                            </>
                        )}
                    </div>
                </StatusCard>

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
            </div>
        </div>
    );
}

export function CheckoutForm({ priceId }: { priceId: string }) {
    return <CheckoutContent priceId={priceId} />;
}
