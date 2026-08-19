import { eq, sql } from "drizzle-orm";

import type { db } from "@disco/db";
import { events, orders, tickets } from "@disco/db/schema";

import type {
  NewTicket,
  NewTicketOrder,
  TicketFulfilmentStore,
} from "./fulfil";

type Transaction = Parameters<Parameters<(typeof db)["transaction"]>[0]>[0];

/** The Drizzle implementation of the port. Runs inside the caller's transaction. */
export function createDrizzleTicketStore(
  tx: Transaction,
): TicketFulfilmentStore {
  return {
    async findOrderIdByPaymentIntent(paymentIntentId) {
      const [existing] = await tx
        .select({ id: orders.id })
        .from(orders)
        .where(eq(orders.stripePaymentIntentId, paymentIntentId));
      return existing?.id;
    },

    async lockEvent(eventId) {
      const [event] = await tx
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .for("update");
      return event;
    },

    async insertOrder(values: NewTicketOrder) {
      const [order] = await tx.insert(orders).values(values).returning();
      return { id: order!.id };
    },

    async incrementTicketsSold(eventId, quantity) {
      await tx
        .update(events)
        .set({ ticketsSold: sql`${events.ticketsSold} + ${quantity}` })
        .where(eq(events.id, eventId));
    },

    async insertTickets(rows: NewTicket[]) {
      await tx.insert(tickets).values(rows);
    },
  };
}
