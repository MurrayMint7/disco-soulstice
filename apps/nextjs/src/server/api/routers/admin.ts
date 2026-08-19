import { z } from "zod";
import { eq, sql, desc } from "drizzle-orm";

import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { orders, events, tickets } from "@disco/db/schema";

export const adminRouter = createTRPCRouter({
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [revenueResult] = await ctx.db
      .select({ total: sql<number>`sum(${orders.totalInPence})` })
      .from(orders)
      .where(eq(orders.status, "completed"));

    const [ordersResult] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.status, "completed"));

    const [ticketsResult] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(tickets);

    return {
      totalRevenueInPence: revenueResult?.total ?? 0,
      totalOrders: ordersResult?.count ?? 0,
      totalTicketsSold: ticketsResult?.count ?? 0,
    };
  }),

  getOrders: adminProcedure
    .input(z.object({ eventId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(orders)
        .leftJoin(events, eq(orders.eventId, events.id))
        .where(input.eventId ? eq(orders.eventId, input.eventId) : undefined)
        .orderBy(desc(orders.createdAt));
    }),

  getEventSales: adminProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      const [event] = await ctx.db
        .select()
        .from(events)
        .where(eq(events.id, input.eventId));

      const eventOrders = await ctx.db
        .select()
        .from(orders)
        .where(eq(orders.eventId, input.eventId))
        .orderBy(desc(orders.createdAt));

      return { event, orders: eventOrders };
    }),
});
