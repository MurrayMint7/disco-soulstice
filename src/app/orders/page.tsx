"use client";

import Link from "next/link";
import { api } from "~/trpc/react";
import { Header } from "~/app/_components/header";
import { Footer } from "~/app/_components/footer";

export default function OrdersPage() {
  const { data: ticketOrders, isLoading: loadingTickets } =
    api.order.getMyOrders.useQuery();
  const { data: merchOrderRows, isLoading: loadingMerch } =
    api.merch.getMyMerchOrders.useQuery();

  const isLoading = loadingTickets || loadingMerch;

  type UnifiedOrder = {
    type: "ticket" | "merch";
    id: number;
    title: string;
    subtitle: string;
    quantity: number;
    totalInPence: number;
    status: "pending" | "completed" | "failed" | "refunded";
    createdAt: Date;
    href: string;
  };

  const unified: UnifiedOrder[] = [];

  if (ticketOrders) {
    for (const row of ticketOrders) {
      unified.push({
        type: "ticket",
        id: row.order.id,
        title: row.event?.title ?? "Unknown Event",
        subtitle: row.event
          ? new Date(row.event.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "",
        quantity: row.order.quantity,
        totalInPence: row.order.totalInPence,
        status: row.order.status,
        createdAt: new Date(row.order.createdAt),
        href: `/orders/${row.order.id}`,
      });
    }
  }

  if (merchOrderRows) {
    for (const row of merchOrderRows) {
      unified.push({
        type: "merch",
        id: row.merch_order.id,
        title: row.merch_item?.title ?? "Merch Item",
        subtitle: `Size: ${row.merch_order.size}`,
        quantity: row.merch_order.quantity,
        totalInPence: row.merch_order.totalInPence,
        status: row.merch_order.status,
        createdAt: new Date(row.merch_order.createdAt),
        href: `/orders/merch/${row.merch_order.id}`,
      });
    }
  }

  unified.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const isEmpty = !isLoading && unified.length === 0;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-8">
            My Orders
          </h1>

          {isLoading && (
            <p className="font-body text-cream-200/50">Loading...</p>
          )}

          {isEmpty && (
            <p className="font-body text-cream-200/50">
              You haven&apos;t placed any orders yet.
            </p>
          )}

          {unified.length > 0 && (
            <div className="space-y-4">
              {unified.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.href}
                  className="block border border-border/30 rounded-xl p-5 hover:border-primary/40 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-body text-foreground font-semibold">
                          {item.title}
                        </h3>
                        <OrderTypeBadge type={item.type} />
                      </div>
                      <p className="font-body text-cream-200/50 text-sm">
                        {item.subtitle}
                      </p>
                      <p className="font-body text-cream-200/50 text-sm">
                        {item.quantity}{" "}
                        {item.type === "ticket" ? "ticket" : "item"}
                        {item.quantity > 1 ? "s" : ""} · £
                        {(item.totalInPence / 100).toFixed(2)}
                      </p>
                    </div>
                    <OrderStatusBadge status={item.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function OrderTypeBadge({ type }: { type: "ticket" | "merch" }) {
  return (
    <span
      className={`font-body text-xs tracking-wider uppercase px-2 py-0.5 rounded-full ${
        type === "ticket"
          ? "text-primary/70 bg-primary/10"
          : "text-accent/70 bg-accent/10"
      }`}
    >
      {type === "ticket" ? "Ticket" : "Merch"}
    </span>
  );
}

function OrderStatusBadge({
  status,
}: {
  status: "pending" | "completed" | "failed" | "refunded";
}) {
  const styles = {
    pending: "text-amber-300 border-amber-300/30",
    completed: "text-green-400 border-green-400/30",
    failed: "text-red-400 border-red-400/30",
    refunded: "text-cream-200/50 border-border/30",
  };

  return (
    <span
      className={`font-body text-xs tracking-wider uppercase px-2 py-1 border rounded-full ${styles[status]}`}
    >
      {status}
    </span>
  );
}
