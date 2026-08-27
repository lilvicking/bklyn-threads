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
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0];
  return (
    <motion.article
      whileHover={{ y: -10, rotate: 2, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="hanger-card group cursor-pointer overflow-hidden border border-silver-gray/20 bg-obsidian"
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
        </div>
        <div className="p-3">
          <p className="font-display text-[11px] uppercase tracking-widest text-amber">
            {categoryLabels[product.category]}
          </p>
          <h3 className="mt-1 truncate text-sm font-medium">{product.name}</h3>
          <p className="mt-1 text-sm text-silver-gray">{formatPrice(product.basePrice)}</p>
        </div>
      </Link>
    </motion.article>
  );
}