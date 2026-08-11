// src/app/checkout-return/route.ts

import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import Stripe from "stripe";


const apiKey = process.env.STRIPE_SECRET_KEY as string;
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured. Stripe features are disabled.');
    }

    stripe = new Stripe(apiKey);
  }

  return stripe;
}

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const stripeSessionId = searchParams.get("session_id");


  if (!stripeSessionId?.length)
    return redirect("/home");

  const session = await getStripe().checkout.sessions.retrieve(stripeSessionId);

  if (session.status === "complete") {
    return redirect(`/subscription/checkout/success?session_id=${stripeSessionId}`);
  }

  if (session.status === "open") {
    const trialParam = session.metadata?.include_trial === "true" ? "&trial=true" : "";

    return redirect(
      `/subscription/checkout?price_id=${session.metadata?.price_id}${trialParam}`,
    );
  }

  return redirect("/home");
};
