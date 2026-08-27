import { prisma } from "@/lib/prisma";
import Storefront from "@/components/storefront/Storefront";

export const revalidate = 60; // ISR: refresh catalog at most every 60s

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: { variants: { orderBy: { priceAdj: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="relative">
      <CrtHero />
      <section className="mx-auto max-w-7xl px-4 py-12">
        <Storefront products={products} />
      </section>
    </main>
  );
}

// Full-viewport CRT "TV" intro with a loading progress bar.
function CrtHero() {
  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-obsidian">
      {/* 90s backdrop texture */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #C41E3A 0 2px, transparent 2px 6px)",
        }}
      />
      <div className="crt-screen relative z-10 w-[min(92vw,720px)] border-[14px] border-silver-gray px-6 py-10 text-center">
        <span className="scanline absolute inset-x-0 top-0 h-px bg-bone-white/60" />
        <p className="font-display text-sm tracking-[0.4em] text-silver-gray">
          BKLYN THREADS
        </p>
        <h1 className="neon-amber font-display mt-2 text-5xl leading-tight sm:text-7xl">
          LOADING 90&rsquo;S…
        </h1>
        <div className="mt-6 h-3 w-full border border-silver-gray bg-black p-0.5">
          <div
            className="h-full w-3/4 bg-cardinal"
            style={{ animation: "ticker 2s infinite" }}
          />
        </div>
        <p className="font-display mt-4 text-xs tracking-widest text-silver-gray">
          PRESS START TO ENTER
        </p>
      </div>
    </section>
  );
}