import { z } from "zod";

export const eventStatusSchema = z.enum([
  "on-sale",
  "coming-soon",
  "sold-out",
  "free-event",
]);

export type EventStatus = z.infer<typeof eventStatusSchema>;

export const eventCreateSchema = z.object({
  title: z.string(),
  slug: z.string(),
  date: z.date(),
  day: z.string().optional(),
  time: z.string(),
  venue: z.string(),
  location: z.string(),
  description: z.string().optional(),
  image: z.string().url(),
  imagePathname: z.string().optional(),
  status: eventStatusSchema,
  priceInPence: z.number().int().positive().optional(),
  totalTickets: z.number().int().positive().optional(),
  maxPerOrder: z.number().int().positive().default(4),
});

export const eventUpdateSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  slug: z.string().optional(),
  date: z.date().optional(),
  day: z.string().optional(),
  time: z.string().optional(),
  venue: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  imagePathname: z.string().optional(),
  status: eventStatusSchema.optional(),
  priceInPence: z.number().int().positive().nullable().optional(),
  totalTickets: z.number().int().positive().nullable().optional(),
  maxPerOrder: z.number().int().positive().optional(),
});

export const eventBySlugSchema = z.object({ slug: z.string() });
export const eventByIdSchema = z.object({ id: z.number() });

export type EventCreateInput = z.infer<typeof eventCreateSchema>;
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;
