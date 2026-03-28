"use client";

import Link from "next/link";
import { api } from "~/trpc/react";

export default function AdminEventsPage() {
  const { data: events, isLoading } = api.event.list.useQuery();
  const utils = api.useUtils();
  const deleteEvent = api.event.delete.useMutation({
    onSuccess: () => utils.event.list.invalidate(),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Events
        </h1>
        <Link
          href="/admin/events/new"
          className="btn-primary text-sm px-4 py-2"
        >
          Add Event
        </Link>
      </div>

      {isLoading && (
        <p className="font-body text-cream-200/50">Loading...</p>
      )}

      {events && events.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/30">
                <th className="font-body text-cream-200/50 text-xs tracking-wider uppercase py-3 pr-4">
                  Title
                </th>
                <th className="font-body text-cream-200/50 text-xs tracking-wider uppercase py-3 pr-4">
                  Date
                </th>
                <th className="font-body text-cream-200/50 text-xs tracking-wider uppercase py-3 pr-4">
                  Status
                </th>
                <th className="font-body text-cream-200/50 text-xs tracking-wider uppercase py-3 pr-4">
                  Sold
                </th>
                <th className="font-body text-cream-200/50 text-xs tracking-wider uppercase py-3 pr-4">
                  Price
                </th>
                <th className="font-body text-cream-200/50 text-xs tracking-wider uppercase py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-border/20">
                  <td className="font-body text-foreground text-sm py-3 pr-4">
                    {event.title}
                  </td>
                  <td className="font-body text-cream-200/70 text-sm py-3 pr-4">
                    {new Date(event.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="font-body text-cream-200/70 text-sm py-3 pr-4 capitalize">
                    {event.status}
                  </td>
                  <td className="font-body text-cream-200/70 text-sm py-3 pr-4">
                    {event.totalTickets != null
                      ? `${event.ticketsSold}/${event.totalTickets}`
                      : "—"}
                  </td>
                  <td className="font-body text-cream-200/70 text-sm py-3 pr-4">
                    {event.priceInPence != null
                      ? `£${(event.priceInPence / 100).toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="py-3 flex gap-2">
                    <Link
                      href={`/admin/events/${event.id}/edit`}
                      className="font-body text-primary text-sm hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm("Delete this event?")) {
                          deleteEvent.mutate({ id: event.id });
                        }
                      }}
                      className="font-body text-red-400 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
