"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";

export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const [loading, setLoading] = useState(false);

  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
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
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col
                       border-l border-silver-gray/30 bg-obsidian p-5"
          >
            <div className="flex items-center justify-between border-b border-silver-gray/20 pb-3">
              <h2 className="font-display text-lg tracking-widest text-amber">
                YOUR BAG ({totalItems})
              </h2>
              <button onClick={onClose} aria-label="Close cart">
                <X className="h-5 w-5 text-silver-gray hover:text-bone-white" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              {items.length === 0 ? (
                <p className="text-center text-sm text-silver-gray">
                  Your bag is empty.
                </p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex items-center justify-between gap-2 border
                               border-silver-gray/15 p-3"
                  >
                    <div className="flex-1 truncate">
                      <p className="text-sm text-bone-white">{item.name}</p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-silver-gray">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="flex h-5 w-5 items-center justify-center rounded
                                     border border-silver-gray/30 text-silver-gray
                                     hover:border-amber hover:text-amber disabled:opacity-50"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="flex h-5 w-5 items-center justify-center rounded
                                     border border-silver-gray/30 text-silver-gray
                                     hover:border-amber hover:text-amber disabled:opacity-50"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-amber">
                        {formatPrice(item.unitAmount * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        aria-label={`Remove ${item.name}`}
                        className="text-silver-gray hover:text-cardinal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={checkout}
              disabled={items.length === 0 || loading}
              className="mt-4 w-full bg-cardinal py-3 font-display text-sm uppercase
                         tracking-widest text-bone-white transition hover:bg-cardinal/80
                         disabled:opacity-50"
            >
              {loading
                ? "Redirecting…"
                : `Checkout — ${formatPrice(totalPrice)}`}
            </button>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}