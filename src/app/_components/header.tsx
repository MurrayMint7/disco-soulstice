import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full">
      {/* Gradient fade so nav blends into hero */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0e08]/90 via-[#1a0e08]/60 to-transparent pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-16 py-4">
        {/* Logo */}
        <Link href="/" className="group flex-shrink-0 -my-2">
          <Image
            src="/logo.png"
            alt="Disco Soulstice Logo"
            width={120}
            height={120}
            className="transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_20px_rgba(232,121,26,0.6)]"
          />
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-10">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/events">Events</NavLink>
          <NavLink href="/">Gallery</NavLink>
          <NavLink href="/">Contact</NavLink>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden flex flex-col gap-1.5 p-2 group" aria-label="Menu">
          <span className="w-6 h-0.5 bg-[#fad07a] transition-all group-hover:bg-[#e8791a]" />
          <span className="w-6 h-0.5 bg-[#fad07a] transition-all group-hover:bg-[#e8791a]" />
          <span className="w-4 h-0.5 bg-[#fad07a] transition-all group-hover:bg-[#e8791a] group-hover:w-6" />
        </button>
      </div>
    </nav>
  );
}

function NavLink({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="relative font-body text-sm font-medium tracking-[0.15em] uppercase text-[#fad07a]/80 hover:text-[#f7b955] transition-colors duration-300 group"
    >
      <span>{children}</span>
      {/* Subtle underline on hover — warm amber glow */}
      <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-[#e8791a] to-[#f4a236] group-hover:w-full transition-all duration-400 ease-out" />
    </Link>
  );
}