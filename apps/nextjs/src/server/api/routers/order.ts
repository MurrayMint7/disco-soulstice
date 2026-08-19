import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";

import { createTRPCRouter, authedProcedure } from "~/server/api/trpc";
import { orders, events, tickets } from "~/server/db/schema";
import { stripe } from "~/server/stripe";

export const orderRouter = createTRPCRouter({
  createCheckoutSession: authedProcedure
    .input(
      z.object({
        eventId: z.number(),
        quantity: z.number().int().min(1).max(4),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const client = await clerkClient();
      const user = await client.users.getUser(ctx.userId);
      const buyerEmail = user.emailAddresses[0]?.emailAddress ?? "";
      const buyerName =
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

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

        const paymentIntent = await stripe.paymentIntents.create({
          amount: totalInPence,
          currency: "gbp",
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
    .input(z.object({ orderId: z.number() }))
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
    .input(z.object({ paymentIntentId: z.string() }))
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
