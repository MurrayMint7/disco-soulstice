import { describe, expect, it, vi } from "vitest";

import type { SendTicketConfirmationParams } from "@disco/email";

import {
  fulfilTicketPayment,
  parseTicketPaymentMetadata,
  type NewTicket,
  type NewTicketOrder,
  type TicketFulfilmentStore,
} from "./fulfil";
import type { ConfirmationEvent } from "./confirmation";

const metadata = {
  type: "event",
  eventId: "7",
  quantity: "3",
  totalInPence: "4500",
  clerkUserId: "user_123",
  buyerEmail: "buyer@example.com",
  buyerName: "Ada Lovelace",
};

const event: ConfirmationEvent = {
  title: "Disco Soulstice VI",
  date: new Date("2026-06-21T20:00:00Z"),
  day: "Saturday",
  time: "8pm — late",
  venue: "The Basement",
  location: "Leeds",
};

function createStore(overrides: Partial<TicketFulfilmentStore> = {}) {
  const insertedOrders: NewTicketOrder[] = [];
  const insertedTickets: NewTicket[] = [];
  const increments: { eventId: number; quantity: number }[] = [];

  const store: TicketFulfilmentStore = {
    findOrderIdByPaymentIntent: vi.fn(() => Promise.resolve(undefined)),
    lockEvent: vi.fn(() =>
      Promise.resolve<ConfirmationEvent | undefined>(event),
    ),
    insertOrder: vi.fn((values: NewTicketOrder) => {
      insertedOrders.push(values);
      return Promise.resolve({ id: 99 });
    }),
    incrementTicketsSold: vi.fn((eventId: number, quantity: number) => {
      increments.push({ eventId, quantity });
      return Promise.resolve();
    }),
    insertTickets: vi.fn((rows: NewTicket[]) => {
      insertedTickets.push(...rows);
      return Promise.resolve();
    }),
    ...overrides,
  };

  return { store, insertedOrders, insertedTickets, increments };
}

function createDeps(store: TicketFulfilmentStore) {
  const sent: SendTicketConfirmationParams[] = [];
  let next = 0;
  return {
    sent,
    deps: {
      store,
      sendConfirmation: (params: SendTicketConfirmationParams) => {
        sent.push(params);
        return Promise.resolve();
      },
      generateCode: () => `code-${++next}`,
    },
  };
}

describe("parseTicketPaymentMetadata", () => {
  it("coerces the numeric fields Stripe returns as strings", () => {
    expect(parseTicketPaymentMetadata(metadata)).toEqual({
      eventId: 7,
      quantity: 3,
      totalInPence: 4500,
      clerkUserId: "user_123",
      buyerEmail: "buyer@example.com",
      buyerName: "Ada Lovelace",
    });
  });
});

describe("fulfilTicketPayment", () => {
  it("writes the order, the increment, one ticket per unit, then the email", async () => {
    const { store, insertedOrders, insertedTickets, increments } =
      createStore();
    const { deps, sent } = createDeps(store);

    const result = await fulfilTicketPayment(
      { paymentIntentId: "pi_1", metadata },
      deps,
    );

    expect(result).toEqual({
      status: "fulfilled",
      orderId: 99,
      ticketCodes: ["code-1", "code-2", "code-3"],
    });

    expect(insertedOrders).toEqual([
      {
        clerkUserId: "user_123",
        eventId: 7,
        quantity: 3,
        totalInPence: 4500,
        status: "completed",
        stripePaymentIntentId: "pi_1",
        buyerEmail: "buyer@example.com",
        buyerName: "Ada Lovelace",
      },
    ]);

    expect(increments).toEqual([{ eventId: 7, quantity: 3 }]);

    expect(insertedTickets).toEqual([
      { orderId: 99, eventId: 7, ticketCode: "code-1" },
      { orderId: 99, eventId: 7, ticketCode: "code-2" },
      { orderId: 99, eventId: 7, ticketCode: "code-3" },
    ]);

    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      buyerEmail: "buyer@example.com",
      eventTitle: "Disco Soulstice VI",
      eventDate: "Saturday, 21 June 2026",
      orderId: 99,
      quantity: 3,
      totalInPence: 4500,
      ticketCodes: ["code-1", "code-2", "code-3"],
    });
  });

  it("is idempotent: an existing order for the payment intent is a no-op", async () => {
    const lockEvent = vi.fn(() => Promise.resolve(event));
    const { store, insertedOrders } = createStore({
      findOrderIdByPaymentIntent: vi.fn(() => Promise.resolve(5)),
      lockEvent,
    });
    const { deps, sent } = createDeps(store);

    const result = await fulfilTicketPayment(
      { paymentIntentId: "pi_1", metadata },
      deps,
    );

    expect(result).toEqual({ status: "already-fulfilled" });
    expect(insertedOrders).toEqual([]);
    expect(sent).toEqual([]);
    expect(lockEvent).not.toHaveBeenCalled();
  });

  it("bails without writing anything when the event row is gone", async () => {
    const { store, insertedOrders } = createStore({
      lockEvent: vi.fn(() => Promise.resolve(undefined)),
    });
    const { deps, sent } = createDeps(store);

    const result = await fulfilTicketPayment(
      { paymentIntentId: "pi_1", metadata },
      deps,
    );

    expect(result).toEqual({ status: "event-missing" });
    expect(insertedOrders).toEqual([]);
    expect(sent).toEqual([]);
  });
});
