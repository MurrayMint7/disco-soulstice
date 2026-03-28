"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function NewEventPage() {
  const router = useRouter();
  const createEvent = api.event.create.useMutation({
    onSuccess: () => router.push("/admin/events"),
  });

  const [form, setForm] = useState({
    title: "",
    slug: "",
    date: "",
    day: "",
    time: "",
    venue: "",
    location: "",
    description: "",
    image: "",
    status: "coming-soon" as const,
    priceInPence: "",
    totalTickets: "",
    maxPerOrder: "4",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "title") {
        next.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEvent.mutate({
      title: form.title,
      slug: form.slug,
      date: new Date(form.date),
      day: form.day || undefined,
      time: form.time,
      venue: form.venue,
      location: form.location,
      description: form.description || undefined,
      image: form.image,
      status: form.status,
      priceInPence: form.priceInPence ? parseInt(form.priceInPence) : undefined,
      totalTickets: form.totalTickets
        ? parseInt(form.totalTickets)
        : undefined,
      maxPerOrder: parseInt(form.maxPerOrder) || 4,
    });
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">
        Create Event
      </h1>
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <Field
          label="Title"
          value={form.title}
          onChange={(v) => updateField("title", v)}
          required
        />
        <Field
          label="Slug"
          value={form.slug}
          onChange={(v) => updateField("slug", v)}
          required
        />
        <Field
          label="Date"
          type="datetime-local"
          value={form.date}
          onChange={(v) => updateField("date", v)}
          required
        />
        <Field
          label="Day (e.g. Good Friday)"
          value={form.day}
          onChange={(v) => updateField("day", v)}
        />
        <Field
          label="Time (e.g. 4:00 PM — 10:00 PM)"
          value={form.time}
          onChange={(v) => updateField("time", v)}
          required
        />
        <Field
          label="Venue"
          value={form.venue}
          onChange={(v) => updateField("venue", v)}
          required
        />
        <Field
          label="Location"
          value={form.location}
          onChange={(v) => updateField("location", v)}
          required
        />
        <div>
          <label className="font-body text-cream-200/80 text-sm block mb-1">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <Field
          label="Image URL"
          value={form.image}
          onChange={(v) => updateField("image", v)}
          required
        />
        <div>
          <label className="font-body text-cream-200/80 text-sm block mb-1">
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) => updateField("status", e.target.value)}
            className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none focus:border-primary"
          >
            <option value="coming-soon">Coming Soon</option>
            <option value="on-sale">On Sale</option>
            <option value="sold-out">Sold Out</option>
            <option value="free-event">Free Event</option>
          </select>
        </div>
        <Field
          label="Price (pence)"
          type="number"
          value={form.priceInPence}
          onChange={(v) => updateField("priceInPence", v)}
        />
        <Field
          label="Total Tickets"
          type="number"
          value={form.totalTickets}
          onChange={(v) => updateField("totalTickets", v)}
        />
        <Field
          label="Max Per Order"
          type="number"
          value={form.maxPerOrder}
          onChange={(v) => updateField("maxPerOrder", v)}
        />

        <button
          type="submit"
          disabled={createEvent.isPending}
          className="btn-primary disabled:opacity-50"
        >
          {createEvent.isPending ? "Creating..." : "Create Event"}
        </button>

        {createEvent.error && (
          <p className="font-body text-red-400 text-sm">
            {createEvent.error.message}
          </p>
        )}
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="font-body text-cream-200/80 text-sm block mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );
}
