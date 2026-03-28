"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/events", label: "Events" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/merch", label: "Merch" },
    { href: "/admin/merch/orders", label: "Merch Orders" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-56 border-r border-border/30 p-6 pt-8 flex-shrink-0">
        <h2 className="font-display text-lg font-bold text-foreground mb-6">
          Admin
        </h2>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : item.href === "/admin/merch"
                  ? pathname === "/admin/merch" ||
                    (pathname.startsWith("/admin/merch") &&
                      !pathname.startsWith("/admin/merch/orders"))
                  : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-lg font-body text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-cream-200/60 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 pt-4 border-t border-border/30">
          <Link
            href="/"
            className="font-body text-cream-200/40 text-xs hover:text-cream-200/70 transition-colors"
          >
            &larr; Back to site
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
