"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function AdminOrdersPage() {
  const [eventFilter, setEventFilter] = useState<number | undefined>(undefined);
  const { data: events } = api.event.list.useQuery();
  const { data: orders, isLoading } = api.admin.getOrders.useQuery({
    eventId: eventFilter,
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">
        Orders
      </h1>

      <div className="mb-6">
        <select
          value={eventFilter ?? ""}
          onChange={(e) =>
            setEventFilter(e.target.value ? parseInt(e.target.value) : undefined)
          }
          className="bg-background border border-border/50 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none focus:border-primary"
        >
          <option value="">All Events</option>
          {events?.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <p className="font-body text-cream-200/50">Loading...</p>
      )}

      {orders && orders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/30">
                <th className="font-body text-cream-200/50 text-xs tracking-wider uppercase py-3 pr-4">
                  ID
                </th>
                <th className="font-body text-cream-200/50 text-xs tracking-wider uppercase py-3 pr-4">
                  Buyer
                </th>
                <th className="font-body text-cream-200/50 text-xs tracking-wider uppercase py-3 pr-4">
                  Email
                </th>
                <th className="font-body text-cream-200/50 text-xs tracking-wider uppercase py-3 pr-4">
                  Event
                </th>
                <th className="font-body text-cream-200/50 text-xs tracking-wider uppercase py-3 pr-4">
                  Qty
                </th>
                <th className="font-body text-cream-200/50 text-xs tracking-wider uppercase py-3 pr-4">
                  Total
                </th>
                <th className="font-body text-cream-200/50 text-xs tracking-wider uppercase py-3 pr-4">
                  Status
                </th>
                <th className="font-body text-cream-200/50 text-xs tracking-wider uppercase py-3">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((row) => {
                const order = row.order;
                const event = row.event;
                const statusColor =
                  order.status === "completed"
                    ? "text-green-400"
                    : order.status === "failed"
                      ? "text-red-400"
                      : order.status === "pending"
                        ? "text-amber-300"
                        : "text-cream-200/50";
                return (
                  <tr key={order.id} className="border-b border-border/20">
                    <td className="font-body text-cream-200/70 text-sm py-3 pr-4">
                      #{order.id}
                    </td>
                    <td className="font-body text-foreground text-sm py-3 pr-4">
                      {order.buyerName}
                    </td>
                    <td className="font-body text-cream-200/70 text-sm py-3 pr-4">
                      {order.buyerEmail}
                    </td>
                    <td className="font-body text-cream-200/70 text-sm py-3 pr-4">
                      {event?.title ?? "—"}
                    </td>
                    <td className="font-body text-cream-200/70 text-sm py-3 pr-4">
                      {order.quantity}
                    </td>
                    <td className="font-body text-cream-200/70 text-sm py-3 pr-4">
                      £{(order.totalInPence / 100).toFixed(2)}
                    </td>
                    <td
                      className={`font-body text-sm py-3 pr-4 capitalize ${statusColor}`}
                    >
                      {order.status}
                    </td>
                    <td className="font-body text-cream-200/50 text-sm py-3">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {orders && orders.length === 0 && (
        <p className="font-body text-cream-200/50">No orders found.</p>
      )}
    </div>
  );
}
