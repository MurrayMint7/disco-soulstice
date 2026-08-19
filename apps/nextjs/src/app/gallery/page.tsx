"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { Header } from "../_components/header";
import { Footer } from "../_components/footer";
import { api } from "~/trpc/react";

type Aspect = "square" | "portrait" | "landscape" | "wide";

interface GalleryEvent {
  id: string;
  label: string;
  date: string;
}

interface GalleryPhoto {
  id: number;
  src: string;
  eventId: string;
  aspect: Aspect;
}

const aspectClass: Record<Aspect, string> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/9]",
};

/* ====================================================================
   PAGE COMPONENT
   ==================================================================== */

export default function GalleryPage() {
  const { data: albums, isLoading } = api.gallery.listAlbums.useQuery();

  const galleryEvents: GalleryEvent[] = useMemo(
    () =>
      (albums ?? []).map((album) => ({
        id: album.slug,
        label: album.label,
        date: album.date ?? "",
      })),
    [albums],
  );

  const galleryPhotos: GalleryPhoto[] = useMemo(
    () =>
      (albums ?? []).flatMap((album) =>
        album.images.map((image) => ({
          id: image.id,
          src: image.url,
          eventId: album.slug,
          aspect: image.aspect,
        })),
      ),
    [albums],
  );

  const eventMap = useMemo(
    () => new Map<string, GalleryEvent>(galleryEvents.map((e) => [e.id, e])),
    [galleryEvents],
  );

  const eventFilters = useMemo(
    () => [
      { id: "all", label: "All Nights" },
      ...galleryEvents.map((e) => ({ id: e.id, label: e.label })),
    ],
    [galleryEvents],
  );

  const [activeFilter, setActiveFilter] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredPhotos =
    activeFilter === "all"
      ? galleryPhotos
      : galleryPhotos.filter((p) => p.eventId === activeFilter);

  /* — Lightbox helpers — */
  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? 0 : (prev + 1) % filteredPhotos.length,
    );
  }, [filteredPhotos.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null
        ? 0
        : (prev - 1 + filteredPhotos.length) % filteredPhotos.length,
    );
  }, [filteredPhotos.length]);

  /* — Keyboard navigation — */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, closeLightbox, goNext, goPrev]);

  /* — Lock body scroll while lightbox is open — */
  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIndex]);

  const currentPhoto =
    lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* ================================================================
          HERO
          ================================================================ */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 md:pt-44 md:pb-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brown-900 via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[320px] bg-[radial-gradient(ellipse,rgba(232,121,26,0.1)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute top-16 left-8 w-1 h-1 rounded-full bg-primary/30 animate-drift-4 hidden sm:block" />
        <div className="absolute top-32 right-12 w-1.5 h-1.5 rounded-full bg-amber-300/20 animate-drift-5 hidden sm:block" />
        <div className="geo-diamond geo-diamond-2 animate-drift-2 hidden md:block" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-body text-amber-300/60 text-xs tracking-[0.2em] uppercase">
              Gallery
            </span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          <h1 className="section-title text-foreground mb-4 sm:mb-6">
            Nights &amp;
            <br />
            <span className="italic text-accent">Memories</span>
          </h1>

          <p className="font-body text-cream-200/50 text-base sm:text-lg max-w-lg leading-relaxed">
            Every event is a moment frozen in amber. Revisit the nights that
            moved you.
          </p>
        </div>
      </section>

      {/* ================================================================
          FILTER CHIPS
          ================================================================ */}
      <section className="px-4 sm:px-6 pb-10 sm:pb-14">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center gap-3">
            {eventFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={[
                  "genre-chip cursor-pointer",
                  activeFilter === filter.id
                    ? "border-primary/60 bg-primary/15 !text-amber-300 shadow-[0_0_16px_rgba(232,121,26,0.18)]"
                    : "",
                ].join(" ")}
              >
                {filter.label}
              </button>
            ))}

            <span className="ml-auto font-body text-cream-200/30 text-xs tracking-widest uppercase">
              {filteredPhotos.length}&nbsp;
              {filteredPhotos.length === 1 ? "photo" : "photos"}
            </span>
          </div>

          <div className="warm-divider mt-6" />
        </div>
      </section>

      {/* ================================================================
          MASONRY GRID  /  EMPTY STATE
          ================================================================ */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <p className="font-body text-cream-200/40 text-center py-24">
              Loading gallery...
            </p>
          ) : filteredPhotos.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4">
              {filteredPhotos.map((photo, index) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  event={eventMap.get(photo.eventId)}
                  onClick={() => openLightbox(index)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================================================================
          LIGHTBOX
          ================================================================ */}
      {lightboxIndex !== null && currentPhoto && (
        <Lightbox
          photo={currentPhoto}
          event={eventMap.get(currentPhoto.eventId)}
          index={lightboxIndex}
          total={filteredPhotos.length}
          onClose={closeLightbox}
          onNext={goNext}
          onPrev={goPrev}
        />
      )}

      <Footer />
    </main>
  );
}

/* ====================================================================
   EMPTY STATE
   ==================================================================== */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 sm:py-32 text-center">
      <div className="glow-orb inline-block mb-8">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/40 to-orange-600/20 border border-primary/20" />
      </div>
      <p className="font-display text-2xl text-foreground/40 mb-2">
        Photos coming soon
      </p>
      <p className="font-body text-cream-200/30 text-sm max-w-xs">
        Check back after the next event.
      </p>
    </div>
  );
}

/* ====================================================================
   PHOTO CARD
   ==================================================================== */

function PhotoCard({
  photo,
  event,
  onClick,
}: {
  photo: GalleryPhoto;
  event: GalleryEvent | undefined;
  onClick: () => void;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) return null;

  return (
    <div
      className="break-inside-avoid mb-3 sm:mb-4 group relative cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Open photo from ${event?.label ?? "event"}`}
    >
      <div
        className={`relative ${aspectClass[photo.aspect]} overflow-hidden rounded-xl`}
      >
        <Image
          src={photo.src}
          alt={event ? `${event.label} — ${event.date}` : "Gallery photo"}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          onError={() => setHasError(true)}
        />

        {/* Warm gradient reveal */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0e08]/85 via-[#1a0e08]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

        {/* Glow border */}
        <div className="absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-primary/40 group-hover:shadow-[0_0_24px_rgba(232,121,26,0.2)] transition-all duration-400" />

        {/* Caption */}
        {event && (
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <p className="font-display text-sm sm:text-base text-foreground leading-snug line-clamp-1">
              {event.label}
            </p>
            <p className="font-body text-[10px] sm:text-xs text-amber-300/70 mt-0.5 tracking-wider uppercase">
              {event.date}
            </p>
          </div>
        )}

        {/* Expand icon */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-7 h-7 flex items-center justify-center rounded-full bg-background/70 backdrop-blur-sm border border-border/40">
            <svg
              className="w-3.5 h-3.5 text-amber-300/80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================
   LIGHTBOX
   ==================================================================== */

function Lightbox({
  photo,
  event,
  index,
  total,
  onClose,
  onNext,
  onPrev,
}: {
  photo: GalleryPhoto;
  event: GalleryEvent | undefined;
  index: number;
  total: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a0e08]/96 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(232,121,26,0.06)_0%,transparent_70%)] pointer-events-none" />

      {/* Close */}
      <button
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 flex items-center justify-center rounded-full bg-brown-800/80 border border-border/40 text-cream-200/60 hover:text-foreground hover:border-primary/40 hover:bg-brown-700/80 transition-all duration-200 z-10"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Prev */}
      <button
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-brown-800/80 border border-border/40 text-cream-200/60 hover:text-foreground hover:border-primary/40 hover:bg-brown-700/80 transition-all duration-200 z-10"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        aria-label="Previous photo"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next */}
      <button
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-brown-800/80 border border-border/40 text-cream-200/60 hover:text-foreground hover:border-primary/40 hover:bg-brown-700/80 transition-all duration-200 z-10"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        aria-label="Next photo"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Image + caption */}
      <div
        className="relative w-full max-w-4xl mx-14 sm:mx-20 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full overflow-hidden rounded-xl shadow-[0_0_80px_rgba(232,121,26,0.12)]">
          <Image
            src={photo.src}
            alt={event ? `${event.label} — ${event.date}` : "Gallery photo"}
            width={1200}
            height={900}
            unoptimized
            className="w-full max-h-[70vh] object-contain"
            priority
          />
          <div className="absolute inset-0 rounded-xl ring-1 ring-primary/20 pointer-events-none" />
        </div>

        <div className="flex items-end justify-between px-1">
          {event ? (
            <div>
              <p className="font-display text-foreground text-lg sm:text-xl leading-snug">
                {event.label}
              </p>
              <p className="font-body text-amber-300/60 text-xs sm:text-sm tracking-wider uppercase mt-0.5">
                {event.date}
              </p>
            </div>
          ) : (
            <div />
          )}
          <span className="font-body text-cream-200/25 text-sm tabular-nums">
            {index + 1}&nbsp;/&nbsp;{total}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-px bg-border/30 rounded-full overflow-hidden -mt-1">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
