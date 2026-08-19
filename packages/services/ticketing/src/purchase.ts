/**
 * The capacity and price guards that stand between a checkout request and a
 * Stripe payment intent. Lifted verbatim from `orderRouter.createCheckoutSession`,
 * messages included.
 *
 * The check returns a problem rather than throwing, so a router can write
 * `if (!check.ok) throw new TRPCError(check.problem)` — the problem's shape is
 * deliberately `TRPCError`'s constructor argument, without this package
 * depending on tRPC. It returns the order total on the way through, because
 * that is the one place the nullable `priceInPence` has been proven present.
 */

export interface PurchaseProblem {
  code: "BAD_REQUEST" | "CONFLICT" | "NOT_FOUND";
  message: string;
}

export interface TicketedEvent {
  status: string;
  priceInPence: number | null;
  totalTickets: number | null;
  ticketsSold: number;
  maxPerOrder: number;
}

export type TicketPurchaseCheck =
  { ok: false; problem: PurchaseProblem } | { ok: true; totalInPence: number };

export function checkTicketPurchase(
  event: TicketedEvent,
  quantity: number,
): TicketPurchaseCheck {
  const refuse = (problem: PurchaseProblem): TicketPurchaseCheck => ({
    ok: false,
    problem,
  });

  if (event.status !== "on-sale") {
    return refuse({ code: "BAD_REQUEST", message: "Event is not on sale" });
  }
  if (!event.priceInPence || !event.totalTickets) {
    return refuse({
      code: "BAD_REQUEST",
      message: "Event has no ticket price",
    });
  }
  if (quantity > event.maxPerOrder) {
    return refuse({
      code: "BAD_REQUEST",
      message: `Maximum ${event.maxPerOrder} tickets per order`,
    });
  }

  const remaining = event.totalTickets - event.ticketsSold;
  if (remaining < quantity) {
    return refuse({
      code: "CONFLICT",
      message: "Not enough tickets available",
    });
  }

  return {
    ok: true,
    totalInPence: calculateTicketTotal(event.priceInPence, quantity),
  };
}

export function calculateTicketTotal(
  priceInPence: number,
  quantity: number,
): number {
  return priceInPence * quantity;
}
