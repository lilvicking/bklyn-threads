"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import ProductCard from "./ProductCard";
import { categoryLabels } from "@/types";
import type { ProductCardData } from "./ProductCard";

const ALL = "ALL" as const;

export default function Storefront({
  products,
}: {
  products: (Omit<ProductCardData, "category"> & { category: import("@/types").Category })[];
}) {
  const [filter, setFilter] = useState<string>("ALL");

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products],
  );

  const visible = useMemo(
    () => (filter === "ALL" ? products : products.filter((p) => p.category === filter)),
    [products, filter],
  );

  return (
    <div>
      {/* Category filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2" role="tablist">
        {["ALL", ...categories].map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={filter === c}
            onClick={() => setFilter(c)}
            className={cn(
              "border px-4 py-1.5 font-display text-sm uppercase tracking-wider transition-colors",
              filter === c
                ? "border-amber bg-cardinal font-bold text-bone-white"
                : "border-silver-gray/30 text-silver-gray hover:border-amber hover:text-amber",
            )}
          >
            {c === "ALL" ? "All" : categoryLabels[c]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-silver-gray">
          No releases in this category yet.
        </p>
      ) : (
        <div className="store-grid">{visible.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      )}
    </div>
  );
}