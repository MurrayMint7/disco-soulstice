import { eq, asc, desc, gte, lt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure, adminProcedure } from "@disco/trpc";
import { events, orders } from "@disco/db/schema";
import { deleteBlob } from "@disco/storage";
import {
  eventByIdSchema,
  eventBySlugSchema,
  eventCreateSchema,
  eventUpdateSchema,
} from "@disco/validators";

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
    .input(eventBySlugSchema)
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
    .input(eventByIdSchema)
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
    .input(eventCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const [event] = await ctx.db.insert(events).values(input).returning();
      return event;
    }),

  update: adminProcedure
    .input(eventUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      if (data.image) {
        const [existing] = await ctx.db
          .select({ imagePathname: events.imagePathname })
          .from(events)
          .where(eq(events.id, id))
          .limit(1);

        if (
          existing?.imagePathname &&
          existing.imagePathname !== data.imagePathname
        ) {
          await deleteBlob(existing.imagePathname);
        }
      }

      const [event] = await ctx.db
        .update(events)
        .set(data)
        .where(eq(events.id, id))
        .returning();
      return event;
    }),

  delete: adminProcedure
    .input(eventByIdSchema)
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

      const [event] = await ctx.db
        .select({ imagePathname: events.imagePathname })
        .from(events)
        .where(eq(events.id, input.id))
        .limit(1);

      await ctx.db.delete(events).where(eq(events.id, input.id));

      if (event?.imagePathname) {
        await deleteBlob(event.imagePathname);
      }
    }),
});
