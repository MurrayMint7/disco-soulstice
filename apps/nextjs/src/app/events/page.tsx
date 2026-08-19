import Link from "next/link";
import { EventCard } from "../_components/events";
import { Footer } from "../_components/footer";
import { Header } from "../_components/header";
import { api } from "~/trpc/server";

export default async function EventsPage() {
  const events = await api.event.listUpcoming();

  return (
    <main className="bg-background min-h-screen">
      <Header />

      {/* ================================================================
          HERO — Events page header
          ================================================================ */}
      <section className="relative overflow-hidden px-4 pt-28 pb-16 sm:px-6 sm:pt-36 sm:pb-20 md:pt-44 md:pb-28">
        {/* Background texture */}
        <div className="from-brown-900 via-background to-background absolute inset-0 bg-gradient-to-b" />
        {/* Amber glow at top */}
        <div className="pointer-events-none absolute top-0 left-1/2 h-[300px] w-full max-w-[800px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(232,121,26,0.1)_0%,transparent_70%)] sm:h-[400px]" />

        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="mb-8 flex items-center gap-4">
            <div className="bg-primary h-2 w-2 rounded-full" />
            <span className="font-body text-xs tracking-[0.2em] text-amber-300/60 uppercase">
              What&apos;s On
            </span>
            <div className="bg-border/50 h-px flex-1" />
          </div>

          <h1 className="section-title text-foreground mb-4 sm:mb-6">
            Upcoming
            <br />
            <span className="text-accent italic">Events</span>
          </h1>

          <p className="font-body text-cream-200/50 max-w-xl text-base leading-relaxed sm:text-lg">
            Every night is a journey. Find your next groove below.
          </p>
        </div>
      </section>

      {/* ================================================================
          EVENTS LIST
          ================================================================ */}
      <section className="relative px-4 pb-16 sm:px-6 sm:pb-24 md:pb-32">
        <div className="mx-auto max-w-5xl space-y-16 sm:space-y-20 md:space-y-28">
          {events.length > 0 ? (
            events.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                index={index}
                isLast={index === events.length - 1}
              />
            ))
          ) : (
            <div className="py-8">
              <p className="font-body text-cream-200/50 max-w-xl text-base leading-relaxed">
                No upcoming events are listed yet. Check back soon for the next
                session.
              </p>
            </div>
          )}
        </div>

        <div className="border-border/40 mx-auto mt-16 max-w-5xl border-t pt-8 sm:mt-20">
          <Link
            href="/events/history"
            className="group font-body hover:text-accent inline-flex items-center gap-3 text-sm tracking-[0.15em] text-amber-300/60 uppercase transition-colors"
          >
            Historical Events
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
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
        </div>
      </section>

      {/* ================================================================
          FOOTER
          ================================================================ */}
      <Footer />
    </main>
  );
}
