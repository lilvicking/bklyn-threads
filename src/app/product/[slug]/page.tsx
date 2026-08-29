import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ProductDetail from "@/components/storefront/ProductDetail";

// Type for the product payload passed to the client component
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, status: "ACTIVE" },
    select: { name: true },
  });
  if (!product) return { title: "Not found" };
  return {
    title: `${product.name} — BKLYN THREADS`,
    description: product.name,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = (await prisma.product.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
    },
  })) as ProductDetailData | null;

  if (!product) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 font-display text-xs
                   uppercase tracking-wider text-silver-gray hover:text-amber"
      >
        <ChevronLeft className="h-4 w-4" /> Back to shop
      </Link>

      <ProductDetail product={product} />
    </main>
  );
}
