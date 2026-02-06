import Link from "next/link";
import { Header } from "./_components/header";
import Image from "next/image";
import { Footer } from "./_components/footer";
import  Hero  from "./_components/hero";

const heroImage =
  "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokJ76SIUfPhnczD5kSldACG4Ttuv7WRXVOE89f";

export default async function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* ================================================================
          HERO — "Vinyl Vortex" — Pure CSS geometric disco
          ================================================================ */}
      <section className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-[#1a0e08]">
        {/* === STARBURST RAYS — radiating from center === */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="starburst-container animate-spin-slow">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="starburst-ray"
                style={{
                  transform: `rotate(${i * 15}deg)`,
                  opacity: i % 2 === 0 ? 0.06 : 0.03,
                }}
              />
            ))}
          </div>
        </div>

        {/* === CONCENTRIC VINYL RINGS — the geometric heart === */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Outermost ring — slow counter-rotation */}
          <div className="vinyl-ring vinyl-ring-outer animate-spin-reverse">
            <div className="vinyl-ring-dashes ring-dashes-32" />
          </div>

          {/* Second ring — dotted pattern */}
          <div className="vinyl-ring vinyl-ring-mid animate-spin-slow-2">
            <div className="vinyl-ring-dots" />
          </div>

          {/* Third ring — solid grooves */}
          <div className="vinyl-ring vinyl-ring-inner animate-spin-reverse-slow">
            <div className="vinyl-ring-grooves" />
          </div>

          {/* Center disc — the label */}
          <div className="vinyl-center-disc">
            <div className="vinyl-center-hole" />
          </div>
        </div>

        {/* === FLOATING GEOMETRIC ACCENTS === */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Diamond shapes scattered */}
          <div className="geo-diamond geo-diamond-1 animate-drift-1" />
          <div className="geo-diamond geo-diamond-2 animate-drift-2" />
          <div className="geo-diamond geo-diamond-3 animate-drift-3" />

          {/* Small circles */}
          <div className="geo-circle geo-circle-1 animate-drift-4" />
          <div className="geo-circle geo-circle-2 animate-drift-5" />
        </div>

        {/* === AMBIENT GLOW LAYERS === */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(232,121,26,0.18)_0%,rgba(212,104,15,0.08)_30%,rgba(232,121,26,0.03)_55%,transparent_70%)] animate-glow-breathe pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(244,162,54,0.12)_0%,transparent_60%)] animate-glow-breathe-delayed pointer-events-none" />

        {/* Edge vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#1a0e08_85%)] pointer-events-none" />

        <Hero />
      </section>

      
      {/* ================================================================
          ABOUT — What is Disco Soulstice?
          ================================================================ */}
      <section className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[24rem] h-40 bg-[radial-gradient(ellipse,rgba(232,121,26,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center">
          {/* Decorative orb */}
          <div className="glow-orb inline-block mb-8 sm:mb-10">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-orange-600 shadow-[0_0_40px_rgba(232,121,26,0.4)]" />
          </div>

          <h2 className="section-title text-foreground mb-6 sm:mb-8">
            Good Vibes,
            <br />
            <span className="italic text-accent">Great Grooves</span>
          </h2>

          <div className="warm-divider max-w-24 sm:max-w-32 mx-auto mb-6 sm:mb-8" />

          <p className="font-body text-cream-200/70 text-base sm:text-lg md:text-xl leading-relaxed mb-5 sm:mb-6">
            Disco Soulstice is a crew of groove enthusiasts
            bringing together the finest in disco, funk, house and global groove.
            Born from late-night vinyl sessions and a shared love for the
            dancefloor.
          </p>
          <p className="font-body text-cream-200/50 text-base md:text-lg leading-relaxed">
            We curate events that feel like coming home — warm lighting, warm
            people, and a soundtrack that moves your body and soul. Every set is
            a journey, every night is a celebration.
          </p>
        </div>
      </section>

      {/* ================================================================
          NEXT EVENT TEASER
          ================================================================ */}
      <section className="relative py-14 sm:py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section label */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-body text-amber-300/60 text-xs tracking-[0.2em] uppercase">
              Next Event
            </span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Image */}
            <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden group">
              <Image
                src={heroImage}
                alt="The Groove Assembly"
                width={800}
                height={600}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Warm color wash */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/20" />
              <div className="absolute inset-0 mix-blend-multiply bg-gradient-to-br from-primary/10 to-transparent" />
              {/* Inner glow border */}
              <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_60px_rgba(232,121,26,0.1)] group-hover:shadow-[inset_0_0_80px_rgba(232,121,26,0.15)] transition-all duration-500" />
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center">
              <span className="font-body text-primary text-sm font-semibold tracking-[0.15em] uppercase mb-4">
                April 3, 2026
              </span>

              <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
                The Groove
                <br />
                <span className="italic text-accent">Assembly</span>
              </h3>

              <div className="warm-divider max-w-20 mb-6" />

              <div className="space-y-2 mb-8">
                <p className="font-body text-cream-200/80 flex items-center gap-3">
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
                  Wakefield Exchange · Union Street, WF1 3AD
                </p>
                <p className="font-body text-cream-200/80 flex items-center gap-3">
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
                  4:00 PM — 10:00 PM
                </p>
              </div>

              <p className="font-body text-cream-200/50 leading-relaxed mb-8 sm:mb-10">
                Local DJ talent joins forces with Disco Soulstice for a Good
                Friday event not to be missed. Expect disco, funk, house &
                global groove.
              </p>

              <Link href="/events" className="btn-primary self-start">
                View All Events
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
          </div>
        </div>
        
      </section>  
      <Footer />
    </main>
  );
}
