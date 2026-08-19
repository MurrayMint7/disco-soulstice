import Stripe from "stripe";

import { env } from "@disco/env";

/**
 * The client is built lazily behind a `Proxy`. An eager module-level
 * `new Stripe(env.STRIPE_SECRET_KEY)` reads the env at import time, which
 * breaks `next build` — see e130d5d. Do not "clean this up".
 */
let _stripe: Stripe | undefined;

function getStripe() {
  _stripe ??= new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
    typescript: true,
  });
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getStripe(), prop, receiver) as unknown;
  },
});

export type { Stripe };

/** Verifies a webhook signature against `STRIPE_WEBHOOK_SECRET`. */
export function constructWebhookEvent(
  body: string,
  signature: string,
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    env.STRIPE_WEBHOOK_SECRET,
  );
}

export interface CreatePaymentIntentParams {
  amountInPence: number;
  metadata: Stripe.MetadataParam;
}

/** Every payment this app takes is GBP, so the currency is not a parameter. */
export function createPaymentIntent(params: CreatePaymentIntentParams) {
  return stripe.paymentIntents.create({
    amount: params.amountInPence,
    currency: "gbp",
    metadata: params.metadata,
  });
}
