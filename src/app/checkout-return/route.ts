// src/app/checkout-return/route.ts

import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateUserStripeCustomer } from "../auth/login/actions";

const apiKey = process.env.STRIPE_SECRET_KEY as string;
const stripe = new Stripe(apiKey);

export const GET = async (request: NextRequest, response: NextResponse) => {
  const { searchParams } = new URL(request.url);

  const stripeSessionId = searchParams.get("session_id");


  if (!stripeSessionId?.length)
    return redirect("/");

  const session = await stripe.checkout.sessions.retrieve(stripeSessionId);

  if (session.status === "complete") {
    // Get subscription details if this is a subscription checkout
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      await updateUserStripeCustomer(
        session.customer as string,
        {
          subscriptionId: subscription.id,
          status: 'active',
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }
      );
    } else {
      // If it's not a subscription checkout, just update the customer ID
      await updateUserStripeCustomer(
        session.customer as string,
        {
          subscriptionId: '', // or null if your DB allows it
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now as default
        }
      );
    }
    
    return redirect(`/checkout/success`);
  }

  if (session.status === "open") {
    // Here you'll likely want to head back to some pre-payment page in your checkout 
    // so the user can try again
    return redirect(
      `/plans/checkout`,
    );
  }

  return redirect("/");
};
