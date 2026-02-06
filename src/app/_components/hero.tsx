import Link from "next/link";

export default function Hero(){
    return(
        <section>
            <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl">
                {/* Genre chips */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 animate-fade-up">
                    {["Disco", "Funk", "Soul" ].map((genre, i) => (
                        <span
                            key={genre}
                            className="genre-chip"
                            style={{ animationDelay: `${i * 0.08}s` }}
                        >
                            {genre}
                        </span>
                    ))}
                </div>
            
                {/* Title — split with geometric line */}
                <div className="animate-fade-up delay-100">
                    <h1 className="hero-title text-amber-300 leading-[0.85]">
                        DISCO
                    </h1>
                    {/* Geometric divider between title words */}
                    <div className="flex items-center justify-center gap-3 sm:gap-4 my-2 sm:my-3 md:my-4">
                        <div className="h-px flex-1 max-w-12 sm:max-w-20 md:max-w-32 bg-gradient-to-r from-transparent to-primary/60" />
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rotate-45 bg-primary" />
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rotate-45 border border-accent/60" />
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rotate-45 bg-primary" />
                        </div>
                        <div className="h-px flex-1 max-w-12 sm:max-w-20 md:max-w-32 bg-gradient-to-l from-transparent to-primary/60" />
                    </div>
                    <h1 className="hero-title text-amber-300 leading-[0.85]">
                        SOULSTICE
                    </h1>
                </div>
            
                {/* Tagline */}
                <p className="font-body text-cream-200/55 text-sm sm:text-base md:text-lg max-w-md mx-auto mt-6 sm:mt-8 mb-8 sm:mb-10 animate-fade-up delay-200 leading-relaxed tracking-wide">
                    A party collective with a passion
                    <br className="hidden sm:block" />
                    for good time grooves.
                </p>
            
                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up delay-300">
                    <Link href="/events" className="btn-primary group">
                        <span>Upcoming Events</span>
                        <svg
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
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
            
            {/* Scroll indicator */}
            <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in delay-600">
                <span className="font-body text-amber-300/40 text-[10px] sm:text-xs tracking-[0.2em] uppercase">
                    Scroll
                </span>
                <div className="scroll-line" />
            </div>
        </section>       
    )
}