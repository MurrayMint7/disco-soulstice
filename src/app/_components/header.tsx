import Image from "next/image";
import Link from "next/link";

export function Header() {
    return (
        <nav className="absolute top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-16 pt-2 pb-16 text-lg font-bold tracking-[0.3em] uppercase">
            {/* Warm gradient overlay for vintage feel */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-950/80 via-orange-900/40 to-transparent pointer-events-none" />
            
            {/* Logo */}
            <Link href="/" className="relative z-10 group flex-shrink-0">
                <Image
                    src="/logo.png"
                    alt="Disco Soulstice Logo"
                    width={150}
                    height={150}
                    className="transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]"
                />
            </Link>
            
            <NavLink href="/">About</NavLink>
            <NavLink href="/events">Events</NavLink>
            <NavLink href="/">Gallery</NavLink>
            <NavLink href="/">Team</NavLink>
            <NavLink href="/">Contact</NavLink>
        </nav>
    );
}

function NavLink({ children, href }: { children: React.ReactNode; href: string }) {
    return (
        <Link href={href} className="relative group cursor-pointer">
            {/* Glow effect behind text */}
            <div className="absolute inset-0 blur-lg bg-amber-500/0 group-hover:bg-amber-500/60 transition-all duration-500 scale-150" />
            
            {/* Main text with vintage styling */}
            <span className="relative text-amber-100 group-hover:text-amber-300 transition-all duration-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)] group-hover:drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]">
                {children}
            </span>
            
            {/* Decorative underline with disco sparkle */}
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent group-hover:w-full transition-all duration-500 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
        </Link>
    );
}