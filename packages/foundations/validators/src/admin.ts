import { z } from "zod";

export const adminOrdersFilterSchema = z.object({
  eventId: z.number().optional(),
});

export const adminEventSalesSchema = z.object({ eventId: z.number() });
