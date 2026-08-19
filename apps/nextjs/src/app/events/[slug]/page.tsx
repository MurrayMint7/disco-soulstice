import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "~/app/_components/header";
import { Footer } from "~/app/_components/footer";
import { api } from "~/trpc/server";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let event;
  try {
    event = await api.event.getBySlug({ slug });
  } catch {
    notFound();
  }

  const displayDate = new Date(event.date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const remaining =
    event.totalTickets != null
      ? event.totalTickets - event.ticketsSold
      : null;

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 md:pt-44 md:pb-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-start">
            {/* Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src={event.image}
                alt={event.title}
                width={800}
                height={600}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/20" />
            </div>

            {/* Details */}
            <div>
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

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                {event.title}
              </h1>

              <div className="warm-divider max-w-16 mb-6" />

              <div className="space-y-2 mb-6">
                <p className="font-body text-cream-200/80 text-sm">
                  {event.venue} · {event.location}
                </p>
                <p className="font-body text-cream-200/80 text-sm">
                  {event.time}
                </p>
              </div>

              {event.description && (
                <p className="font-body text-cream-200/50 text-sm leading-relaxed mb-8 max-w-lg">
                  {event.description}
                </p>
              )}

              {event.status === "on-sale" && event.priceInPence != null && (
                <div className="space-y-4">
                  <p className="font-body text-foreground text-lg font-semibold">
                    £{(event.priceInPence / 100).toFixed(2)} per ticket
                  </p>
                  {remaining != null && (
                    <p className="font-body text-amber-300/60 text-sm">
                      {remaining} ticket{remaining !== 1 ? "s" : ""} remaining
                    </p>
                  )}
                  <Link
                    href={`/checkout/${event.slug}`}
                    className="btn-primary inline-flex"
                  >
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
                </div>
              )}

              {event.status === "free-event" && (
                <div className="font-body text-accent text-sm tracking-wider uppercase">
                  Free Entry
                </div>
              )}

              {event.status === "coming-soon" && (
                <div className="btn-outline pointer-events-none inline-flex">
                  Details Coming Soon
                </div>
              )}

              {event.status === "sold-out" && (
                <div className="font-body text-cream-200/30 text-sm tracking-wider uppercase">
                  Sold Out
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
