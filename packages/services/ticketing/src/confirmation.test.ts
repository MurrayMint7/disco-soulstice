import { describe, expect, it } from "vitest";

import { buildTicketConfirmation, formatEventDate } from "./confirmation";

const event = {
  title: "Disco Soulstice VI",
  date: new Date("2026-06-21T20:00:00Z"),
  day: "Saturday",
  time: "8pm — late",
  venue: "The Basement",
  location: "Leeds",
};

describe("formatEventDate", () => {
  it("prefixes the day when the event has one", () => {
    expect(formatEventDate(event)).toBe("Saturday, 21 June 2026");
  });

  it("omits the prefix when it does not", () => {
    expect(formatEventDate({ ...event, day: null })).toBe("21 June 2026");
  });
});

describe("buildTicketConfirmation", () => {
  it("flattens the event onto the email payload", () => {
    expect(
      buildTicketConfirmation({
        event,
        buyerEmail: "buyer@example.com",
        buyerName: "Ada Lovelace",
        orderId: 42,
        quantity: 2,
        totalInPence: 3000,
        ticketCodes: ["code-1", "code-2"],
      }),
    ).toEqual({
      buyerEmail: "buyer@example.com",
      buyerName: "Ada Lovelace",
      eventTitle: "Disco Soulstice VI",
      eventDate: "Saturday, 21 June 2026",
      eventTime: "8pm — late",
      eventVenue: "The Basement",
      eventLocation: "Leeds",
      orderId: 42,
      quantity: 2,
      totalInPence: 3000,
      ticketCodes: ["code-1", "code-2"],
    });
  });
});
