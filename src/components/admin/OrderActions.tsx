"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { orderStatusLabels, ORDER_STATUS_ORDER } from "@/lib/admin";

export default function OrderActions({
  orderId,
  currentStatus,
  trackingNumber,
  initialNotes,
}: {
  orderId: string;
  currentStatus: string;
  trackingNumber: string | null;
  initialNotes: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState(trackingNumber ?? "");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, trackingNumber: tracking, notes }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Update failed");
      setMessage("Order updated.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  const labelCls = "block text-xs uppercase tracking-wider text-silver-gray";
  const inputCls =
    "mt-1 w-full border border-silver-gray/30 bg-obsidian px-3 py-2 text-sm text-bone-white outline-none focus:border-amber";

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-cardinal">{error}</p>}
      {message && <p className="text-sm text-emerald-300">{message}</p>}

      <div>
        <label className={labelCls}>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls + " mt-1"}>
            {ORDER_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{orderStatusLabels[s] ?? s}</option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <label className={labelCls}>
          Tracking number
          <input value={tracking} onChange={(e) => setTracking(e.target.value)} className={inputCls} placeholder="e.g. 1Z999AA10123456784" />
        </label>
      </div>

      <div>
        <label className={labelCls}>
          Admin notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className={inputCls} />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-sm bg-amber px-6 py-2.5 font-display text-sm uppercase tracking-widest text-black hover:bg-amber/80 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-sm border border-silver-gray/30 px-6 py-2.5 text-sm text-bone-white hover:bg-silver-gray/10"
        >
          Print packing slip
        </button>
      </div>
    </div>
  );
}