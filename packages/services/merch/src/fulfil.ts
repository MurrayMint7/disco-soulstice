import type { SendMerchConfirmationParams } from "@disco/email";

import { buildMerchConfirmation } from "./confirmation";

/**
 * The merch half of `payment_intent.succeeded`, lifted out of the webhook route.
 * Same shape as the ticketing service: a narrow store port, so the tests need
 * no database.
 */

export interface MerchPaymentMetadata {
  merchItemId: number;
  merchSizeId: number;
  size: string;
  quantity: number;
  totalInPence: number;
  clerkUserId: string;
  buyerEmail: string;
  buyerName: string;
}

export function parseMerchPaymentMetadata(
  metadata: Record<string, string | undefined>,
): MerchPaymentMetadata {
  return {
    merchItemId: Number(metadata.merchItemId),
    merchSizeId: Number(metadata.merchSizeId),
    size: metadata.size!,
    quantity: Number(metadata.quantity),
    totalInPence: Number(metadata.totalInPence),
    clerkUserId: metadata.clerkUserId!,
    buyerEmail: metadata.buyerEmail!,
    buyerName: metadata.buyerName!,
  };
}

export interface NewMerchOrder {
  clerkUserId: string;
  merchItemId: number;
  merchSizeId: number;
  size: string;
  quantity: number;
  totalInPence: number;
  status: "completed";
  stripePaymentIntentId: string;
  buyerEmail: string;
  buyerName: string;
}

export interface MerchFulfilmentStore {
  /** Idempotency: has this payment intent already produced an order? */
  findOrderIdByPaymentIntent(
    paymentIntentId: string,
  ): Promise<number | undefined>;
  insertOrder(values: NewMerchOrder): Promise<{ id: number }>;
  incrementSizeSold(merchSizeId: number, quantity: number): Promise<void>;
  findItemTitle(merchItemId: number): Promise<string | undefined>;
}

export interface MerchFulfilmentDeps {
  store: MerchFulfilmentStore;
  sendConfirmation(params: SendMerchConfirmationParams): Promise<void>;
}

export type MerchFulfilmentResult =
  { status: "already-fulfilled" } | { status: "fulfilled"; orderId: number };

export async function fulfilMerchPayment(
  payment: {
    paymentIntentId: string;
    metadata: Record<string, string | undefined>;
  },
  deps: MerchFulfilmentDeps,
): Promise<MerchFulfilmentResult> {
  const existingOrderId = await deps.store.findOrderIdByPaymentIntent(
    payment.paymentIntentId,
  );
  if (existingOrderId !== undefined) {
    return { status: "already-fulfilled" };
  }

  const meta = parseMerchPaymentMetadata(payment.metadata);

  const order = await deps.store.insertOrder({
    clerkUserId: meta.clerkUserId,
    merchItemId: meta.merchItemId,
    merchSizeId: meta.merchSizeId,
    size: meta.size,
    quantity: meta.quantity,
    totalInPence: meta.totalInPence,
    status: "completed",
    stripePaymentIntentId: payment.paymentIntentId,
    buyerEmail: meta.buyerEmail,
    buyerName: meta.buyerName,
  });

  await deps.store.incrementSizeSold(meta.merchSizeId, meta.quantity);

  const itemTitle = await deps.store.findItemTitle(meta.merchItemId);

  await deps.sendConfirmation(
    buildMerchConfirmation({
      buyerEmail: meta.buyerEmail,
      buyerName: meta.buyerName,
      itemTitle,
      size: meta.size,
      quantity: meta.quantity,
      totalInPence: meta.totalInPence,
      orderId: order.id,
    }),
  );

  return { status: "fulfilled", orderId: order.id };
}
