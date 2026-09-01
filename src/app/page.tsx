import { prisma } from "@/lib/prisma";
import Storefront from "@/components/storefront/Storefront";

// The catalog is managed live via /admin, so render on demand rather than
// statically building against the DB (which also lets `next build` run
// without a live database).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const dbProducts = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { priceAdj: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const products = dbProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    basePrice: p.basePrice,
    images: p.images.map((img) => ({ url: img.url, alt: img.alt ?? null })),
  }));

  return (
    <main className="relative">
      <section className="mx-auto max-w-7xl px-4 py-12">
        <Storefront products={products} />
      </section>
    </main>
  );
}
