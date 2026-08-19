import type { SendTicketConfirmationParams } from "@disco/email";

export interface ConfirmationEvent {
  title: string;
  date: Date | string;
  day: string | null;
  time: string;
  venue: string;
  location: string;
}

/**
 * `"Saturday, 21 June 2026"` when the event carries a `day`, otherwise just the
 * date. `en-GB` is hard-coded — every event is in the UK.
 */
export function formatEventDate(
  event: Pick<ConfirmationEvent, "date" | "day">,
) {
  const date = new Date(event.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return event.day ? `${event.day}, ${date}` : date;
}

export interface BuildTicketConfirmationInput {
  event: ConfirmationEvent;
  buyerEmail: string;
  buyerName: string;
  orderId: number;
  quantity: number;
  totalInPence: number;
  ticketCodes: string[];
}

export function buildTicketConfirmation(
  input: BuildTicketConfirmationInput,
): SendTicketConfirmationParams {
  return {
    buyerEmail: input.buyerEmail,
    buyerName: input.buyerName,
    eventTitle: input.event.title,
    eventDate: formatEventDate(input.event),
    eventTime: input.event.time,
    eventVenue: input.event.venue,
    eventLocation: input.event.location,
    orderId: input.orderId,
    quantity: input.quantity,
    totalInPence: input.totalInPence,
    ticketCodes: input.ticketCodes,
  };
}
