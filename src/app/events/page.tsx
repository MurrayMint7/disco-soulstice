import { Footer } from "../_components/footer";
import { Header } from "../_components/header";
import Image from "next/image";
import Link from "next/link";
import { api } from "~/trpc/server";

export default async function EventsPage() {
  const events = await api.event.list();

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* ================================================================
          HERO — Events page header
          ================================================================ */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 md:pt-44 md:pb-28 px-4 sm:px-6 overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-brown-900 via-background to-background" />
        {/* Amber glow at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] sm:h-[400px] bg-[radial-gradient(ellipse,rgba(232,121,26,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-body text-amber-300/60 text-xs tracking-[0.2em] uppercase">
              What&apos;s On
            </span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          <h1 className="section-title text-foreground mb-4 sm:mb-6">
            Upcoming
            <br />
            <span className="italic text-accent">Events</span>
          </h1>

          <p className="font-body text-cream-200/50 text-base sm:text-lg max-w-xl leading-relaxed">
            Every night is a journey. Find your next groove below.
          </p>
        </div>
      </section>

      {/* ================================================================
          EVENTS LIST
          ================================================================ */}
      <section className="relative px-4 sm:px-6 pb-16 sm:pb-24 md:pb-32">
        <div className="max-w-5xl mx-auto space-y-16 sm:space-y-20 md:space-y-28">
          {events.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              index={index}
              isLast={index === events.length - 1}
            />
          ))}
        </div>
      </section>

      {/* ================================================================
          FOOTER
          ================================================================ */}
      <Footer />
    </main>
  );
}

/* ====================================================================
   EVENT CARD — Alternating layout with warm glow accents
   ==================================================================== */

interface Event {
  id: number;
  title: string;
  slug: string;
  date: Date;
  day: string | null;
  time: string;
  venue: string;
  location: string;
  description: string | null;
  image: string;
  status: "on-sale" | "coming-soon" | "sold-out" | "free-event";
  priceInPence: number | null;
  totalTickets: number | null;
  ticketsSold: number;
}

function EventCard({
  event,
  index,
  isLast,
}: {
  event: Event;
  index: number;
  isLast: boolean;
}) {
  const isReversed = index % 2 !== 0;
  const displayDate = new Date(event.date).toLocaleDateString("en-GB", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="group">
      <div
        className={`grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-14 items-center ${
          isReversed ? "md:[direction:rtl]" : ""
        }`}
      >
        {/* Image */}
        <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden md:[direction:ltr]">
          <Image
            src={event.image}
            alt={event.title}
            width={800}
            height={600}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Warm overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/20" />
          <div className="absolute inset-0 mix-blend-multiply bg-gradient-to-br from-primary/5 to-transparent" />
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_60px_rgba(232,121,26,0.08)] group-hover:shadow-[inset_0_0_80px_rgba(232,121,26,0.15)] transition-all duration-500" />

          {/* Status badge */}
          <div className="absolute top-4 left-4">
            <StatusBadge status={event.status} />
          </div>
        </div>

        {/* Details */}
        <div className="md:[direction:ltr]">
          {/* Date */}
          <div className="flex items-center gap-3 mb-4">
            <span className="font-body text-primary text-sm font-semibold tracking-[0.15em] uppercase">
              {displayDate}
            </span>
            {event.day && (
              <>
                <span className="w-1 h-1 rounded-full bg-secondary" />
                <span className="font-body text-amber-300/50 text-sm">
                  {event.day}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight group-hover:text-accent transition-colors duration-300">
            {event.title}
          </h2>

          <div className="warm-divider max-w-16 mb-6" />

          {/* Venue & Time */}
          <div className="space-y-2 mb-6">
            <p className="font-body text-cream-200/80 flex items-center gap-3 text-sm">
              <svg
                className="w-4 h-4 text-primary flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              {event.venue} · {event.location}
            </p>
            <p className="font-body text-cream-200/80 flex items-center gap-3 text-sm">
              <svg
                className="w-4 h-4 text-primary flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {event.time}
            </p>
          </div>

          {/* Description */}
          {event.description && (
            <p className="font-body text-cream-200/50 text-sm leading-relaxed mb-6 sm:mb-8 max-w-lg">
              {event.description}
            </p>
          )}

          {/* CTA */}
          {event.status === "on-sale" ? (
            <Link href={`/events/${event.slug}`} className="btn-primary">
              Get Tickets
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          ) : event.status === "coming-soon" ? (
            <div className="btn-outline pointer-events-none">
              Details Coming Soon
            </div>
          ) : event.status === "free-event" ? (
            <div className="font-body text-accent text-sm tracking-wider uppercase">
              Free Entry
            </div>
          ) : (
            <div className="font-body text-cream-200/30 text-sm tracking-wider uppercase">
              Sold Out
            </div>
          )}
        </div>
      </div>

      {/* Divider between events */}
      {!isLast && <div className="warm-divider mt-16 sm:mt-20 md:mt-28" />}
    </article>
  );
}

function StatusBadge({
  status,
}: {
  status: "on-sale" | "coming-soon" | "sold-out" | "free-event";
}) {
  if (status === "on-sale") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background/80 backdrop-blur-sm border border-primary/30 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(232,121,26,0.8)] animate-pulse" />
        <span className="font-body text-amber-300 text-xs font-medium tracking-wider uppercase">
          On Sale
        </span>
      </span>
    );
  }
  if (status === "coming-soon") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background/80 backdrop-blur-sm border border-border/40 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-300/50" />
        <span className="font-body text-amber-300/60 text-xs font-medium tracking-wider uppercase">
          Coming Soon
        </span>
      </span>
    );
  }
  if (status === "free-event") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background/80 backdrop-blur-sm border border-accent/40 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(244,162,54,0.8)]" />
        <span className="font-body text-accent text-xs font-medium tracking-wider uppercase">
          Free Entry
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background/80 backdrop-blur-sm border border-border/30 rounded-full">
      <span className="font-body text-cream-200/30 text-xs font-medium tracking-wider uppercase">
        Sold Out
      </span>
    </span>
  );
}
