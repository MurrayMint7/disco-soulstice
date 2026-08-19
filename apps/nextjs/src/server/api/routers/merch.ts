import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";

import {
  createTRPCRouter,
  publicProcedure,
  authedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { merchItems, merchSizes, merchOrders } from "~/server/db/schema";
import { stripe } from "~/server/stripe";

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
    .input(z.object({ slug: z.string() }))
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
    .input(
      z.object({
        merchItemId: z.number(),
        merchSizeId: z.number(),
        quantity: z.number().int().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const client = await clerkClient();
      const user = await client.users.getUser(ctx.userId);
      const buyerEmail = user.emailAddresses[0]?.emailAddress ?? "";
      const buyerName =
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

      return ctx.db.transaction(async (tx) => {
        const [item] = await tx
          .select()
          .from(merchItems)
          .where(eq(merchItems.id, input.merchItemId))
          .for("update");

        if (!item)
          throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
        if (item.status !== "available")
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Item is not available for purchase",
          });
        if (input.quantity > item.maxPerOrder)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Maximum ${item.maxPerOrder} per order`,
          });

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

        const available = size.stock - size.sold;
        if (available < input.quantity)
          throw new TRPCError({
            code: "CONFLICT",
            message: "Not enough stock available",
          });

        const totalInPence = item.priceInPence * input.quantity;

        const paymentIntent = await stripe.paymentIntents.create({
          amount: totalInPence,
          currency: "gbp",
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
    .input(z.object({ orderId: z.number() }))
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
    .input(z.object({ paymentIntentId: z.string() }))
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
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.query.merchItems.findFirst({
        where: eq(merchItems.id, input.id),
        with: { sizes: true },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      return item;
    }),

  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        image: z.string().min(1),
        imagePathname: z.string().optional(),
        priceInPence: z.number().int().min(0),
        status: z.enum(["available", "coming-soon", "sold-out", "discontinued"]),
        maxPerOrder: z.number().int().min(1).optional(),
        sizes: z.array(
          z.object({
            size: z.string().min(1),
            stock: z.number().int().min(0),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { sizes, ...itemData } = input;
      return ctx.db.transaction(async (tx) => {
        const [item] = await tx
          .insert(merchItems)
          .values(itemData)
          .returning();

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
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        image: z.string().min(1).optional(),
        imagePathname: z.string().optional(),
        priceInPence: z.number().int().min(0).optional(),
        status: z
          .enum(["available", "coming-soon", "sold-out", "discontinued"])
          .optional(),
        maxPerOrder: z.number().int().min(1).optional(),
      }),
    )
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
          await del(existing.imagePathname);
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
    .input(
      z.object({
        merchItemId: z.number(),
        size: z.string().min(1),
        stock: z.number().int().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [size] = await ctx.db
        .insert(merchSizes)
        .values(input)
        .returning();
      return size;
    }),

  updateSize: adminProcedure
    .input(
      z.object({
        sizeId: z.number(),
        size: z.string().min(1).optional(),
        stock: z.number().int().min(0).optional(),
      }),
    )
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
    .input(z.object({ sizeId: z.number() }))
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
          message:
            "Cannot delete a size that has completed orders.",
        });
      }

      await ctx.db
        .delete(merchSizes)
        .where(eq(merchSizes.id, input.sizeId));
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
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
          message:
            "Cannot delete an item that has completed orders.",
        });
      }

      const [item] = await ctx.db
        .select({ imagePathname: merchItems.imagePathname })
        .from(merchItems)
        .where(eq(merchItems.id, input.id))
        .limit(1);

      await ctx.db.transaction(async (tx) => {
        await tx
          .delete(merchSizes)
          .where(eq(merchSizes.merchItemId, input.id));
        await tx.delete(merchItems).where(eq(merchItems.id, input.id));
      });

      if (item?.imagePathname) {
        await del(item.imagePathname);
      }
    }),

  adminGetOrders: adminProcedure
    .input(z.object({ merchItemId: z.number().optional() }).optional())
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
