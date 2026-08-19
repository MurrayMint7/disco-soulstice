import { z } from "zod";

export const ticketCheckoutSchema = z.object({
  eventId: z.number(),
  quantity: z.number().int().min(1).max(4),
});

export const orderByIdSchema = z.object({ orderId: z.number() });
export const orderByPaymentIntentSchema = z.object({
  paymentIntentId: z.string(),
});

export type TicketCheckoutInput = z.infer<typeof ticketCheckoutSchema>;
