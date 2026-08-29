import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export const revalidate = 0;

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { position: "asc" } }, variants: true },
  });

  if (!product) {
    return (
      <div>
        <p className="text-sm text-cardinal">Product not found.</p>
        <Link href="/admin/products" className="mt-2 inline-block text-sm text-amber hover:underline">
          ← Back to products
        </Link>
      </div>
    );
  }

  const initial = {
    name: product.name,
    slug: product.slug,
    description: product.description ?? null,
    category: product.category,
    status: product.status,
    inventoryStatus: product.inventoryStatus,
    basePrice: product.basePrice,
    salePrice: product.salePrice,
    sku: product.sku,
    featured: product.featured,
    images: product.images.map((img) => ({
      url: img.url,
      alt: img.alt ?? "",
      position: img.position,
      featured: img.featured,
    })),
    variants: product.variants.map((v) => ({
      sku: v.sku,
      size: v.size ?? "",
      color: v.color ?? "",
      priceAdj: v.priceAdj,
      stock: v.stock,
    })),
  };

  return (
    <div>
      <header className="mb-6">
        <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-silver-gray hover:text-bone-white">
          <ArrowLeft size={14} /> Back
        </Link>
        <h1 className="mt-2 font-display text-3xl tracking-widest text-amber">EDIT — {product.name}</h1>
      </header>
      <ProductForm mode="edit" productId={product.id} initial={initial} />
    </div>
  );
}