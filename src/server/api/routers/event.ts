import { z } from "zod";
import { eq, asc, desc, gte, lt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { events, orders } from "~/server/db/schema";

export const eventRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(events).orderBy(asc(events.date));
  }),

  listUpcoming: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(events)
      .where(gte(events.date, new Date()))
      .orderBy(asc(events.date));
  }),

  listPast: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(events)
      .where(lt(events.date, new Date()))
      .orderBy(desc(events.date));
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db
        .select()
        .from(events)
        .where(eq(events.slug, input.slug))
        .limit(1);
      if (!event[0]) throw new TRPCError({ code: "NOT_FOUND" });
      return event[0];
    }),

  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db
        .select()
        .from(events)
        .where(eq(events.id, input.id))
        .limit(1);
      if (!event[0]) throw new TRPCError({ code: "NOT_FOUND" });
      return event[0];
    }),

  create: adminProcedure
    .input(
      z.object({
        title: z.string(),
        slug: z.string(),
        date: z.date(),
        day: z.string().optional(),
        time: z.string(),
        venue: z.string(),
        location: z.string(),
        description: z.string().optional(),
        image: z.string().url(),
        status: z.enum(["on-sale", "coming-soon", "sold-out", "free-event"]),
        priceInPence: z.number().int().positive().optional(),
        totalTickets: z.number().int().positive().optional(),
        maxPerOrder: z.number().int().positive().default(4),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [event] = await ctx.db.insert(events).values(input).returning();
      return event;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        slug: z.string().optional(),
        date: z.date().optional(),
        day: z.string().optional(),
        time: z.string().optional(),
        venue: z.string().optional(),
        location: z.string().optional(),
        description: z.string().optional(),
        image: z.string().url().optional(),
        status: z
          .enum(["on-sale", "coming-soon", "sold-out", "free-event"])
          .optional(),
        priceInPence: z.number().int().positive().nullable().optional(),
        totalTickets: z.number().int().positive().nullable().optional(),
        maxPerOrder: z.number().int().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [event] = await ctx.db
        .update(events)
        .set(data)
        .where(eq(events.id, id))
        .returning();
      return event;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: orders.id })
        .from(orders)
        .where(eq(orders.eventId, input.id))
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Cannot delete an event that has orders. Cancel or refund all orders first.",
        });
      }

      await ctx.db.delete(events).where(eq(events.id, input.id));
    }),
});
