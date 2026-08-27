"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";

export type CartLine = {
  variantId: string;
  name: string;
  quantity: number;
  unitAmount: number; // cents
};

export default function CartDrawer({
  open,
  onClose,
  lines,
}: {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const total = lines.reduce((s, l) => s + l.unitAmount * l.quantity, 0);

  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.assign(data.url);
      } else {
        alert("Checkout failed — please try again.");
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70"
          />
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-silver-gray/30 bg-obsidian p-5"
          >
            <div className="flex items-center justify-between border-b border-silver-gray/20 pb-3">
              <h2 className="font-display text-lg tracking-widest text-amber">
                YOUR BAG
              </h2>
              <button onClick={onClose} aria-label="Close cart">
                <X className="h-5 w-5 text-silver-gray hover:text-bone-white" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              {lines.length === 0 ? (
                <p className="text-center text-sm text-silver-gray">
                  Your bag is empty.
                </p>
              ) : (
                lines.map((line) => (
                  <div
                    key={line.variantId}
                    className="flex items-center justify-between border border-silver-gray/15 p-3"
                  >
                    <div>
                      <p className="text-sm">{line.name}</p>
                      <p className="text-xs text-silver-gray">
                        Qty {line.quantity}
                      </p>
                    </div>
                    <span className="font-display text-amber">
                      ${Math.round(line.unitAmount) / 100}
                    </span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={checkout}
              disabled={lines.length === 0 || loading}
              className="mt-4 w-full bg-cardinal py-3 font-display text-sm uppercase tracking-widest text-bone-white transition hover:bg-cardinal/80 disabled:opacity-50"
            >
              {loading ? "Redirecting…" : `Checkout — $${Math.round(total) / 100}`}
            </button>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}