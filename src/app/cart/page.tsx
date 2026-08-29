"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clear,
    totalItems,
    totalPrice,
  } = useCart();
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

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl tracking-widest text-amber">
          YOUR BAG
        </h1>
        <p className="mt-4 text-sm text-silver-gray">Your bag is empty.</p>
        <Link
          href="/"
          className="mt-6 inline-block bg-cardinal py-2 font-display text-sm
                     uppercase tracking-widest text-bone-white hover:bg-cardinal/80"
        >
          Shop Now
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-3xl tracking-widest text-amber mb-8">
        YOUR BAG ({totalItems})
      </h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex items-center gap-4 border border-silver-gray/20 bg-black/30 p-4"
          >
            <div className="flex-1">
              <p className="text-sm text-bone-white">{item.name}</p>
              <p className="text-xs text-silver-gray">
                {formatPrice(item.unitAmount)} x {item.quantity}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="flex h-7 w-7 items-center justify-center border border-silver-gray/30
                           bg-obsidian text-silver-gray hover:border-amber hover:text-amber disabled:opacity-50"
              >
                −
              </button>
              <span className="w-8 text-center font-display text-sm text-bone-white">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                className="flex h-7 w-7 items-center justify-center border border-silver-gray/30
                           bg-obsidian text-silver-gray hover:border-amber hover:text-amber disabled:opacity-50"
              >
                +
              </button>
            </div>
            <span className="w-24 text-right font-display text-amber">
              {formatPrice(item.unitAmount * item.quantity)}
            </span>
            <button
              onClick={() => removeItem(item.variantId)}
              aria-label={`Remove ${item.name}`}
              className="text-silver-gray hover:text-cardinal"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-8 border-t border-silver-gray/30 pt-4">
        <div className="flex justify-between font-display text-lg text-bone-white">
          <span>Subtotal</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
      </div>
      <div className="mt-6 flex gap-4">
        <button
          onClick={clear}
          className="flex-1 border border-silver-gray/30 py-3 font-display text-sm
                     uppercase tracking-widest text-silver-gray hover:border-amber hover:text-amber"
        >
          Clear Bag
        </button>
        <button
          onClick={checkout}
          disabled={loading}
          className="flex-1 bg-cardinal py-3 font-display text-sm uppercase
                     tracking-widest text-bone-white hover:bg-cardinal/80 disabled:opacity-50"
        >
          {loading ? "Redirecting…" : "Checkout"}
        </button>
      </div>
    </main>
  );
}
