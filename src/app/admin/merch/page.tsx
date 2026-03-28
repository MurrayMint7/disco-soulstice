"use client";

import Link from "next/link";
import { api } from "~/trpc/react";

export default function AdminMerchPage() {
  const { data: items, isLoading } = api.merch.list.useQuery();
  const utils = api.useUtils();
  const deleteItem = api.merch.delete.useMutation({
    onSuccess: () => utils.merch.list.invalidate(),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Merch
        </h1>
        <Link
          href="/admin/merch/new"
          className="btn-primary text-sm px-4 py-2"
        >
          Add Item
        </Link>
      </div>

      {isLoading && (
        <p className="font-body text-cream-200/50">Loading...</p>
      )}

      {items && items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/30">
                <th className="font-body text-cream-200/50 text-xs tracking-wider uppercase py-3 pr-4">
                  Title
                </th>
                <th className="font-body text-cream-200/50 text-xs tracking-wider uppercase py-3 pr-4">
                  Status
                </th>
                <th className="font-body text-cream-200/50 text-xs tracking-wider uppercase py-3 pr-4">
                  Sizes
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
              {items.map((item) => {
                const totalStock = item.sizes.reduce(
                  (s, sz) => s + sz.stock,
                  0,
                );
                const totalSold = item.sizes.reduce(
                  (s, sz) => s + sz.sold,
                  0,
                );
                return (
                  <tr key={item.id} className="border-b border-border/20">
                    <td className="font-body text-foreground text-sm py-3 pr-4">
                      {item.title}
                    </td>
                    <td className="font-body text-cream-200/70 text-sm py-3 pr-4 capitalize">
                      {item.status}
                    </td>
                    <td className="font-body text-cream-200/70 text-sm py-3 pr-4">
                      {item.sizes.map((s) => s.size).join(", ") || "—"}
                      <span className="text-cream-200/40 ml-2">
                        ({totalSold}/{totalStock} sold)
                      </span>
                    </td>
                    <td className="font-body text-cream-200/70 text-sm py-3 pr-4">
                      £{(item.priceInPence / 100).toFixed(2)}
                    </td>
                    <td className="py-3 flex gap-2">
                      <Link
                        href={`/admin/merch/${item.id}/edit`}
                        className="font-body text-primary text-sm hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm("Delete this item?")) {
                            deleteItem.mutate({ id: item.id });
                          }
                        }}
                        className="font-body text-red-400 text-sm hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {items && items.length === 0 && (
        <p className="font-body text-cream-200/50">
          No merch items yet. Click &quot;Add Item&quot; to create one.
        </p>
      )}
    </div>
  );
}
