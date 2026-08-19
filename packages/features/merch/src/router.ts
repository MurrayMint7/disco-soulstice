import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { getUserProfile } from "@disco/auth";
import {
  calculateMerchTotal,
  checkMerchItemPurchase,
  checkMerchStock,
} from "@disco/merch-service";
import { createPaymentIntent } from "@disco/payments";
import { deleteBlob } from "@disco/storage";
import {
  createTRPCRouter,
  publicProcedure,
  authedProcedure,
  adminProcedure,
} from "@disco/trpc";
import { merchItems, merchSizes, merchOrders } from "@disco/db/schema";
import {
  merchCheckoutSchema,
  merchItemByIdSchema,
  merchItemBySlugSchema,
  merchItemCreateSchema,
  merchItemUpdateSchema,
  merchOrdersFilterSchema,
  merchSizeByIdSchema,
  merchSizeCreateSchema,
  merchSizeUpdateSchema,
  orderByIdSchema,
  orderByPaymentIntentSchema,
} from "@disco/validators";

export const merchRouter = createTRPCRouter({
  // ── Public ──────────────────────────────────────────────────────────

  list: publicProcedure.query(async ({ ctx }) => {
    const items = await ctx.db.query.merchItems.findMany({
      with: { sizes: true },
      orderBy: [desc(merchItems.createdAt)],
    });
    return items;
  }),

  getBySlug: publicProcedure
    .input(merchItemBySlugSchema)
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.query.merchItems.findFirst({
        where: eq(merchItems.slug, input.slug),
        with: { sizes: true },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      return item;
    }),

  // ── Authed ──────────────────────────────────────────────────────────

  createCheckoutSession: authedProcedure
    .input(merchCheckoutSchema)
    .mutation(async ({ ctx, input }) => {
      const { email: buyerEmail, name: buyerName } = await getUserProfile(
        ctx.userId,
      );

      return ctx.db.transaction(async (tx) => {
        const [item] = await tx
          .select()
          .from(merchItems)
          .where(eq(merchItems.id, input.merchItemId))
          .for("update");

        if (!item)
          throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });

        const itemProblem = checkMerchItemPurchase(item, input.quantity);
        if (itemProblem) throw new TRPCError(itemProblem);

        const [size] = await tx
          .select()
          .from(merchSizes)
          .where(
            and(
              eq(merchSizes.id, input.merchSizeId),
              eq(merchSizes.merchItemId, item.id),
            ),
          )
          .for("update");

        if (!size)
          throw new TRPCError({ code: "NOT_FOUND", message: "Size not found" });

        const stockProblem = checkMerchStock(size, input.quantity);
        if (stockProblem) throw new TRPCError(stockProblem);

        const totalInPence = calculateMerchTotal(
          item.priceInPence,
          input.quantity,
        );

        const paymentIntent = await createPaymentIntent({
          amountInPence: totalInPence,
          metadata: {
            type: "merch",
            merchItemId: item.id.toString(),
            merchSizeId: size.id.toString(),
            size: size.size,
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

  getMyMerchOrders: authedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(merchOrders)
      .where(eq(merchOrders.clerkUserId, ctx.userId))
      .leftJoin(merchItems, eq(merchOrders.merchItemId, merchItems.id))
      .orderBy(desc(merchOrders.createdAt));
  }),

  getMerchOrderById: authedProcedure
    .input(orderByIdSchema)
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(merchOrders)
        .where(
          and(
            eq(merchOrders.id, input.orderId),
            eq(merchOrders.clerkUserId, ctx.userId),
          ),
        )
        .leftJoin(merchItems, eq(merchOrders.merchItemId, merchItems.id));

      if (!row) throw new TRPCError({ code: "NOT_FOUND" });
      return row;
    }),

  getMerchOrderByPaymentIntent: authedProcedure
    .input(orderByPaymentIntentSchema)
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(merchOrders)
        .where(
          and(
            eq(merchOrders.stripePaymentIntentId, input.paymentIntentId),
            eq(merchOrders.clerkUserId, ctx.userId),
          ),
        )
        .leftJoin(merchItems, eq(merchOrders.merchItemId, merchItems.id));

      if (!row) return null;
      return row;
    }),

  // ── Admin ───────────────────────────────────────────────────────────

  getById: adminProcedure
    .input(merchItemByIdSchema)
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.query.merchItems.findFirst({
        where: eq(merchItems.id, input.id),
        with: { sizes: true },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      return item;
    }),

  create: adminProcedure
    .input(merchItemCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { sizes, ...itemData } = input;
      return ctx.db.transaction(async (tx) => {
        const [item] = await tx.insert(merchItems).values(itemData).returning();

        if (sizes.length > 0) {
          await tx.insert(merchSizes).values(
            sizes.map((s) => ({
              merchItemId: item!.id,
              size: s.size,
              stock: s.stock,
            })),
          );
        }

        return tx.query.merchItems.findFirst({
          where: eq(merchItems.id, item!.id),
          with: { sizes: true },
        });
      });
    }),

  update: adminProcedure
    .input(merchItemUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      if (data.image) {
        const [existing] = await ctx.db
          .select({ imagePathname: merchItems.imagePathname })
          .from(merchItems)
          .where(eq(merchItems.id, id))
          .limit(1);

        if (
          existing?.imagePathname &&
          existing.imagePathname !== data.imagePathname
        ) {
          await deleteBlob(existing.imagePathname);
        }
      }

      const [updated] = await ctx.db
        .update(merchItems)
        .set(data)
        .where(eq(merchItems.id, id))
        .returning();
      return updated;
    }),

  addSize: adminProcedure
    .input(merchSizeCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const [size] = await ctx.db.insert(merchSizes).values(input).returning();
      return size;
    }),

  updateSize: adminProcedure
    .input(merchSizeUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { sizeId, ...data } = input;
      const [updated] = await ctx.db
        .update(merchSizes)
        .set(data)
        .where(eq(merchSizes.id, sizeId))
        .returning();
      return updated;
    }),

  deleteSize: adminProcedure
    .input(merchSizeByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: merchOrders.id })
        .from(merchOrders)
        .where(
          and(
            eq(merchOrders.merchSizeId, input.sizeId),
            eq(merchOrders.status, "completed"),
          ),
        )
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cannot delete a size that has completed orders.",
        });
      }

      await ctx.db.delete(merchSizes).where(eq(merchSizes.id, input.sizeId));
    }),

  delete: adminProcedure
    .input(merchItemByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: merchOrders.id })
        .from(merchOrders)
        .where(
          and(
            eq(merchOrders.merchItemId, input.id),
            eq(merchOrders.status, "completed"),
          ),
        )
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cannot delete an item that has completed orders.",
        });
      }

      const [item] = await ctx.db
        .select({ imagePathname: merchItems.imagePathname })
        .from(merchItems)
        .where(eq(merchItems.id, input.id))
        .limit(1);

      await ctx.db.transaction(async (tx) => {
        await tx.delete(merchSizes).where(eq(merchSizes.merchItemId, input.id));
        await tx.delete(merchItems).where(eq(merchItems.id, input.id));
      });

      if (item?.imagePathname) {
        await deleteBlob(item.imagePathname);
      }
    }),

  adminGetOrders: adminProcedure
    .input(merchOrdersFilterSchema)
    .query(async ({ ctx, input }) => {
      const query = ctx.db
        .select()
        .from(merchOrders)
        .leftJoin(merchItems, eq(merchOrders.merchItemId, merchItems.id))
        .orderBy(desc(merchOrders.createdAt));

      if (input?.merchItemId) {
        return query.where(eq(merchOrders.merchItemId, input.merchItemId));
      }
      return query;
    }),
});
