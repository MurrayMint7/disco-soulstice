import { asc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { deleteBlob } from "@disco/storage";
import { createTRPCRouter, publicProcedure, adminProcedure } from "@disco/trpc";
import { galleryAlbums, galleryImages } from "@disco/db/schema";
import {
  galleryAlbumCreateSchema,
  galleryByIdSchema,
  galleryImageCreateSchema,
} from "@disco/validators";

export const galleryRouter = createTRPCRouter({
  listAlbums: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.galleryAlbums.findMany({
      orderBy: [asc(galleryAlbums.sortOrder), asc(galleryAlbums.createdAt)],
      with: {
        images: { orderBy: [asc(galleryImages.sortOrder)] },
      },
    });
  }),

  createAlbum: adminProcedure
    .input(galleryAlbumCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const [album] = await ctx.db
        .insert(galleryAlbums)
        .values(input)
        .returning();
      return album;
    }),

  deleteAlbum: adminProcedure
    .input(galleryByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const images = await ctx.db
        .select({ pathname: galleryImages.pathname })
        .from(galleryImages)
        .where(eq(galleryImages.albumId, input.id));

      await Promise.all(images.map((image) => deleteBlob(image.pathname)));
      await ctx.db.delete(galleryAlbums).where(eq(galleryAlbums.id, input.id));
    }),

  addImage: adminProcedure
    .input(galleryImageCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const [image] = await ctx.db
        .insert(galleryImages)
        .values(input)
        .returning();
      return image;
    }),

  deleteImage: adminProcedure
    .input(galleryByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const [image] = await ctx.db
        .select()
        .from(galleryImages)
        .where(eq(galleryImages.id, input.id))
        .limit(1);

      if (!image) throw new TRPCError({ code: "NOT_FOUND" });

      await deleteBlob(image.pathname);
      await ctx.db.delete(galleryImages).where(eq(galleryImages.id, input.id));
    }),
});
