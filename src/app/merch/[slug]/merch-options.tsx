"use client";

import { useState } from "react";
import Link from "next/link";

interface Size {
  id: number;
  size: string;
  stock: number;
  sold: number;
}

export function MerchOptions({
  slug,
  sizes,
  priceInPence,
  maxPerOrder,
}: {
  slug: string;
  sizes: Size[];
  priceInPence: number;
  maxPerOrder: number;
}) {
  const firstAvailable = sizes.find((sz) => sz.stock - sz.sold > 0) ?? null;
  const [selectedSize, setSelectedSize] = useState<Size | null>(firstAvailable);
  const [quantity, setQuantity] = useState(1);

  const available = selectedSize
    ? selectedSize.stock - selectedSize.sold
    : 0;
  const maxQty = Math.min(maxPerOrder, available);
  const totalPence = priceInPence * quantity;

  return (
    <div className="space-y-6">
      {/* Size selection */}
      <div>
        <p className="font-body text-cream-200/80 text-sm mb-3">
          Select a size:
        </p>
        <div className="flex flex-wrap gap-3">
          {sizes.map((sz) => {
            const sizeAvailable = sz.stock - sz.sold;
            const sizeAlmostGone =
              sz.stock > 0 && sizeAvailable < sz.stock * 0.25;
            const isSelected = selectedSize?.id === sz.id;

            if (sizeAvailable <= 0) {
              return (
                <div
                  key={sz.id}
                  className="inline-flex flex-col items-center px-5 py-3 border border-border/20 rounded-lg opacity-40 text-center"
                >
                  <span className="font-body text-cream-200/50 text-sm line-through">
                    {sz.size}
                  </span>
                </div>
              );
            }

            return (
              <button
                key={sz.id}
                onClick={() => {
                  setSelectedSize(sz);
                  setQuantity(1);
                }}
                className={`inline-flex flex-col items-center px-5 py-3 border rounded-lg transition-colors text-center ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border/50 hover:border-primary/60"
                }`}
              >
                <span className="font-body text-foreground text-sm font-semibold">
                  {sz.size}
                </span>
                {sizeAlmostGone && (
                  <span className="font-body text-red-400 text-xs mt-0.5">
                    Low stock
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity + Checkout */}
      {selectedSize && (
        <>
          <div>
            <label className="font-body text-cream-200/80 text-sm block mb-2">
              Quantity
            </label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary"
            >
              {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center py-4 border-t border-border/30">
            <span className="font-body text-cream-200/80 text-sm">
              {quantity} x £{(priceInPence / 100).toFixed(2)}
            </span>
            <span className="font-display text-xl font-bold text-foreground">
              £{(totalPence / 100).toFixed(2)}
            </span>
          </div>

          <Link
            href={`/checkout/merch/${slug}?size=${selectedSize.id}&qty=${quantity}`}
            className="btn-primary w-full justify-center text-center block"
          >
            Checkout
          </Link>
        </>
      )}
    </div>
  );
}
