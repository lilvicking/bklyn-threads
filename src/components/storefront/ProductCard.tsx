"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { categoryLabels, type Category } from "@/types";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  category: Category;
  basePrice: number;
  images: { url: string; alt?: string | null }[];
    /** Optional "model stepping in" video that plays on hover (muted so browsers allow autoplay). */
  videoUrl?: string | null;
  salePrice?: number | null;
  featured?: boolean;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0];
    const hasVideo = Boolean(product.videoUrl);
  const onSale =
    typeof product.salePrice === "number" && product.salePrice < product.basePrice;
  return (
    <motion.article
            whileHover={{ y: -8, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="hanger-card group relative overflow-hidden border border-silver-gray/20 bg-obsidian"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] w-full bg-black">
          {image ? (
            <Image src={image.url} alt={image.alt ?? product.name} fill className="object-cover" sizes="33vw" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-amber">
              BKLYN
            </div>
          )}

          {/* Hover-to-play video: muted + playsInline keeps autoplay policy happy. */}
          {hasVideo && (
            <video
              src={product.videoUrl!}
              autoPlay
              muted
              playsInline
              loop
              className="absolute inset-0 hidden h-full w-full object-cover group-hover:block"
            />
          )}
        </div>
                <div className="p-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-display text-[10px] uppercase tracking-widest text-amber">
                {categoryLabels[product.category]}
              </p>
              <h3 className="mt-1 truncate text-sm font-medium">{product.name}</h3>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-sm text-silver-gray">
                  {onSale && product.salePrice
                    ? formatPrice(product.salePrice)
                    : formatPrice(product.basePrice)}
                </span>
                {onSale && product.salePrice && (
                  <span className="text-xs line-through text-silver-gray/40">
                    {formatPrice(product.basePrice)}
                  </span>
                )}
              </div>
            </div>

            {product.featured || onSale ? (
              <span className="badge bg-cardinal text-bone-white">
                {onSale ? "SALE" : "NEW"}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.article>
    );
}
