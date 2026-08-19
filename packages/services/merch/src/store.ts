import { eq, sql } from "drizzle-orm";

import type { db } from "@disco/db";
import { merchItems, merchOrders, merchSizes } from "@disco/db/schema";

import type { MerchFulfilmentStore, NewMerchOrder } from "./fulfil";

type Transaction = Parameters<Parameters<(typeof db)["transaction"]>[0]>[0];

/** The Drizzle implementation of the port. Runs inside the caller's transaction. */
export function createDrizzleMerchStore(tx: Transaction): MerchFulfilmentStore {
  return {
    async findOrderIdByPaymentIntent(paymentIntentId) {
      const [existing] = await tx
        .select({ id: merchOrders.id })
        .from(merchOrders)
        .where(eq(merchOrders.stripePaymentIntentId, paymentIntentId));
      return existing?.id;
    },

    async insertOrder(values: NewMerchOrder) {
      const [order] = await tx.insert(merchOrders).values(values).returning();
      return { id: order!.id };
    },

    async incrementSizeSold(merchSizeId, quantity) {
      await tx
        .update(merchSizes)
        .set({ sold: sql`${merchSizes.sold} + ${quantity}` })
        .where(eq(merchSizes.id, merchSizeId));
    },

    async findItemTitle(merchItemId) {
      const [item] = await tx
        .select()
        .from(merchItems)
        .where(eq(merchItems.id, merchItemId));
      return item?.title;
    },
  };
}
