import { Header } from "../_components/header";
import { Footer } from "../_components/footer";

const INSTAGRAM_HANDLE = "disco_soulstice";
const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;
const INSTAGRAM_DM_URL = `https://ig.me/m/${INSTAGRAM_HANDLE}`;
const EMAIL = "discosoulstice@gmail.com";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* ================================================================
          HERO
          ================================================================ */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 md:pt-44 md:pb-28 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brown-900 via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[320px] bg-[radial-gradient(ellipse,rgba(232,121,26,0.1)_0%,transparent_70%)] pointer-events-none" />
        <div className="geo-diamond geo-diamond-1 animate-drift-1 hidden md:block" />
        <div className="geo-diamond geo-diamond-3 animate-drift-3 hidden md:block" />
        <div className="geo-circle geo-circle-2 animate-drift-4 hidden sm:block" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-body text-amber-300/60 text-xs tracking-[0.2em] uppercase">
              Contact
            </span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          <h1 className="section-title text-foreground mb-4 sm:mb-6">
            Say
            <br />
            <span className="italic text-accent">Hello</span>
          </h1>

          <p className="font-body text-cream-200/50 text-base sm:text-lg max-w-lg leading-relaxed">
            We&apos;re always happy to hear from you — whether it&apos;s about
            upcoming events, collaborations, or just to talk about good music.
          </p>
        </div>
      </section>

      {/* ================================================================
          CONTACT CARDS
          ================================================================ */}
      <section className="relative px-4 sm:px-6 pb-16 sm:pb-24 md:pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[300px] bg-[radial-gradient(ellipse,rgba(232,121,26,0.05)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">

          {/* ── Row 1: Instagram + Email side by side ── */}
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">

            {/* Instagram card */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl border border-border/40 bg-brown-900/50 p-7 sm:p-8 overflow-hidden transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_50px_rgba(232,121,26,0.1)] block"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(232,121,26,0.06)_0%,transparent_60%)] pointer-events-none" />

              {/* Icon */}
              <div className="mb-6">
                <div className="glow-orb inline-block">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary via-orange-600 to-amber-500 flex items-center justify-center shadow-[0_0_30px_rgba(232,121,26,0.35)] transition-all duration-500 group-hover:shadow-[0_0_45px_rgba(232,121,26,0.5)] group-hover:scale-105">
                    <InstagramIcon className="w-7 h-7 text-[#1a0e08]" />
                  </div>
                </div>
              </div>

              <p className="font-body text-amber-300/50 text-xs tracking-[0.25em] uppercase mb-1">
                Instagram
              </p>
              <p className="font-display text-2xl sm:text-3xl text-foreground mb-3 leading-tight group-hover:text-accent transition-colors duration-300">
                @{INSTAGRAM_HANDLE}
              </p>

              <div className="warm-divider max-w-16 mb-4" />

              <p className="font-body text-cream-200/40 text-sm leading-relaxed mb-6">
                Events, behind-the-scenes, and late-night announcements. Follow the groove.
              </p>

              <div className="flex items-center gap-2 font-body text-primary text-xs tracking-[0.15em] uppercase font-semibold">
                <span>Follow Us</span>
                <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </a>

            {/* Email card */}
            <a
              href={`mailto:${EMAIL}`}
              className="group relative rounded-2xl border border-border/40 bg-brown-900/50 p-7 sm:p-8 overflow-hidden transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_50px_rgba(232,121,26,0.1)] block"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(244,162,54,0.05)_0%,transparent_60%)] pointer-events-none" />

              {/* Icon */}
              <div className="mb-6">
                <div className="glow-orb inline-block">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 via-primary to-orange-700 flex items-center justify-center shadow-[0_0_30px_rgba(244,162,54,0.3)] transition-all duration-500 group-hover:shadow-[0_0_45px_rgba(244,162,54,0.45)] group-hover:scale-105">
                    <EmailIcon className="w-7 h-7 text-[#1a0e08]" />
                  </div>
                </div>
              </div>

              <p className="font-body text-amber-300/50 text-xs tracking-[0.25em] uppercase mb-1">
                Email
              </p>
              <p className="font-display text-xl sm:text-2xl text-foreground mb-3 leading-tight group-hover:text-accent transition-colors duration-300 break-all">
                {EMAIL}
              </p>

              <div className="warm-divider max-w-16 mb-4" />

              <p className="font-body text-cream-200/40 text-sm leading-relaxed mb-6">
                Bookings, venue enquiries, and collaborations. We&apos;ll get back to you.
              </p>

              <div className="flex items-center gap-2 font-body text-primary text-xs tracking-[0.15em] uppercase font-semibold">
                <span>Send an Email</span>
                <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </a>
          </div>

          {/* ── Row 2: What to reach out about ── */}
          <div className="relative rounded-2xl border border-border/30 bg-brown-900/30 p-7 sm:p-10 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(232,121,26,0.04)_0%,transparent_60%)] pointer-events-none" />

            <p className="font-body text-amber-300/50 text-xs tracking-[0.25em] uppercase mb-8">
              What we&apos;re here for
            </p>

            <div className="grid sm:grid-cols-3 gap-8">
              <InfoBlock
                icon={
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                }
                title="Event Enquiries"
                body="Want Disco Soulstice at your venue? Drop us a message and we'll make it happen."
              />
              <InfoBlock
                icon={
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                  </svg>
                }
                title="Collaborations"
                body="DJs, photographers, creatives — if you share the love for good music, let's talk."
              />
              <InfoBlock
                icon={
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                }
                title="General Chat"
                body="Got something on your mind? We always love hearing from people who love the music."
              />
            </div>
          </div>

          {/* ── DM shortcut ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 rounded-xl border border-border/20 bg-brown-900/20">
            <p className="font-body text-cream-200/40 text-sm text-center sm:text-left">
              Quickest response? Slide into our DMs.
            </p>
            <a
              href={INSTAGRAM_DM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-shrink-0"
            >
              <InstagramIcon className="w-4 h-4" />
              Send a DM
            </a>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}

/* ====================================================================
   SUB-COMPONENTS
   ==================================================================== */

function InfoBlock({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <h3 className="font-body text-foreground text-sm font-semibold tracking-[0.08em] uppercase">
          {title}
        </h3>
      </div>
      <p className="font-body text-cream-200/40 text-sm leading-relaxed pl-10">
        {body}
      </p>
    </div>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
