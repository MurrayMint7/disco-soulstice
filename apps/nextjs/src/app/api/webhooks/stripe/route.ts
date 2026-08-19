import { headers } from "next/headers";

import { db } from "@disco/db";
import { sendMerchConfirmation, sendTicketConfirmation } from "@disco/email";
import {
  createDrizzleMerchStore,
  fulfilMerchPayment,
} from "@disco/merch-service";
import { constructWebhookEvent } from "@disco/payments";
import {
  createDrizzleTicketStore,
  fulfilTicketPayment,
} from "@disco/ticketing-service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) return new Response("No signature", { status: 400 });

  let event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const payment = {
      paymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata,
    };

    if (paymentIntent.metadata.type === "merch") {
      await db.transaction(async (tx) => {
        await fulfilMerchPayment(payment, {
          store: createDrizzleMerchStore(tx),
          sendConfirmation: sendMerchConfirmation,
        });
      });
    } else {
      await db.transaction(async (tx) => {
        await fulfilTicketPayment(payment, {
          store: createDrizzleTicketStore(tx),
          sendConfirmation: sendTicketConfirmation,
        });
      });
    }
  }

  return new Response("OK", { status: 200 });
}
