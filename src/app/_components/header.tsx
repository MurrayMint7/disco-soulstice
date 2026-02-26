"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full">
      {/* Gradient fade so nav blends into hero */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-transparent pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 md:px-12 lg:px-16 py-4">
        {/* Logo */}
        <Link href="/" className="group flex-shrink-0 -my-2">
          <Image
            src="/logo.png"
            alt="Disco Soulstice Logo"
            width={120}
            height={120}
            className="  transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_20px_rgba(232,121,26,0.6)]"
          />
        </Link>

        {/* Navigation Links — Desktop */}
        <div className="hidden md:flex items-center gap-10">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/events">Events</NavLink>
          <NavLink href="/gallery">Gallery</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-3 -mr-2 group min-w-[44px] min-h-[44px] items-center justify-center"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span
            className={`w-6 h-0.5 bg-amber-300 transition-all duration-300 ${
              mobileMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`w-6 h-0.5 bg-amber-300 transition-all duration-300 ${
              mobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`w-4 h-0.5 bg-amber-300 transition-all duration-300 ${
              mobileMenuOpen ? "-rotate-45 -translate-y-2 w-6" : "group-hover:w-6"
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-background/95 backdrop-blur-md"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu content */}
        <div
          className={`relative z-10 flex flex-col items-center justify-center h-full gap-8 transition-transform duration-300 ${
            mobileMenuOpen ? "translate-y-0" : "-translate-y-8"
          }`}
        >
          <MobileNavLink href="/" onClick={() => setMobileMenuOpen(false)}>
            Home
          </MobileNavLink>
          <MobileNavLink href="/events" onClick={() => setMobileMenuOpen(false)}>
            Events
          </MobileNavLink>
          <MobileNavLink href="/gallery" onClick={() => setMobileMenuOpen(false)}>
            Gallery
          </MobileNavLink>
          <MobileNavLink href="/contact" onClick={() => setMobileMenuOpen(false)}>
            Contact
          </MobileNavLink>

          {/* Social link in mobile menu */}
          <div className="mt-8 pt-8 border-t border-border/30">
            <a
              href="https://instagram.com/disco_soulstice"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-amber-300/50 text-sm tracking-wide hover:text-amber-300 transition-colors"
            >
              @discosoulstice
            </a>
          </div>
        </div>
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
      className="relative font-body text-sm font-medium tracking-[0.15em] uppercase text-amber-300/80 hover:text-amber-400 transition-colors duration-300 group"
    >
      <span>{children}</span>
      {/* Subtle underline on hover — warm amber glow */}
      <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-400 ease-out" />
    </Link>
  );
}

function MobileNavLink({
  children,
  href,
  onClick,
}: {
  children: React.ReactNode;
  href: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="font-display text-3xl font-bold tracking-[0.1em] uppercase text-amber-300/80 hover:text-amber-300 transition-colors duration-300 py-2"
    >
      {children}
    </Link>
  );
}