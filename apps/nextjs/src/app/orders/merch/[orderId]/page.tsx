import { notFound } from "next/navigation";
import { Header } from "~/app/_components/header";
import { Footer } from "~/app/_components/footer";
import { api } from "~/trpc/server";

export default async function MerchOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const id = parseInt(orderId, 10);
  if (isNaN(id)) notFound();

  let data;
  try {
    data = await api.merch.getMerchOrderById({ orderId: id });
  } catch {
    notFound();
  }

  const order = data.merch_order;
  const item = data.merch_item;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-lg mx-auto">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Order #{order.id}
          </h1>

          {order.status === "completed" && (
            <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-4 mb-6">
              <p className="font-body text-green-400 font-semibold text-sm">
                Payment successful
              </p>
              <p className="font-body text-green-400/70 text-sm mt-1">
                A confirmation has been sent to {order.buyerEmail}
              </p>
            </div>
          )}

          {order.status === "refunded" && (
            <div className="bg-cream-200/10 border border-border/30 rounded-xl p-4 mb-6">
              <p className="font-body text-cream-200/50 font-semibold text-sm">
                Order refunded
              </p>
            </div>
          )}

          <div className="border border-border/30 rounded-xl p-5 space-y-3">
            {item && (
              <>
                <h2 className="font-body text-foreground font-semibold">
                  {item.title}
                </h2>
                <p className="font-body text-cream-200/50 text-sm">
                  Size: {order.size}
                </p>
              </>
            )}
            <div className="pt-3 border-t border-border/30">
              <p className="font-body text-cream-200/80 text-sm">
                {order.quantity} x £
                {item
                  ? (item.priceInPence / 100).toFixed(2)
                  : (order.totalInPence / order.quantity / 100).toFixed(2)}{" "}
                · £{(order.totalInPence / 100).toFixed(2)}
              </p>
              <p className="font-body text-cream-200/50 text-sm mt-1">
                {order.buyerName} · {order.buyerEmail}
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
