import { prisma } from "@/lib/prisma";
import Storefront from "@/components/storefront/Storefront";
import Hero from "@/components/sections/Hero";
import Categories from "@/components/sections/Categories";
import Culture from "@/components/sections/Culture";

// The catalog is managed live via /admin, so render on demand rather than
// statically building against the DB (which also lets `next build` run
// without a live database).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [dbProducts, settings] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { priceAdj: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ]);

  const products = dbProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
        basePrice: p.basePrice,
    salePrice: p.salePrice ?? null,
    featured: p.featured,
    images: p.images.map((img) => ({ url: img.url, alt: img.alt ?? null })),
  }));

  return (
    <main className="relative">
      <Hero
        videoUrl={settings?.heroVideoUrl ?? null}
        autoplay={settings?.heroVideoAutoplay ?? true}
      />
      <Categories />
      <section id="shop" className="mx-auto max-w-7xl px-4 py-12">
        <Storefront products={products} />
      </section>
      <Culture />
    </main>
  );
}

