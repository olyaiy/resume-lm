'use client'
import React, { useCallback, useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { checkAuth, getUserId } from "@/app/auth/login/actions";
import { postStripeSession } from "@/app/plans/stripe-session";

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string,
);

interface AuthStatus {
    authenticated: boolean;
    user?: { id: string; email?: string } | null;
}

function CheckoutContent({ priceId }: { priceId: string }) {
    const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchClientSecret = useCallback(async () => {
        const stripeResponse = await postStripeSession({ priceId });
        return stripeResponse.clientSecret;
    }, [priceId]);

    useEffect(() => {
        async function checkAuthStatus() {
            try {
                const [status, id] = await Promise.all([
                    checkAuth(),
                    getUserId()
                ]);
                setAuthStatus(status);
                setUserId(id);
            } catch (error) {
                console.error('Error checking auth status:', error);
            } finally {
                setIsLoading(false);
            }
        }

        checkAuthStatus();
    }, []);

    const options = { fetchClientSecret };

    return (
        <div className="space-y-8">
            <div id="checkout">
                <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                    <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
            </div>

            {/* Auth Status Display */}
            <div className="mt-8 space-y-4">
                {/* Full Auth Status */}
                <div className="p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                    <h3 className="text-lg font-semibold mb-2">Full Auth Status:</h3>
                    {isLoading ? (
                        <p>Checking authentication status...</p>
                    ) : (
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
                    )}
                </div>

                {/* Simple User ID Check */}
                <div className="p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200">
                    <h3 className="text-lg font-semibold mb-2">Simple User ID Check:</h3>
                    {isLoading ? (
                        <p>Checking user ID...</p>
                    ) : (
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
                    )}
                </div>
            </div>
        </div>
    );
}

export function CheckoutForm({ priceId }: { priceId: string }) {
    return (
        <React.Suspense fallback={<div>Loading checkout...</div>}>
            <CheckoutContent priceId={priceId} />
        </React.Suspense>
    );
}
