import { Resend } from "resend";
import { env } from "@disco/env";

/**
 * Lazy behind a `Proxy` for the same reason as the Stripe client: an eager
 * module-level `new Resend(env.RESEND_API_KEY)` reads the env at import time and
 * breaks `next build` — see 233c125.
 */
let _resend: Resend | undefined;

function getResend() {
  _resend ??= new Resend(env.RESEND_API_KEY);
  return _resend;
}

export const resend = new Proxy({} as Resend, {
  get(_target, prop, receiver) {
    return Reflect.get(getResend(), prop, receiver) as unknown;
  },
});
