import { z } from "zod";

export const merchStatusSchema = z.enum([
  "available",
  "coming-soon",
  "sold-out",
  "discontinued",
]);

export type MerchStatus = z.infer<typeof merchStatusSchema>;

export const merchCheckoutSchema = z.object({
  merchItemId: z.number(),
  merchSizeId: z.number(),
  quantity: z.number().int().min(1),
});

export const merchItemCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  image: z.string().min(1),
  imagePathname: z.string().optional(),
  priceInPence: z.number().int().min(0),
  status: merchStatusSchema,
  maxPerOrder: z.number().int().min(1).optional(),
  sizes: z.array(
    z.object({
      size: z.string().min(1),
      stock: z.number().int().min(0),
    }),
  ),
});

export const merchItemUpdateSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.string().min(1).optional(),
  imagePathname: z.string().optional(),
  priceInPence: z.number().int().min(0).optional(),
  status: merchStatusSchema.optional(),
  maxPerOrder: z.number().int().min(1).optional(),
});

export const merchSizeCreateSchema = z.object({
  merchItemId: z.number(),
  size: z.string().min(1),
  stock: z.number().int().min(0),
});

export const merchSizeUpdateSchema = z.object({
  sizeId: z.number(),
  size: z.string().min(1).optional(),
  stock: z.number().int().min(0).optional(),
});

export const merchSizeByIdSchema = z.object({ sizeId: z.number() });
export const merchItemBySlugSchema = z.object({ slug: z.string() });
export const merchItemByIdSchema = z.object({ id: z.number() });
export const merchOrdersFilterSchema = z
  .object({ merchItemId: z.number().optional() })
  .optional();

export type MerchItemCreateInput = z.infer<typeof merchItemCreateSchema>;
export type MerchItemUpdateInput = z.infer<typeof merchItemUpdateSchema>;
export type MerchCheckoutInput = z.infer<typeof merchCheckoutSchema>;
