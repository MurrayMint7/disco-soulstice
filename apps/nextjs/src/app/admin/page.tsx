"use client";

import { api } from "~/trpc/react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = api.admin.getStats.useQuery();
  const { data: events } = api.event.list.useQuery();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">
        Dashboard
      </h1>

      {isLoading ? (
        <p className="font-body text-cream-200/50">Loading...</p>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard
            label="Total Revenue"
            value={`£${(stats.totalRevenueInPence / 100).toFixed(2)}`}
          />
          <StatCard label="Total Orders" value={String(stats.totalOrders)} />
          <StatCard
            label="Tickets Sold"
            value={String(stats.totalTicketsSold)}
          />
        </div>
      ) : null}

      <h2 className="font-display text-lg font-bold text-foreground mb-4">
        Events
      </h2>
      {events && events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="border border-border/30 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-body text-foreground font-semibold text-sm">
                  {event.title}
                </p>
                <p className="font-body text-cream-200/50 text-xs">
                  {new Date(event.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                {event.totalTickets != null ? (
                  <p className="font-body text-cream-200/80 text-sm">
                    {event.ticketsSold} / {event.totalTickets} sold
                  </p>
                ) : (
                  <p className="font-body text-cream-200/50 text-xs uppercase tracking-wider">
                    {event.status}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-body text-cream-200/50">No events found.</p>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border/30 rounded-xl p-5">
      <p className="font-body text-cream-200/50 text-xs tracking-wider uppercase mb-1">
        {label}
      </p>
      <p className="font-display text-2xl font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}
