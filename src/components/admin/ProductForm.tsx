"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Trash2, ArrowUp, ArrowDown, Star, Plus } from "lucide-react";
import UploadButton from "@/components/admin/UploadButton";

import {
  categoryLabels,
  type Category,
  type AdminProductInput,
} from "@/types";

const STATUS_OPTIONS = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
const INVENTORY_OPTIONS = [
  "IN_STOCK",
  "OUT_OF_STOCK",
  "PRE_ORDER",
  "HIDDEN_FROM_STORE",
] as const;

type ImageRow = {
  url: string;
  alt?: string;
  position?: number;
  featured?: boolean;
};
type VariantRow = {
  sku?: string;
  size?: string;
  color?: string;
  priceAdj: number;
  stock: number;
};

type Props = {
  mode: "create" | "edit";
  productId?: string;
  initial?: Partial<AdminProductInput> & {
    images?: ImageRow[];
    variants?: VariantRow[];
  };
};

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-xs uppercase tracking-wider text-silver-gray">
      {label}
      <input
        {...props}
        className="mt-1 w-full border border-silver-gray/30 bg-obsidian px-3 py-2 text-sm text-bone-white outline-none focus:border-amber disabled:opacity-40"
      />
    </label>
  );
}

function Select({
  label,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="block text-xs uppercase tracking-wider text-silver-gray">
      {label}
      <select
        {...props}
        className="mt-1 w-full border border-silver-gray/30 bg-obsidian px-3 py-2 text-sm text-bone-white outline-none focus:border-amber"
      />
    </label>
  );
}

function Textarea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block text-xs uppercase tracking-wider text-silver-gray">
      {label}
      <textarea
        {...props}
        className="mt-1 w-full border border-silver-gray/30 bg-obsidian px-3 py-2 text-sm text-bone-white outline-none focus:border-amber"
      />
    </label>
  );
}
export default function ProductForm({
  mode,
  productId,
  initial,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(
    initial?.slug ?? initial?.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") ?? "",
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<Category>(
    initial?.category ?? "TEES",
  );
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [inventoryStatus, setInventoryStatus] = useState(
    initial?.inventoryStatus ?? "IN_STOCK",
  );
  const [basePrice, setBasePrice] = useState(initial?.basePrice ?? 0);
  const [salePrice, setSalePrice] = useState<number | undefined>(
    initial?.salePrice ?? undefined,
  );
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [images, setImages] = useState<ImageRow[]>(initial?.images ?? []);
  const [variants, setVariants] = useState<VariantRow[]>(initial?.variants ?? []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const autoSlug = useMemo(
    () => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    [name],
  );

  function updateImage(index: number, patch: Partial<ImageRow>) {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, ...patch } : img)),
    );
  }
  function updateVariant(index: number, patch: Partial<VariantRow>) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    );
  }
  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }
  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function moveImage(index: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const to = index + dir;
      if (to < 0 || to >= next.length) return prev;
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
  }

  async function submit() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload: AdminProductInput = {
        name,
        slug: slug || autoSlug,
        description: description || null,
        category,
        status: status as AdminProductInput["status"],
        inventoryStatus: inventoryStatus as AdminProductInput["inventoryStatus"],
        basePrice,
        salePrice: salePrice ?? null,
        sku: sku || null,
        featured,
        images: images.map((img, i) => ({
          url: img.url,
          alt: img.alt,
          position: i,
          featured: img.featured ?? i === 0,
        })),
        variants: variants.map((v) => ({
          ...(v.sku ? { sku: v.sku } : {}),
          ...(v.size ? { size: v.size } : {}),
          ...(v.color ? { color: v.color } : {}),
          priceAdj: v.priceAdj ?? 0,
          stock: v.stock ?? 0,
        })),
      };

      const url = mode === "edit" ? `/api/admin/products/${productId}` : "/api/admin/products";
      const res = await fetch(url, {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const flattened = (json?.error as { fieldErrors?: Record<string, string[]> }) ?? null;
        const first = flattened?.fieldErrors && Object.values(flattened.fieldErrors)[0]?.[0];
        throw new Error(first ?? json?.error ?? "Save failed");
      }
      setNotice("Saved.");
      if (mode === "create" && json?.id) {
        router.push(`/admin/products/${json.id}/edit?created=1`);
      } else {
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }
return (
    <div className="mx-auto max-w-4xl space-y-8">
      {error && (
        <p className="rounded-sm border border-cardinal/40 bg-cardinal/10 px-3 py-2 text-sm text-cardinal">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-sm border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">
          {notice}
        </p>
      )}

      <section className="rounded border border-silver-gray/20 bg-black/30 p-5">
        <h2 className="font-display text-lg tracking-widest text-amber">
          Details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input label="Name" value={name} onChange={(e) => { setName(e.target.value); if (!slug) setSlug(autoSlug); }} />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from name" />
        </div>
        <div className="mt-4">
          <Textarea label="Description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {(Object.keys(categoryLabels) as Category[]).map((c) => (
              <option key={c} value={c}>{categoryLabels[c]}</option>
            ))}
          </Select>
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as "DRAFT" | "ACTIVE" | "ARCHIVED")}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Select label="Inventory" value={inventoryStatus} onChange={(e) => setInventoryStatus(e.target.value as AdminProductInput["inventoryStatus"])}>
            {INVENTORY_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
            ))}
          </Select>
          <Input label="Price (cents)" type="number" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value) || 0)} />
          <Input label="Sale price (cents)" type="number" value={salePrice ?? ""} onChange={(e) => { const v = e.target.value; setSalePrice(v === "" ? undefined : Number(v) || 0); }} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Input label="Top-level SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
          <label className="mt-5 flex items-center gap-2 text-sm text-silver-gray">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Featured in store
          </label>
        </div>
      </section>
<section className="rounded border border-silver-gray/20 bg-black/30 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg tracking-widest text-amber">Images</h2>
          <UploadButton
            type="images"
            label="Upload image"
            onUploaded={(url) =>
              setImages((prev) => [
                ...prev,
                { url, position: prev.length, featured: prev.length === 0 },
              ])
            }
          />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.length === 0 && (
            <p className="text-sm text-silver-gray">No images yet.</p>
          )}
          {images.map((img, i) => (
            <div key={img.url + i} className="border border-silver-gray/20 bg-obsidian p-3">
              <div className="relative aspect-square overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt ?? "product"} className="h-full w-full object-cover" />
                {img.featured && (
                  <span className="absolute left-2 top-2 rounded-sm bg-amber px-2 py-0.5 text-xs font-semibold text-black">
                    Featured
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1">
                <button type="button" onClick={() => moveImage(i, -1)} className="icon-btn" aria-label="Move up">
                  <ArrowUp size={14} />
                </button>
                <button type="button" onClick={() => moveImage(i, 1)} className="icon-btn" aria-label="Move down">
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => updateImage(i, { featured: !img.featured })}
                  className="icon-btn"
                  aria-label="Set featured"
                >
                  <Star size={14} className={img.featured ? "text-amber" : "text-silver-gray"} />
                </button>
                <button type="button" onClick={() => removeImage(i)} className="icon-btn" aria-label="Remove">
                  <Trash2 size={14} className="text-cardinal" />
                </button>
                <input
                  value={img.alt ?? ""}
                  onChange={(e) => updateImage(i, { alt: e.target.value })}
                  placeholder="alt"
                  className="ml-auto w-24 border border-silver-gray/30 bg-obsidian px-2 py-1 text-xs text-bone-white outline-none focus:border-amber"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
<section className="rounded border border-silver-gray/20 bg-black/30 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg tracking-widest text-amber">Variants</h2>
          <button
            type="button"
            onClick={() =>
              setVariants((prev) => [
                ...prev,
                { size: "", color: "", sku: "", priceAdj: 0, stock: 0 },
              ])
            }
            className="inline-flex items-center gap-2 rounded-sm border border-silver-gray/30 bg-silver-gray/5 px-3 py-1.5 text-sm text-bone-white hover:bg-silver-gray/10"
          >
            <Plus size={14} /> Add variant
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {variants.length === 0 && (
            <p className="text-sm text-silver-gray">
              No variants yet — add sizes/colors to track per-variant stock.
            </p>
          )}
          {variants.map((v, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3 rounded-sm border border-silver-gray/20 bg-obsidian p-3">
              <Input label="Size" value={v.size ?? ""} onChange={(e) => updateVariant(i, { size: e.target.value })} placeholder="XS / OS / none" />
              <Input label="Color" value={v.color ?? ""} onChange={(e) => updateVariant(i, { color: e.target.value })} />
              <Input label="SKU" value={v.sku ?? ""} onChange={(e) => updateVariant(i, { sku: e.target.value })} placeholder="auto" />
              <Input label="Price adj (cents)" type="number" value={v.priceAdj ?? 0} onChange={(e) => updateVariant(i, { priceAdj: Number(e.target.value) || 0 })} />
              <Input label="Stock" type="number" value={v.stock ?? 0} onChange={(e) => updateVariant(i, { stock: Math.max(0, Number(e.target.value) || 0) })} />
              <button type="button" onClick={() => removeVariant(i)} className="icon-btn" aria-label="Remove variant">
                <Trash2 size={16} className="text-cardinal" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={saving}
          className="rounded-sm border border-silver-gray/30 px-5 py-2.5 text-sm text-silver-gray hover:text-bone-white disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="rounded-sm bg-amber px-8 py-2.5 font-display text-sm uppercase tracking-widest text-black hover:bg-amber/80 disabled:opacity-50"
        >
          {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Create product"}
        </button>
      </div>
    </div>
  );
}