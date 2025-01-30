// src/app/checkout-return/route.ts

import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import Stripe from "stripe";


const apiKey = process.env.STRIPE_SECRET_KEY as string;
const stripe = new Stripe(apiKey);

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const stripeSessionId = searchParams.get("session_id");


  if (!stripeSessionId?.length)
    return redirect("/");

  const session = await stripe.checkout.sessions.retrieve(stripeSessionId);

  if (session.status === "complete") {
    
    return redirect(`/subscription/checkout/success`);
  }

  if (session.status === "open") {
    // Here you'll likely want to head back to some pre-payment page in your checkout 
    // so the user can try again
    return redirect(
      `/subscription/checkout`,
    );
  }

  return redirect("/");
};
