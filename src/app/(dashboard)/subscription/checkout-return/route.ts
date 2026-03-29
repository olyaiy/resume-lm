// src/app/checkout-return/route.ts

import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import Stripe from "stripe";


function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }
  return new Stripe(key);
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
    return redirect(
      `/subscription/checkout?price_id=${session.metadata?.price_id}`,
    );
  }

  return redirect("/home");
};
