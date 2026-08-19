import { describe, expect, it, vi } from "vitest";

import type { SendMerchConfirmationParams } from "@disco/email";

import {
  fulfilMerchPayment,
  parseMerchPaymentMetadata,
  type MerchFulfilmentStore,
  type NewMerchOrder,
} from "./fulfil";

const metadata = {
  type: "merch",
  merchItemId: "3",
  merchSizeId: "11",
  size: "L",
  quantity: "2",
  totalInPence: "5000",
  clerkUserId: "user_123",
  buyerEmail: "buyer@example.com",
  buyerName: "Ada Lovelace",
};

function createStore(overrides: Partial<MerchFulfilmentStore> = {}) {
  const insertedOrders: NewMerchOrder[] = [];
  const increments: { merchSizeId: number; quantity: number }[] = [];

  const store: MerchFulfilmentStore = {
    findOrderIdByPaymentIntent: vi.fn(() => Promise.resolve(undefined)),
    insertOrder: vi.fn((values: NewMerchOrder) => {
      insertedOrders.push(values);
      return Promise.resolve({ id: 77 });
    }),
    incrementSizeSold: vi.fn((merchSizeId: number, quantity: number) => {
      increments.push({ merchSizeId, quantity });
      return Promise.resolve();
    }),
    findItemTitle: vi.fn(() => Promise.resolve<string | undefined>("Tote Bag")),
    ...overrides,
  };

  return { store, insertedOrders, increments };
}

function createDeps(store: MerchFulfilmentStore) {
  const sent: SendMerchConfirmationParams[] = [];
  return {
    sent,
    deps: {
      store,
      sendConfirmation: (params: SendMerchConfirmationParams) => {
        sent.push(params);
        return Promise.resolve();
      },
    },
  };
}

describe("parseMerchPaymentMetadata", () => {
  it("coerces the numeric fields Stripe returns as strings", () => {
    expect(parseMerchPaymentMetadata(metadata)).toEqual({
      merchItemId: 3,
      merchSizeId: 11,
      size: "L",
      quantity: 2,
      totalInPence: 5000,
      clerkUserId: "user_123",
      buyerEmail: "buyer@example.com",
      buyerName: "Ada Lovelace",
    });
  });
});

describe("fulfilMerchPayment", () => {
  it("writes the order, increments sold by the quantity, then emails", async () => {
    const { store, insertedOrders, increments } = createStore();
    const { deps, sent } = createDeps(store);

    const result = await fulfilMerchPayment(
      { paymentIntentId: "pi_2", metadata },
      deps,
    );

    expect(result).toEqual({ status: "fulfilled", orderId: 77 });

    expect(insertedOrders).toEqual([
      {
        clerkUserId: "user_123",
        merchItemId: 3,
        merchSizeId: 11,
        size: "L",
        quantity: 2,
        totalInPence: 5000,
        status: "completed",
        stripePaymentIntentId: "pi_2",
        buyerEmail: "buyer@example.com",
        buyerName: "Ada Lovelace",
      },
    ]);

    expect(increments).toEqual([{ merchSizeId: 11, quantity: 2 }]);

    expect(sent).toEqual([
      {
        buyerEmail: "buyer@example.com",
        buyerName: "Ada Lovelace",
        itemTitle: "Tote Bag",
        size: "L",
        quantity: 2,
        totalInPence: 5000,
        orderId: 77,
      },
    ]);
  });

  it("falls back to a generic title when the item row has gone", async () => {
    const { store } = createStore({
      findItemTitle: vi.fn(() => Promise.resolve(undefined)),
    });
    const { deps, sent } = createDeps(store);

    await fulfilMerchPayment({ paymentIntentId: "pi_2", metadata }, deps);

    expect(sent[0]?.itemTitle).toBe("Merch Item");
  });

  it("is idempotent: an existing order for the payment intent is a no-op", async () => {
    const { store, insertedOrders, increments } = createStore({
      findOrderIdByPaymentIntent: vi.fn(() => Promise.resolve(5)),
    });
    const { deps, sent } = createDeps(store);

    const result = await fulfilMerchPayment(
      { paymentIntentId: "pi_2", metadata },
      deps,
    );

    expect(result).toEqual({ status: "already-fulfilled" });
    expect(insertedOrders).toEqual([]);
    expect(increments).toEqual([]);
    expect(sent).toEqual([]);
  });
});
