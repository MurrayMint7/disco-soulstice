import { Header } from "../_components/header";
import Image from "next/image";

// Mock event data - replace with real data from your database later
const events = [
  {
    id: 1,
    title: "The Groove Assembly",
    date: "April 3, 2026",
    day: "Good Friday",
    time: "4:00 PM — 10:00 PM",
    venue: "Wakefield Exchange",
    location: "Union Street, WF1 3AD",
    description:
      "The Groove Assembly sees WX welcome the coming together of some local DJ talent for a bank holiday event to make the dancefloor shake! A crew of crate-diggers from Elliott's Bar's Vinyl Social night join forces with the party collective with a passion for good time grooves — Disco Soulstice — for a Good Friday event not to be missed. Expect to hear disco, funk, house and global groove from 4 till 10!",
    image:
      "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokJ76SIUfPhnczD5kSldACG4Ttuv7WRXVOE89f",
    status: "on-sale" as const,
  },
  {
    id: 2,
    title: "Disco Soulstice's 1st Birthday",
    date: "June 27, 2026",
    day: "Saturday",
    time: "TBC",
    venue: "Melodie 71",
    location: "Kirkstall, LS5 3AT",
    description: "",
    image:
      "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokJ76SIUfPhnczD5kSldACG4Ttuv7WRXVOE89f",
    status: "coming-soon" as const,
  },
];

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-[#1a0e08]">
      <Header />

      {/* ================================================================
          HERO — Events page header
          ================================================================ */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 px-6 overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2d1810] via-[#1a0e08] to-[#1a0e08]" />
        {/* Amber glow at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(232,121,26,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-2 h-2 rounded-full bg-[#e8791a]" />
            <span className="font-body text-[#fad07a]/60 text-xs tracking-[0.2em] uppercase">
              What&apos;s On
            </span>
            <div className="flex-1 h-px bg-[#5c3a28]/50" />
          </div>

          <h1 className="section-title text-[#faf3e8] mb-6">
            Upcoming
            <br />
            <span className="italic text-[#f4a236]">Events</span>
          </h1>

          <p className="font-body text-[#f5e6d0]/50 text-lg max-w-xl leading-relaxed">
            Every night is a journey. Find your next groove below.
          </p>
        </div>
      </section>

      {/* ================================================================
          EVENTS LIST
          ================================================================ */}
      <section className="relative px-6 pb-24 md:pb-32">
        <div className="max-w-5xl mx-auto space-y-20 md:space-y-28">
          {events.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} />
          ))}
        </div>
      </section>

      {/* ================================================================
          FOOTER
          ================================================================ */}
      <footer className="relative py-16 px-6 border-t border-[#5c3a28]/30">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-[#e8791a] shadow-[0_0_12px_rgba(232,121,26,0.5)]" />
              <span className="font-display text-xl font-bold text-[#faf3e8] tracking-wide">
                Disco Soulstice
              </span>
            </div>
            <p className="font-body text-[#f5e6d0]/30 text-sm tracking-wide">
              Follow the groove · @discosoulstice
            </p>
          </div>
          <div className="warm-divider my-8" />
          <p className="font-body text-[#f5e6d0]/20 text-xs text-center tracking-wider">
            © 2026 Disco Soulstice. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* ====================================================================
   EVENT CARD — Alternating layout with warm glow accents
   ==================================================================== */

interface Event {
  id: number;
  title: string;
  date: string;
  day: string;
  time: string;
  venue: string;
  location: string;
  description: string;
  image: string;
  status: "on-sale" | "coming-soon" | "sold-out";
}

function EventCard({ event, index }: { event: Event; index: number }) {
  const isReversed = index % 2 !== 0;

  return (
    <article className="group">
      <div
        className={`grid md:grid-cols-2 gap-8 md:gap-14 items-center ${
          isReversed ? "md:[direction:rtl]" : ""
        }`}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden md:[direction:ltr]">
          <Image
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Warm overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0e08]/50 via-transparent to-[#1a0e08]/20" />
          <div className="absolute inset-0 mix-blend-multiply bg-gradient-to-br from-[#e8791a]/5 to-transparent" />
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
            <span className="font-body text-[#e8791a] text-sm font-semibold tracking-[0.15em] uppercase">
              {event.date}
            </span>
            {event.day && (
              <>
                <span className="w-1 h-1 rounded-full bg-[#5c3a28]" />
                <span className="font-body text-[#fad07a]/50 text-sm">
                  {event.day}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-[#faf3e8] mb-4 leading-tight group-hover:text-[#f4a236] transition-colors duration-300">
            {event.title}
          </h2>

          <div className="warm-divider max-w-16 mb-6" />

          {/* Venue & Time */}
          <div className="space-y-2 mb-6">
            <p className="font-body text-[#f5e6d0]/80 flex items-center gap-3 text-sm">
              <svg
                className="w-4 h-4 text-[#e8791a] flex-shrink-0"
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
            <p className="font-body text-[#f5e6d0]/80 flex items-center gap-3 text-sm">
              <svg
                className="w-4 h-4 text-[#e8791a] flex-shrink-0"
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
            <p className="font-body text-[#f5e6d0]/50 text-sm leading-relaxed mb-8 max-w-lg">
              {event.description}
            </p>
          )}

          {/* CTA */}
          {event.status === "on-sale" ? (
            <button className="btn-primary">
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
            </button>
          ) : event.status === "coming-soon" ? (
            <div className="btn-outline pointer-events-none">
              Details Coming Soon
            </div>
          ) : (
            <div className="font-body text-[#f5e6d0]/30 text-sm tracking-wider uppercase">
              Sold Out
            </div>
          )}
        </div>
      </div>

      {/* Divider between events */}
      <div className="warm-divider mt-20 md:mt-28" />
    </article>
  );
}

function StatusBadge({ status }: { status: "on-sale" | "coming-soon" | "sold-out" }) {
  if (status === "on-sale") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a0e08]/80 backdrop-blur-sm border border-[#e8791a]/30 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-[#e8791a] shadow-[0_0_6px_rgba(232,121,26,0.8)] animate-pulse" />
        <span className="font-body text-[#fad07a] text-xs font-medium tracking-wider uppercase">
          On Sale
        </span>
      </span>
    );
  }
  if (status === "coming-soon") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a0e08]/80 backdrop-blur-sm border border-[#5c3a28]/40 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-[#fad07a]/50" />
        <span className="font-body text-[#fad07a]/60 text-xs font-medium tracking-wider uppercase">
          Coming Soon
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a0e08]/80 backdrop-blur-sm border border-[#5c3a28]/30 rounded-full">
      <span className="font-body text-[#f5e6d0]/30 text-xs font-medium tracking-wider uppercase">
        Sold Out
      </span>
    </span>
  );
}
