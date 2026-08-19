import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "~/app/_components/header";
import { Footer } from "~/app/_components/footer";
import { api } from "~/trpc/server";
import { MerchOptions } from "./merch-options";

export default async function MerchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let item;
  try {
    item = await api.merch.getBySlug({ slug });
  } catch {
    notFound();
  }

  const totalStock = item.sizes.reduce((s, sz) => s + sz.stock, 0);
  const totalSold = item.sizes.reduce((s, sz) => s + sz.sold, 0);
  const almostSoldOut =
    totalStock > 0 && totalStock - totalSold < totalStock * 0.25;

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 md:pt-44 md:pb-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-start">
            {/* Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                width={800}
                height={800}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/20" />
            </div>

            {/* Details */}
            <div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                {item.title}
              </h1>

              <div className="warm-divider max-w-16 mb-6" />

              <p className="font-body text-foreground text-lg font-semibold mb-2">
                £{(item.priceInPence / 100).toFixed(2)}
              </p>

              {almostSoldOut && item.status === "available" && (
                <p className="font-body text-red-400 text-sm mb-4">
                  Almost Sold Out
                </p>
              )}

              {item.description && (
                <p className="font-body text-cream-200/50 text-sm leading-relaxed mb-8 max-w-lg">
                  {item.description}
                </p>
              )}

              {item.status === "available" && (
                <MerchOptions
                  slug={item.slug}
                  sizes={item.sizes}
                  priceInPence={item.priceInPence}
                  maxPerOrder={item.maxPerOrder}
                />
              )}

              {item.status === "coming-soon" && (
                <div className="btn-outline pointer-events-none inline-flex">
                  Coming Soon
                </div>
              )}

              {item.status === "sold-out" && (
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
