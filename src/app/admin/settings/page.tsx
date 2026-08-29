"use client";

import { useEffect, useState } from "react";
import UploadButton from "@/components/admin/UploadButton";

type Settings = {
  siteTitle: string;
  metaDescription: string;
  ogImageUrl: string | null;
  shippingFlatRate: number;
  freeShippingThreshold: number;
  supportedRegions: string;
  termsOfService: string | null;
  privacyPolicy: string | null;
  refundPolicy: string | null;
};

const cls = "block text-xs uppercase tracking-wider text-silver-gray";
const inputCls =
  "mt-1 w-full border border-silver-gray/30 bg-obsidian px-3 py-2 text-sm text-bone-white outline-none focus:border-amber";
const h2 = "font-display text-lg tracking-widest text-amber";

export default function SettingsPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load"))))
      .then(setS)
      .catch(() => setMessage("Could not load settings."));
  }, []);

  if (!s) return <p className="text-sm text-silver-gray">{message ?? "Loading…"}</p>;

  async function save(patch: Partial<Settings>) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Save failed");
      setS(json);
      setMessage("Saved.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {message && (
        <p className={"text-sm " + (message.startsWith("Could") ? "text-cardinal" : "text-emerald-300")}>{message}</p>
      )}

      <section className="rounded border border-silver-gray/20 bg-black/30 p-5">
        <h2 className={h2}>SEO metadata</h2>
        <div className="mt-4 space-y-4">
          <label className={cls}>
            Site title
            <input className={inputCls} value={s.siteTitle} onChange={(e) => setS({ ...s, siteTitle: e.target.value })} />
          </label>
          <label className={cls}>
            Meta description
            <textarea className={inputCls} rows={3} value={s.metaDescription} onChange={(e) => setS({ ...s, metaDescription: e.target.value })} />
          </label>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-silver-gray">OG image</p>
            <div className="flex items-center gap-3">
              {s.ogImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.ogImageUrl} alt="" className="h-14 w-24 rounded-sm object-cover" />
              )}
              <UploadButton type="images" label="Upload OG image" onUploaded={(url) => save({ ogImageUrl: url })} />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded border border-silver-gray/20 bg-black/30 p-5">
        <h2 className={h2}>Shipping settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className={cls}>
            Flat rate (cents)
            <input type="number" className={inputCls} value={s.shippingFlatRate} onChange={(e) => setS({ ...s, shippingFlatRate: Number(e.target.value) || 0 })} />
          </label>
          <label className={cls}>
            Free shipping threshold (cents)
            <input type="number" className={inputCls} value={s.freeShippingThreshold} onChange={(e) => setS({ ...s, freeShippingThreshold: Number(e.target.value) || 0 })} />
          </label>
        </div>
        <label className={cls + " mt-4"}>
          Supported regions (comma-separated ISO codes)
          <input className={inputCls} value={s.supportedRegions} onChange={(e) => setS({ ...s, supportedRegions: e.target.value })} placeholder="US,CA,GB,AU,DE,FR,JP" />
        </label>
      </section>

      <section className="rounded border border-silver-gray/20 bg-black/30 p-5">
        <h2 className={h2}>Checkout policies</h2>
        <div className="mt-4 space-y-4">
          <label className={cls}>
            Terms of service
            <textarea className={inputCls} rows={4} value={s.termsOfService ?? ""} onChange={(e) => setS({ ...s, termsOfService: e.target.value })} />
          </label>
          <label className={cls}>
            Privacy policy
            <textarea className={inputCls} rows={4} value={s.privacyPolicy ?? ""} onChange={(e) => setS({ ...s, privacyPolicy: e.target.value })} />
          </label>
          <label className={cls}>
            Refund policy
            <textarea className={inputCls} rows={4} value={s.refundPolicy ?? ""} onChange={(e) => setS({ ...s, refundPolicy: e.target.value })} />
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={() => save(s)}
          className="rounded-sm bg-amber px-8 py-2.5 font-display text-sm uppercase tracking-widest text-black hover:bg-amber/80 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}