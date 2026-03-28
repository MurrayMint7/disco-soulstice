"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function EditMerchPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const itemId = parseInt(params.id, 10);
  const utils = api.useUtils();

  const { data: item, isLoading } = api.merch.getById.useQuery({ id: itemId });

  const updateItem = api.merch.update.useMutation({
    onSuccess: () => router.push("/admin/merch"),
  });

  const addSize = api.merch.addSize.useMutation({
    onSuccess: () => utils.merch.getById.invalidate({ id: itemId }),
  });

  const updateSize = api.merch.updateSize.useMutation({
    onSuccess: () => utils.merch.getById.invalidate({ id: itemId }),
  });

  const deleteSize = api.merch.deleteSize.useMutation({
    onSuccess: () => utils.merch.getById.invalidate({ id: itemId }),
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

  const [newSize, setNewSize] = useState({ size: "", stock: "0" });

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title,
        slug: item.slug,
        description: item.description ?? "",
        image: item.image,
        priceInPence: item.priceInPence.toString(),
        status: item.status,
        maxPerOrder: item.maxPerOrder.toString(),
      });
    }
  }, [item]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateItem.mutate({
      id: itemId,
      title: form.title,
      slug: form.slug,
      description: form.description || undefined,
      image: form.image,
      priceInPence: parseInt(form.priceInPence),
      status: form.status,
      maxPerOrder: parseInt(form.maxPerOrder) || 4,
    });
  };

  if (isLoading) {
    return <p className="font-body text-cream-200/50">Loading...</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">
        Edit Merch Item
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

        <button
          type="submit"
          disabled={updateItem.isPending}
          className="btn-primary disabled:opacity-50"
        >
          {updateItem.isPending ? "Saving..." : "Save Changes"}
        </button>

        {updateItem.error && (
          <p className="font-body text-red-400 text-sm">
            {updateItem.error.message}
          </p>
        )}
      </form>

      {/* Size Management */}
      <div className="max-w-xl mt-10">
        <h2 className="font-display text-lg font-bold text-foreground mb-4">
          Sizes & Stock
        </h2>

        {item?.sizes && item.sizes.length > 0 && (
          <div className="space-y-2 mb-4">
            {item.sizes.map((sz) => (
              <div
                key={sz.id}
                className="flex items-center gap-3 border border-border/20 rounded-lg p-3"
              >
                <span className="font-body text-foreground text-sm font-semibold min-w-[40px]">
                  {sz.size}
                </span>
                <span className="font-body text-cream-200/50 text-sm">
                  Stock:
                </span>
                <input
                  type="number"
                  defaultValue={sz.stock}
                  onBlur={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val !== sz.stock) {
                      updateSize.mutate({ sizeId: sz.id, stock: val });
                    }
                  }}
                  className="w-20 bg-background border border-border/50 rounded-lg px-2 py-1 text-foreground font-body text-sm focus:outline-none focus:border-primary"
                />
                <span className="font-body text-cream-200/40 text-sm">
                  Sold: {sz.sold}
                </span>
                <button
                  onClick={() => {
                    if (confirm(`Delete size ${sz.size}?`)) {
                      deleteSize.mutate({ sizeId: sz.id });
                    }
                  }}
                  className="font-body text-red-400 text-sm hover:underline ml-auto"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-end">
          <div>
            <label className="font-body text-cream-200/80 text-xs block mb-1">
              Size
            </label>
            <input
              type="text"
              placeholder="e.g. XXL"
              value={newSize.size}
              onChange={(e) =>
                setNewSize((prev) => ({ ...prev, size: e.target.value }))
              }
              className="w-24 bg-background border border-border/50 rounded-lg px-2 py-1.5 text-foreground font-body text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="font-body text-cream-200/80 text-xs block mb-1">
              Stock
            </label>
            <input
              type="number"
              value={newSize.stock}
              onChange={(e) =>
                setNewSize((prev) => ({ ...prev, stock: e.target.value }))
              }
              className="w-20 bg-background border border-border/50 rounded-lg px-2 py-1.5 text-foreground font-body text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              if (newSize.size.trim()) {
                addSize.mutate({
                  merchItemId: itemId,
                  size: newSize.size.trim(),
                  stock: parseInt(newSize.stock) || 0,
                });
                setNewSize({ size: "", stock: "0" });
              }
            }}
            disabled={addSize.isPending}
            className="font-body text-primary text-sm hover:underline pb-1"
          >
            + Add
          </button>
        </div>

        {deleteSize.error && (
          <p className="font-body text-red-400 text-sm mt-2">
            {deleteSize.error.message}
          </p>
        )}
      </div>
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
