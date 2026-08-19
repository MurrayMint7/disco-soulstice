import type { SendTicketConfirmationParams } from "@disco/email";

import { generateTicketCodes } from "./codes";
import {
  buildTicketConfirmation,
  type ConfirmationEvent,
} from "./confirmation";

/**
 * The ticket half of `payment_intent.succeeded`, lifted out of the webhook route.
 *
 * It talks to a narrow store port rather than a Drizzle transaction directly, so
 * the tests below it need no database. `createDrizzleTicketStore` in `./store`
 * is the only implementation that ships.
 */

export interface TicketPaymentMetadata {
  eventId: number;
  quantity: number;
  totalInPence: number;
  clerkUserId: string;
  buyerEmail: string;
  buyerName: string;
}

/**
 * Stripe metadata is `Record<string, string>` on the wire; every field here was
 * written by `createCheckoutSession`, so the assertions match the original
 * inline code exactly.
 */
export function parseTicketPaymentMetadata(
  metadata: Record<string, string | undefined>,
): TicketPaymentMetadata {
  return {
    eventId: Number(metadata.eventId),
    quantity: Number(metadata.quantity),
    totalInPence: Number(metadata.totalInPence),
    clerkUserId: metadata.clerkUserId!,
    buyerEmail: metadata.buyerEmail!,
    buyerName: metadata.buyerName!,
  };
}

export interface NewTicketOrder {
  clerkUserId: string;
  eventId: number;
  quantity: number;
  totalInPence: number;
  status: "completed";
  stripePaymentIntentId: string;
  buyerEmail: string;
  buyerName: string;
}

export interface NewTicket {
  orderId: number;
  eventId: number;
  ticketCode: string;
}

export interface TicketFulfilmentStore {
  /** Idempotency: has this payment intent already produced an order? */
  findOrderIdByPaymentIntent(
    paymentIntentId: string,
  ): Promise<number | undefined>;
  /** `SELECT ... FOR UPDATE` on the event row. */
  lockEvent(eventId: number): Promise<ConfirmationEvent | undefined>;
  insertOrder(values: NewTicketOrder): Promise<{ id: number }>;
  incrementTicketsSold(eventId: number, quantity: number): Promise<void>;
  insertTickets(rows: NewTicket[]): Promise<void>;
}

export interface TicketFulfilmentDeps {
  store: TicketFulfilmentStore;
  sendConfirmation(params: SendTicketConfirmationParams): Promise<void>;
  /** Overridden in tests so ticket codes are deterministic. */
  generateCode?: () => string;
}

export type TicketFulfilmentResult =
  | { status: "already-fulfilled" }
  | { status: "event-missing" }
  | { status: "fulfilled"; orderId: number; ticketCodes: string[] };

export async function fulfilTicketPayment(
  payment: {
    paymentIntentId: string;
    metadata: Record<string, string | undefined>;
  },
  deps: TicketFulfilmentDeps,
): Promise<TicketFulfilmentResult> {
  const existingOrderId = await deps.store.findOrderIdByPaymentIntent(
    payment.paymentIntentId,
  );
  if (existingOrderId !== undefined) {
    return { status: "already-fulfilled" };
  }

  const meta = parseTicketPaymentMetadata(payment.metadata);

  const event = await deps.store.lockEvent(meta.eventId);
  if (!event) {
    return { status: "event-missing" };
  }

  const order = await deps.store.insertOrder({
    clerkUserId: meta.clerkUserId,
    eventId: meta.eventId,
    quantity: meta.quantity,
    totalInPence: meta.totalInPence,
    status: "completed",
    stripePaymentIntentId: payment.paymentIntentId,
    buyerEmail: meta.buyerEmail,
    buyerName: meta.buyerName,
  });

  await deps.store.incrementTicketsSold(meta.eventId, meta.quantity);

  const ticketCodes = generateTicketCodes(meta.quantity, deps.generateCode);
  await deps.store.insertTickets(
    ticketCodes.map((ticketCode) => ({
      orderId: order.id,
      eventId: meta.eventId,
      ticketCode,
    })),
  );

  await deps.sendConfirmation(
    buildTicketConfirmation({
      event,
      buyerEmail: meta.buyerEmail,
      buyerName: meta.buyerName,
      orderId: order.id,
      quantity: meta.quantity,
      totalInPence: meta.totalInPence,
      ticketCodes,
    }),
  );

  return { status: "fulfilled", orderId: order.id, ticketCodes };
}
