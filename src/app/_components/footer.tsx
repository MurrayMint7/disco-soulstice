import Image from "next/image";

export function Footer() {
    return (
        <footer className="relative py-12 sm:py-16 px-4 sm:px-6 border-border/30 bg-background backdrop-blur-sm">
            <div className="warm-divider my-6 sm:my-8" />

            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col items-center gap-6 sm:gap-8 md:flex-row md:justify-between">
                    {/* Logo mark */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                        <Image
                            src="/logo.png"
                            alt="Disco Soulstice Logo"
                            width={120}
                            height={120}
                            className="transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_20px_rgba(232,121,26,0.6)]"
                        />
                        <span className="font-display-spaced text-lg sm:text-xl font-bold text-amber-300 font-spacing tracking-wide">
                            Disco Soulstice
                        </span>
                    </div>

                    {/* Social hint */}
                    <p className="font-body text-foreground/30 text-sm tracking-wide text-center">
                        Follow the groove · <a href="https://instagram.com/disco_soulstice" target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:text-amber-200 transition-colors">@discosoulstice</a>
                    </p>
                </div>

                <div className="warm-divider my-6 sm:my-8" />

                <p className="font-body text-foreground/20 text-xs text-center tracking-wider">
                    © 2026 Disco Soulstice. All rights reserved.
                </p>
            </div>
        </footer>
    );
}