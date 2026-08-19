"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { ImageUpload } from "~/app/admin/_components/image-upload";

export default function EditEventPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const eventId = parseInt(params.id, 10);

  const { data: event, isLoading } = api.event.getById.useQuery({
    id: eventId,
  });

  const updateEvent = api.event.update.useMutation({
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
    imagePathname: "",
    status: "coming-soon" as "on-sale" | "coming-soon" | "sold-out" | "free-event",
    priceInPence: "",
    totalTickets: "",
    maxPerOrder: "4",
  });

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title,
        slug: event.slug,
        date: new Date(event.date).toISOString().slice(0, 16),
        day: event.day ?? "",
        time: event.time,
        venue: event.venue,
        location: event.location,
        description: event.description ?? "",
        image: event.image,
        imagePathname: event.imagePathname ?? "",
        status: event.status,
        priceInPence: event.priceInPence?.toString() ?? "",
        totalTickets: event.totalTickets?.toString() ?? "",
        maxPerOrder: event.maxPerOrder.toString(),
      });
    }
  }, [event]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEvent.mutate({
      id: eventId,
      title: form.title,
      slug: form.slug,
      date: new Date(form.date),
      day: form.day || undefined,
      time: form.time,
      venue: form.venue,
      location: form.location,
      description: form.description || undefined,
      image: form.image,
      imagePathname: form.imagePathname || undefined,
      status: form.status,
      priceInPence: form.priceInPence ? parseInt(form.priceInPence) : null,
      totalTickets: form.totalTickets ? parseInt(form.totalTickets) : null,
      maxPerOrder: parseInt(form.maxPerOrder) || 4,
    });
  };

  if (isLoading) {
    return <p className="font-body text-cream-200/50">Loading...</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">
        Edit Event
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
          label="Day"
          value={form.day}
          onChange={(v) => updateField("day", v)}
        />
        <Field
          label="Time"
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
        <ImageUpload
          label="Image"
          value={form.image}
          onChange={({ url, pathname }) =>
            setForm((prev) => ({ ...prev, image: url, imagePathname: pathname }))
          }
          folder="events"
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
          disabled={updateEvent.isPending}
          className="btn-primary disabled:opacity-50"
        >
          {updateEvent.isPending ? "Saving..." : "Save Changes"}
        </button>

        {updateEvent.error && (
          <p className="font-body text-red-400 text-sm">
            {updateEvent.error.message}
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
