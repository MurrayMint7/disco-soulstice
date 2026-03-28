import { headers } from "next/headers";
import { stripe } from "~/server/stripe";
import { db } from "~/server/db";
import {
  orders,
  events,
  tickets,
  merchOrders,
  merchSizes,
  merchItems,
} from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendTicketConfirmation } from "~/server/email/send-ticket-confirmation";
import { sendMerchConfirmation } from "~/server/email/send-merch-confirmation";
import { v4 as uuidv4 } from "uuid";
import { env } from "~/env";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) return new Response("No signature", { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const meta = paymentIntent.metadata;

    if (meta.type === "merch") {
      await db.transaction(async (tx) => {
        // Check if order already exists (idempotency)
        const [existing] = await tx
          .select({ id: merchOrders.id })
          .from(merchOrders)
          .where(eq(merchOrders.stripePaymentIntentId, paymentIntent.id));

        if (existing) return;

        const [order] = await tx
          .insert(merchOrders)
          .values({
            clerkUserId: meta.clerkUserId!,
            merchItemId: Number(meta.merchItemId),
            merchSizeId: Number(meta.merchSizeId),
            size: meta.size!,
            quantity: Number(meta.quantity),
            totalInPence: Number(meta.totalInPence),
            status: "completed",
            stripePaymentIntentId: paymentIntent.id,
            buyerEmail: meta.buyerEmail!,
            buyerName: meta.buyerName!,
          })
          .returning();

        await tx
          .update(merchSizes)
          .set({
            sold: sql`${merchSizes.sold} + ${Number(meta.quantity)}`,
          })
          .where(eq(merchSizes.id, Number(meta.merchSizeId)));

        const [item] = await tx
          .select()
          .from(merchItems)
          .where(eq(merchItems.id, Number(meta.merchItemId)));

        await sendMerchConfirmation({
          buyerEmail: meta.buyerEmail!,
          buyerName: meta.buyerName!,
          itemTitle: item?.title ?? "Merch Item",
          size: meta.size!,
          quantity: Number(meta.quantity),
          totalInPence: Number(meta.totalInPence),
          orderId: order!.id,
        });
      });
    } else {
      await db.transaction(async (tx) => {
        // Check if order already exists (idempotency)
        const [existing] = await tx
          .select({ id: orders.id })
          .from(orders)
          .where(eq(orders.stripePaymentIntentId, paymentIntent.id));

        if (existing) return;

        const eventId = Number(meta.eventId);
        const quantity = Number(meta.quantity);
        const totalInPence = Number(meta.totalInPence);

        const [eventRow] = await tx
          .select()
          .from(events)
          .where(eq(events.id, eventId))
          .for("update");

        if (!eventRow) return;

        const [order] = await tx
          .insert(orders)
          .values({
            clerkUserId: meta.clerkUserId!,
            eventId,
            quantity,
            totalInPence,
            status: "completed",
            stripePaymentIntentId: paymentIntent.id,
            buyerEmail: meta.buyerEmail!,
            buyerName: meta.buyerName!,
          })
          .returning();

        await tx
          .update(events)
          .set({
            ticketsSold: sql`${events.ticketsSold} + ${quantity}`,
          })
          .where(eq(events.id, eventId));

        const ticketCodes = Array.from({ length: quantity }, () =>
          uuidv4(),
        );
        await tx.insert(tickets).values(
          ticketCodes.map((code) => ({
            orderId: order!.id,
            eventId,
            ticketCode: code,
          })),
        );

        await sendTicketConfirmation({
          buyerEmail: meta.buyerEmail!,
          buyerName: meta.buyerName!,
          eventTitle: eventRow.title,
          eventDate: eventRow.day
            ? `${eventRow.day}, ${new Date(eventRow.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
            : new Date(eventRow.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
          eventTime: eventRow.time,
          eventVenue: eventRow.venue,
          eventLocation: eventRow.location,
          orderId: order!.id,
          quantity,
          totalInPence,
          ticketCodes,
        });
      });
    }
  }

  return new Response("OK", { status: 200 });
}
