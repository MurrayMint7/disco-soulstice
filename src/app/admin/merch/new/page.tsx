"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function NewMerchPage() {
  const router = useRouter();
  const createItem = api.merch.create.useMutation({
    onSuccess: () => router.push("/admin/merch"),
  });

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    image: "",
    priceInPence: "",
    status: "coming-soon" as
      | "available"
      | "coming-soon"
      | "sold-out"
      | "discontinued",
    maxPerOrder: "4",
  });

  const [sizes, setSizes] = useState<{ size: string; stock: string }[]>([
    { size: "S", stock: "0" },
    { size: "M", stock: "0" },
    { size: "L", stock: "0" },
    { size: "XL", stock: "0" },
  ]);

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

  const updateSize = (index: number, field: "size" | "stock", value: string) => {
    setSizes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index]!, [field]: value };
      return next;
    });
  };

  const addSize = () => setSizes((prev) => [...prev, { size: "", stock: "0" }]);
  const removeSize = (index: number) =>
    setSizes((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createItem.mutate({
      title: form.title,
      slug: form.slug,
      description: form.description || undefined,
      image: form.image,
      priceInPence: parseInt(form.priceInPence),
      status: form.status,
      maxPerOrder: parseInt(form.maxPerOrder) || 4,
      sizes: sizes
        .filter((s) => s.size.trim())
        .map((s) => ({
          size: s.size.trim(),
          stock: parseInt(s.stock) || 0,
        })),
    });
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">
        Add Merch Item
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
        <Field
          label="Price (pence)"
          type="number"
          value={form.priceInPence}
          onChange={(v) => updateField("priceInPence", v)}
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
            <option value="available">Available</option>
            <option value="sold-out">Sold Out</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>
        <Field
          label="Max Per Order"
          type="number"
          value={form.maxPerOrder}
          onChange={(v) => updateField("maxPerOrder", v)}
        />

        {/* Sizes */}
        <div>
          <label className="font-body text-cream-200/80 text-sm block mb-2">
            Sizes
          </label>
          <div className="space-y-2">
            {sizes.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Size (e.g. M)"
                  value={s.size}
                  onChange={(e) => updateSize(i, "size", e.target.value)}
                  className="flex-1 bg-background border border-border/50 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none focus:border-primary"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={s.stock}
                  onChange={(e) => updateSize(i, "stock", e.target.value)}
                  className="w-24 bg-background border border-border/50 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => removeSize(i)}
                  className="font-body text-red-400 text-sm hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addSize}
            className="font-body text-primary text-sm hover:underline mt-2"
          >
            + Add Size
          </button>
        </div>

        <button
          type="submit"
          disabled={createItem.isPending}
          className="btn-primary disabled:opacity-50"
        >
          {createItem.isPending ? "Creating..." : "Create Item"}
        </button>

        {createItem.error && (
          <p className="font-body text-red-400 text-sm">
            {createItem.error.message}
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
