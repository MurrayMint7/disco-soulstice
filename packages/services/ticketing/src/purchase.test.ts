import { describe, expect, it } from "vitest";

import { calculateTicketTotal, checkTicketPurchase } from "./purchase";

const onSale = {
  status: "on-sale",
  priceInPence: 1500,
  totalTickets: 100,
  ticketsSold: 10,
  maxPerOrder: 4,
};

describe("checkTicketPurchase", () => {
  it("allows a purchase within capacity and per-order limit, and prices it", () => {
    expect(checkTicketPurchase(onSale, 4)).toEqual({
      ok: true,
      totalInPence: 6000,
    });
  });

  it("refuses an event that is not on sale", () => {
    expect(
      checkTicketPurchase({ ...onSale, status: "coming-soon" }, 1),
    ).toEqual({
      ok: false,
      problem: { code: "BAD_REQUEST", message: "Event is not on sale" },
    });
  });

  it("refuses an event with no price or no ticket allocation", () => {
    const noPrice = {
      code: "BAD_REQUEST",
      message: "Event has no ticket price",
    };
    expect(checkTicketPurchase({ ...onSale, priceInPence: null }, 1)).toEqual({
      ok: false,
      problem: noPrice,
    });
    expect(checkTicketPurchase({ ...onSale, totalTickets: null }, 1)).toEqual({
      ok: false,
      problem: noPrice,
    });
  });

  it("refuses more than maxPerOrder, naming the limit", () => {
    expect(checkTicketPurchase(onSale, 5)).toEqual({
      ok: false,
      problem: {
        code: "BAD_REQUEST",
        message: "Maximum 4 tickets per order",
      },
    });
  });

  it("refuses more tickets than remain, as CONFLICT", () => {
    const nearlySoldOut = {
      ...onSale,
      totalTickets: 100,
      ticketsSold: 98,
      maxPerOrder: 4,
    };
    expect(checkTicketPurchase(nearlySoldOut, 3)).toEqual({
      ok: false,
      problem: { code: "CONFLICT", message: "Not enough tickets available" },
    });
    expect(checkTicketPurchase(nearlySoldOut, 2)).toEqual({
      ok: true,
      totalInPence: 3000,
    });
  });

  it("checks the per-order limit before capacity", () => {
    const soldOut = { ...onSale, totalTickets: 100, ticketsSold: 100 };
    const check = checkTicketPurchase(soldOut, 5);
    expect(check.ok).toBe(false);
    expect(check.ok ? null : check.problem.code).toBe("BAD_REQUEST");
  });
});

describe("calculateTicketTotal", () => {
  it("is price times quantity", () => {
    expect(calculateTicketTotal(1500, 3)).toBe(4500);
  });
});
