import { Footer } from "../_components/footer";
import { Header } from "../_components/header";
import Image from "next/image";
import Link from "next/link";
import { api } from "~/trpc/server";

export default async function MerchPage() {
  const items = await api.merch.list();

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 md:pt-44 md:pb-28 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brown-900 via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] sm:h-[400px] bg-[radial-gradient(ellipse,rgba(232,121,26,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-body text-amber-300/60 text-xs tracking-[0.2em] uppercase">
              Official Merchandise
            </span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          <h1 className="section-title text-foreground mb-4 sm:mb-6">
            Merch
            <br />
            <span className="italic text-accent">Store</span>
          </h1>

          <p className="font-body text-cream-200/50 text-base sm:text-lg max-w-xl leading-relaxed">
            Exclusive Disco Soulstice merchandise designed for the dance floor and beyond.
          </p>
        </div>
      </section>

      {/* MERCH GRID */}
      <section className="relative px-4 sm:px-6 pb-16 sm:pb-24 md:pb-32">
        <div className="max-w-5xl mx-auto">
          {items.length === 0 && (
            <p className="font-body text-cream-200/50 text-center">
              No merch available yet. Check back soon!
            </p>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {items.map((item) => (
              <MerchCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

interface MerchItem {
  id: number;
  title: string;
  slug: string;
  image: string;
  priceInPence: number;
  status: "available" | "coming-soon" | "sold-out" | "discontinued";
  sizes: { id: number; stock: number; sold: number }[];
}

function MerchCard({ item }: { item: MerchItem }) {
  const totalStock = item.sizes.reduce((sum, s) => sum + s.stock, 0);
  const totalSold = item.sizes.reduce((sum, s) => sum + s.sold, 0);
  const almostSoldOut =
    totalStock > 0 && totalStock - totalSold < totalStock * 0.25;

  return (
    <Link
      href={`/merch/${item.slug}`}
      className="group block rounded-xl overflow-hidden border border-border/20 hover:border-primary/30 transition-colors"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          width={600}
          height={600}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <MerchStatusBadge
            status={item.status}
            almostSoldOut={almostSoldOut}
          />
        </div>
      </div>

      {/* Info */}
      <div className="p-4 sm:p-5">
        <h3 className="font-display text-lg font-bold text-foreground group-hover:text-accent transition-colors">
          {item.title}
        </h3>
        <p className="font-body text-cream-200/60 text-sm mt-1">
          £{(item.priceInPence / 100).toFixed(2)}
        </p>
      </div>
    </Link>
  );
}

function MerchStatusBadge({
  status,
  almostSoldOut,
}: {
  status: "available" | "coming-soon" | "sold-out" | "discontinued";
  almostSoldOut: boolean;
}) {
  if (almostSoldOut && status === "available") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background/80 backdrop-blur-sm border border-red-400/40 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)] animate-pulse" />
        <span className="font-body text-red-400 text-xs font-medium tracking-wider uppercase">
          Almost Sold Out
        </span>
      </span>
    );
  }
  if (status === "coming-soon") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background/80 backdrop-blur-sm border border-border/40 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-300/50" />
        <span className="font-body text-amber-300/60 text-xs font-medium tracking-wider uppercase">
          Coming Soon
        </span>
      </span>
    );
  }
  if (status === "sold-out") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background/80 backdrop-blur-sm border border-border/30 rounded-full">
        <span className="font-body text-cream-200/30 text-xs font-medium tracking-wider uppercase">
          Sold Out
        </span>
      </span>
    );
  }
  return null;
}
