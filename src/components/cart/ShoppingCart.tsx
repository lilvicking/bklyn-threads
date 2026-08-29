"use client";

import { useState } from "react";
import { ShoppingCart as CartIcon } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import { formatPrice } from "@/lib/utils";

export default function ShoppingCart() {
  const [open, setOpen] = useState(false);
  const { totalItems, totalPrice } = useCart();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full
                   bg-cardinal px-4 py-3 font-display text-sm uppercase tracking-wider
                   text-bone-white shadow-lg shadow-black/25 hover:bg-cardinal/80"
        aria-label="Open shopping bag"
      >
        <CartIcon className="h-5 w-5" />
        <span>Bag ({totalItems})</span>
        {totalPrice > 0 && <span>— {formatPrice(totalPrice)}</span>}
      </button>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
