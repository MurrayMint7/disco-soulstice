import { eq, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { getUserProfile } from "@disco/auth";
import { createPaymentIntent } from "@disco/payments";
import { createTRPCRouter, authedProcedure } from "@disco/trpc";
import { orders, events, tickets } from "@disco/db/schema";
import {
  orderByIdSchema,
  orderByPaymentIntentSchema,
  ticketCheckoutSchema,
} from "@disco/validators";

export const orderRouter = createTRPCRouter({
  createCheckoutSession: authedProcedure
    .input(ticketCheckoutSchema)
    .mutation(async ({ ctx, input }) => {
      const { email: buyerEmail, name: buyerName } = await getUserProfile(
        ctx.userId,
      );

      return ctx.db.transaction(async (tx) => {
        const [event] = await tx
          .select()
          .from(events)
          .where(eq(events.id, input.eventId))
          .for("update");

        if (!event)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Event not found",
          });
        if (event.status !== "on-sale")
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Event is not on sale",
          });
        if (!event.priceInPence || !event.totalTickets)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Event has no ticket price",
          });
        if (input.quantity > event.maxPerOrder)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Maximum ${event.maxPerOrder} tickets per order`,
          });

        const remaining = event.totalTickets - event.ticketsSold;
        if (remaining < input.quantity)
          throw new TRPCError({
            code: "CONFLICT",
            message: "Not enough tickets available",
          });

        const totalInPence = event.priceInPence * input.quantity;

        const paymentIntent = await createPaymentIntent({
          amountInPence: totalInPence,
          metadata: {
            type: "event",
            eventId: event.id.toString(),
            quantity: input.quantity.toString(),
            totalInPence: totalInPence.toString(),
            clerkUserId: ctx.userId,
            buyerEmail,
            buyerName,
          },
        });

        return {
          clientSecret: paymentIntent.client_secret,
        };
      });
    }),

  getMyOrders: authedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(orders)
      .where(eq(orders.clerkUserId, ctx.userId))
      .leftJoin(events, eq(orders.eventId, events.id))
      .orderBy(sql`${orders.createdAt} desc`);
  }),

  getById: authedProcedure
    .input(orderByIdSchema)
    .query(async ({ ctx, input }) => {
      const [order] = await ctx.db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.id, input.orderId),
            eq(orders.clerkUserId, ctx.userId),
          ),
        )
        .leftJoin(events, eq(orders.eventId, events.id));

      if (!order) throw new TRPCError({ code: "NOT_FOUND" });

      const orderTickets = await ctx.db
        .select()
        .from(tickets)
        .where(eq(tickets.orderId, input.orderId));

      return { ...order, tickets: orderTickets };
    }),

  getByPaymentIntent: authedProcedure
    .input(orderByPaymentIntentSchema)
    .query(async ({ ctx, input }) => {
      const [order] = await ctx.db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.stripePaymentIntentId, input.paymentIntentId),
            eq(orders.clerkUserId, ctx.userId),
          ),
        )
        .leftJoin(events, eq(orders.eventId, events.id));

      if (!order) return null;

      const orderTickets = await ctx.db
        .select()
        .from(tickets)
        .where(eq(tickets.orderId, order.order.id));

      return { ...order, tickets: orderTickets };
    }),
});
