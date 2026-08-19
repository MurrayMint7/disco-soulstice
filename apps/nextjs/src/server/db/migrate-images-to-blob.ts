import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";

import { db } from "@disco/db";
import { events, galleryAlbums, galleryImages } from "@disco/db/schema";
import { galleryEvents, galleryPhotos } from "~/app/gallery/gallery-data";

async function uploadFromUrl(url: string, pathname: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return put(pathname, Buffer.from(arrayBuffer), {
    access: "public",
    addRandomSuffix: true,
  });
}

async function main() {
  console.log("Migrating gallery albums + photos to Vercel Blob...");
  const albumIdBySlug = new Map<string, number>();

  for (const ev of galleryEvents) {
    const [album] = await db
      .insert(galleryAlbums)
      .values({ slug: ev.id, label: ev.label, date: ev.date })
      .returning();
    albumIdBySlug.set(ev.id, album!.id);
    console.log(`  created album "${ev.label}"`);
  }

  for (const photo of galleryPhotos) {
    const albumId = albumIdBySlug.get(photo.eventId);
    if (!albumId) {
      console.warn(`  skipping photo ${photo.id}: no album for ${photo.eventId}`);
      continue;
    }
    const blob = await uploadFromUrl(
      photo.src,
      `gallery/${photo.eventId}/${photo.id}.jpg`,
    );
    await db.insert(galleryImages).values({
      albumId,
      url: blob.url,
      pathname: blob.pathname,
      aspect: photo.aspect,
    });
    console.log(`  migrated photo ${photo.id} -> ${blob.url}`);
  }

  console.log("Migrating event images to Vercel Blob...");
  const allEvents = await db.select().from(events);
  for (const ev of allEvents) {
    if (ev.image.includes("ufs.sh")) {
      const blob = await uploadFromUrl(ev.image, `events/${ev.slug}.jpg`);
      await db
        .update(events)
        .set({ image: blob.url, imagePathname: blob.pathname })
        .where(eq(events.id, ev.id));
      console.log(`  migrated event "${ev.slug}" -> ${blob.url}`);
    }
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
