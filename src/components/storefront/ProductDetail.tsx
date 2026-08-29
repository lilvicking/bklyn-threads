"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";
import { categoryLabels, type Category } from "@/types";

type ProductDetailData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  basePrice: number;
  images: { id: string; url: string; alt: string | null; position: number }[];
  variants: {
    id: string;
    sku: string;
    size: string | null;
    color: string | null;
    priceAdj: number;
    stock: number;
  }[];
};

export default function ProductDetail({
  product,
}: {
  product: ProductDetailData;
}) {
  const { addItem } = useCart();
  const inStockVariants = product.variants.filter((v) => v.stock > 0);
  const [selectedVariant, setSelectedVariant] = useState(
    inStockVariants[0] ?? product.variants[0],
  );
  const [quantity, setQuantity] = useState(1);

  const price = selectedVariant
    ? product.basePrice + selectedVariant.priceAdj
    : product.basePrice;

  const primaryImage = product.images[0]?.url ?? null;

  const sizes = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const v of inStockVariants) {
      if (v.size && !seen.has(v.size)) {
        seen.add(v.size);
        result.push(v.size);
      }
    }
    if (result.length === 0 && inStockVariants.length > 0) result.push("OS");
    return result;
  }, [inStockVariants]);

  const handleSizeSelect = (size: string) => {
    const variant = inStockVariants.find((v) => v.size === size);
    if (variant) setSelectedVariant(variant);
  };

  const allOutOfStock = inStockVariants.length === 0;

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock === 0) return;
    addItem(
      {
        variantId: selectedVariant.id,
        name: `${product.name}${selectedVariant.size ? ` — ${selectedVariant.size}` : ""}`,
        image: primaryImage,
        unitAmount: price,
        stock: selectedVariant.stock,
      },
      Math.min(quantity, selectedVariant.stock),
    );
    setQuantity(1);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {primaryImage ? (
        <div className="relative aspect-[3/4] w-full bg-black">
          <Image
            src={primaryImage}
            alt={product.images[0]?.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex min-h-[400px] w-full items-center justify-center
                       border border-silver-gray/30 bg-black font-display text-4xl text-amber">
          BKLYN
        </div>
      )}

      <div className="flex flex-col">
        <p className="font-display text-xs uppercase tracking-widest text-amber">
          {categoryLabels[product.category as Category]}
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-wider text-bone-white">
          {product.name}
        </h1>
        <p className="mt-2 text-xl text-silver-gray">{formatPrice(price)}</p>
        {product.description && (
          <p className="mt-4 text-sm text-bone-white/70">{product.description}</p>
        )}

        {/* Size selector */}
        {sizes.length > 0 && !allOutOfStock && (
          <div className="mt-6 space-y-2">
            <p className="font-display text-xs uppercase tracking-wider text-silver-gray">
              Size
            </p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const variant = inStockVariants.find((v) => v.size === size);
                const isSelected = selectedVariant?.id === variant?.id;
                return (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size)}
                    className={
                      isSelected
                        ? "border-2 border-amber bg-cardinal font-bold text-bone-white"
                        : "border border-silver-gray/30 text-silver-gray hover:border-amber hover:text-amber"
                    }
                    style={{ width: "48px", height: "48px" }}
                  >
                    <span className="font-display text-xs uppercase">{size}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity selector */}
        {!allOutOfStock && selectedVariant && (
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="flex h-8 w-8 items-center justify-center border border-silver-gray/30
                           bg-black text-silver-gray hover:border-amber hover:text-amber disabled:opacity-50"
              >
                −
              </button>
              <span className="w-8 text-center font-display text-sm text-bone-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(q + 1, selectedVariant.stock))}
                disabled={quantity >= selectedVariant.stock}
                className="flex h-8 w-8 items-center justify-center border border-silver-gray/30
                           bg-black text-silver-gray hover:border-amber hover:text-amber disabled:opacity-50"
              >
                +
              </button>
            </div>
            <span className="text-xs text-silver-gray">
              {selectedVariant.stock} in stock
            </span>
          </div>
        )}

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={allOutOfStock || !selectedVariant}
          className="mt-8 w-full bg-cardinal py-3 font-display text-sm uppercase
                     tracking-widest text-bone-white hover:bg-cardinal/80
                     disabled:cursor-not-allowed disabled:opacity-50"
        >
          {allOutOfStock ? "OUT OF STOCK" : "ADD TO BAG"}
        </button>
      </div>
    </div>
  );
}

