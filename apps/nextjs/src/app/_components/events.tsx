import Image from "next/image";
import Link from "next/link";

export interface Event {
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

export function EventCard({
  event,
  index,
  isLast,
  variant = "upcoming",
}: {
  event: Event;
  index: number;
  isLast: boolean;
  variant?: "upcoming" | "past";
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
        className={`grid items-center gap-6 sm:gap-8 md:grid-cols-2 md:gap-14 ${
          isReversed ? "md:[direction:rtl]" : ""
        }`}
      >
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl sm:aspect-[4/3] sm:rounded-2xl md:[direction:ltr]">
          <Image
            src={event.image}
            alt={event.title}
            width={800}
            height={600}
            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
              variant === "past" ? "saturate-[0.82]" : ""
            }`}
          />
          {/* Warm overlay */}
          <div className="from-background/50 to-background/20 absolute inset-0 bg-gradient-to-t via-transparent" />
          <div className="from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent mix-blend-multiply" />
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_60px_rgba(232,121,26,0.08)] transition-all duration-500 group-hover:shadow-[inset_0_0_80px_rgba(232,121,26,0.15)]" />

          {/* Status badge */}
          <div className="absolute top-4 left-4">
            {variant === "past" ? (
              <span className="border-border/30 bg-background/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 backdrop-blur-sm">
                <span className="font-body text-cream-200/50 text-xs font-medium tracking-wider uppercase">
                  Past Event
                </span>
              </span>
            ) : (
              <StatusBadge status={event.status} />
            )}
          </div>
        </div>

        {/* Details */}
        <div className="md:[direction:ltr]">
          {/* Date */}
          <div className="mb-4 flex items-center gap-3">
            <span className="font-body text-primary text-sm font-semibold tracking-[0.15em] uppercase">
              {displayDate}
            </span>
            {event.day && (
              <>
                <span className="bg-secondary h-1 w-1 rounded-full" />
                <span className="font-body text-sm text-amber-300/50">
                  {event.day}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h2 className="font-display text-foreground group-hover:text-accent mb-3 text-2xl leading-tight font-bold transition-colors duration-300 sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl">
            {event.title}
          </h2>

          <div className="warm-divider mb-6 max-w-16" />

          {/* Venue & Time */}
          <div className="mb-6 space-y-2">
            <p className="font-body text-cream-200/80 flex items-center gap-3 text-sm">
              <svg
                className="text-primary h-4 w-4 flex-shrink-0"
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
                className="text-primary h-4 w-4 flex-shrink-0"
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
            <p className="font-body text-cream-200/50 mb-6 max-w-lg text-sm leading-relaxed sm:mb-8">
              {event.description}
            </p>
          )}

          {/* CTA */}
          {variant === "past" ? (
            <Link href={`/events/${event.slug}`} className="btn-outline">
              View Event
              <svg
                className="h-4 w-4"
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
          ) : event.status === "on-sale" ? (
            <Link href={`/events/${event.slug}`} className="btn-primary">
              Get Tickets
              <svg
                className="h-4 w-4"
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
      <span className="border-primary/30 bg-background/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 backdrop-blur-sm">
        <span className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full shadow-[0_0_6px_rgba(232,121,26,0.8)]" />
        <span className="font-body text-xs font-medium tracking-wider text-amber-300 uppercase">
          On Sale
        </span>
      </span>
    );
  }
  if (status === "coming-soon") {
    return (
      <span className="border-border/40 bg-background/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300/50" />
        <span className="font-body text-xs font-medium tracking-wider text-amber-300/60 uppercase">
          Coming Soon
        </span>
      </span>
    );
  }
  if (status === "free-event") {
    return (
      <span className="border-accent/40 bg-background/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 backdrop-blur-sm">
        <span className="bg-accent h-1.5 w-1.5 rounded-full shadow-[0_0_6px_rgba(244,162,54,0.8)]" />
        <span className="font-body text-accent text-xs font-medium tracking-wider uppercase">
          Free Entry
        </span>
      </span>
    );
  }
  return (
    <span className="border-border/30 bg-background/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 backdrop-blur-sm">
      <span className="font-body text-cream-200/30 text-xs font-medium tracking-wider uppercase">
        Sold Out
      </span>
    </span>
  );
}
