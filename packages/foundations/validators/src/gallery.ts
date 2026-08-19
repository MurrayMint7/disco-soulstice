import { z } from "zod";

export const galleryAspectSchema = z.enum([
  "square",
  "portrait",
  "landscape",
  "wide",
]);

export type GalleryAspect = z.infer<typeof galleryAspectSchema>;

export const galleryAlbumCreateSchema = z.object({
  slug: z.string().min(1),
  label: z.string().min(1),
  date: z.string().optional(),
});

export const galleryImageCreateSchema = z.object({
  albumId: z.number(),
  url: z.string().url(),
  pathname: z.string().min(1),
  aspect: galleryAspectSchema.default("landscape"),
});

export const galleryByIdSchema = z.object({ id: z.number() });

export type GalleryAlbumCreateInput = z.infer<typeof galleryAlbumCreateSchema>;
export type GalleryImageCreateInput = z.infer<typeof galleryImageCreateSchema>;
