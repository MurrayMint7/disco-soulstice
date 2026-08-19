import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { del } from "@vercel/blob";

import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { galleryAlbums, galleryImages } from "@disco/db/schema";

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
    .input(
      z.object({
        slug: z.string().min(1),
        label: z.string().min(1),
        date: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [album] = await ctx.db
        .insert(galleryAlbums)
        .values(input)
        .returning();
      return album;
    }),

  deleteAlbum: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const images = await ctx.db
        .select({ pathname: galleryImages.pathname })
        .from(galleryImages)
        .where(eq(galleryImages.albumId, input.id));

      await Promise.all(images.map((image) => del(image.pathname)));
      await ctx.db.delete(galleryAlbums).where(eq(galleryAlbums.id, input.id));
    }),

  addImage: adminProcedure
    .input(
      z.object({
        albumId: z.number(),
        url: z.string().url(),
        pathname: z.string().min(1),
        aspect: z
          .enum(["square", "portrait", "landscape", "wide"])
          .default("landscape"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [image] = await ctx.db
        .insert(galleryImages)
        .values(input)
        .returning();
      return image;
    }),

  deleteImage: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [image] = await ctx.db
        .select()
        .from(galleryImages)
        .where(eq(galleryImages.id, input.id))
        .limit(1);

      if (!image) throw new TRPCError({ code: "NOT_FOUND" });

      await del(image.pathname);
      await ctx.db.delete(galleryImages).where(eq(galleryImages.id, input.id));
    }),
});
