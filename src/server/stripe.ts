import Stripe from "stripe";
import { env } from "~/env";

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
