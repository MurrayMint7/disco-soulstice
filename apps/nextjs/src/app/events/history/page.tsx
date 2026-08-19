import Link from "next/link";
import { EventCard } from "~/app/_components/events";
import { Footer } from "~/app/_components/footer";
import { Header } from "~/app/_components/header";
import { api } from "~/trpc/server";

export default async function HistoricalEventsPage() {
  const events = await api.event.listPast();

  return (
    <main className="bg-background min-h-screen">
      <Header />

      {/* ================================================================
          HERO — Historical events page header
          ================================================================ */}
      <section className="relative overflow-hidden px-4 pt-28 pb-16 sm:px-6 sm:pt-36 sm:pb-20 md:pt-44 md:pb-28">
        {/* Background texture */}
        <div className="from-brown-900 via-background to-background absolute inset-0 bg-gradient-to-b" />
        {/* Amber glow at top */}
        <div className="pointer-events-none absolute top-0 left-1/2 h-[300px] w-full max-w-[800px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(232,121,26,0.1)_0%,transparent_70%)] sm:h-[400px]" />

        <div className="relative z-10 mx-auto max-w-5xl">
          <Link
            href="/events"
            className="font-body hover:text-accent mb-8 inline-flex items-center gap-3 text-sm tracking-[0.15em] text-amber-300/60 uppercase transition-colors"
          >
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
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              />
            </svg>
            Upcoming Events
          </Link>

          <div className="mb-8 flex items-center gap-4">
            <div className="bg-primary h-2 w-2 rounded-full" />
            <span className="font-body text-xs tracking-[0.2em] text-amber-300/60 uppercase">
              Archive
            </span>
            <div className="bg-border/50 h-px flex-1" />
          </div>

          <h1 className="section-title text-foreground mb-4 sm:mb-6">
            Historical
            <br />
            <span className="text-accent italic">Events</span>
          </h1>

          <p className="font-body text-cream-200/50 max-w-xl text-base leading-relaxed sm:text-lg">
            A look back through previous Disco Soulstice sessions.
          </p>
        </div>
      </section>

      {/* ================================================================
          HISTORICAL EVENTS LIST
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
                variant="past"
              />
            ))
          ) : (
            <div className="py-8">
              <p className="font-body text-cream-200/50 max-w-xl text-base leading-relaxed">
                No historical events have been added yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================
          FOOTER
          ================================================================ */}
      <Footer />
    </main>
  );
}
