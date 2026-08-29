"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useTransition } from "react";
import { categoryLabels } from "@/types";

function FiltersInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function apply(patch: Record<string, string>) {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    startTransition(() => router.push(`/admin/products?${next.toString()}`));
  }

  const inputCls =
    "border border-silver-gray/30 bg-obsidian px-3 py-1.5 text-sm text-bone-white outline-none focus:border-amber";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        defaultValue={params.get("q") ?? ""}
        onKeyDown={(e) => {
          if (e.key === "Enter") apply({ q: e.currentTarget.value.trim() });
        }}
        placeholder="Search name or slug…"
        className={inputCls}
      />
      <select
        className={inputCls}
        value={params.get("category") ?? ""}
        onChange={(e) => apply({ category: e.target.value })}
      >
        <option value="">All categories</option>
        {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((c) => (
          <option key={c} value={c}>{categoryLabels[c]}</option>
        ))}
      </select>
      <select
        className={inputCls}
        value={params.get("inventoryStatus") ?? ""}
        onChange={(e) => apply({ inventoryStatus: e.target.value })}
      >
        <option value="">All inventory</option>
        {["IN_STOCK", "OUT_OF_STOCK", "PRE_ORDER", "HIDDEN_FROM_STORE"].map((s) => (
          <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => router.push("/admin/products")}
        className="rounded-sm border border-silver-gray/30 px-3 py-1.5 text-sm text-silver-gray hover:text-bone-white"
      >
        Reset
      </button>
      {pending && <span className="text-xs text-silver-gray">…</span>}
    </div>
  );
}

export default function ProductFilters() {
  return (
    <Suspense fallback={null}>
      <FiltersInner />
    </Suspense>
  );
}