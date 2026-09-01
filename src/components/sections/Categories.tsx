"use client";

import { useState } from "react";
import Link from "next/link";

interface Block {
  title: string;
  subtitle: string;
  staticImg: string;
  hoverImg: string;
  href: string;
}

// Placeholder image/GIF pairs. Static is a photo; hoverImg is the 3s looping GIF.
const BLOCKS: Block[] = [
  {
    title: "106 & Park Drop",
    subtitle: "Oversized tees · baggy denim",
    staticImg: "https://placehold.co/600x800/111111/ffffff?text=106+%26+Park",
    hoverImg: "https://placehold.co/600x800/181818/ffffff?text=106+%26+Park+🔥",
    href: "#shop",
  },
  {
    title: "Velour & R.B.",
    subtitle: "Tracksuits · velour sets",
    staticImg: "https://placehold.co/600x800/1a1a1a/ffffff?text=Velour+%26+R.B.",
    hoverImg: "https://placehold.co/600x800/222222/ffffff?text=Velour+%26+R.B.+🔥",
    href: "#shop",
  },
  {
    title: "Arch City Exclusives",
    subtitle: "STL-only drops · limited stock",
    staticImg:
      "https://placehold.co/600x800/111111/ffffff?text=Arch+City+Exclusives",
    hoverImg:
      "https://placehold.co/600x800/181818/ffffff?text=Arch+City+Exclusives+🔥",
    href: "#shop",
  },
];

export default function Categories() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="font-display text-2xl text-silver-gray">
        Shop Collections
      </h2>
      <p className="mt-1 text-xs text-silver-gray/70">
        Hover the blocks to see the drops come alive.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {BLOCKS.map((b) => (
          <CategoryCard key={b.title} block={b} />
        ))}
      </div>
    </section>
  );
}

function CategoryCard({ block }: { block: Block }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={block.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative block"
    >
      <img
        src={hovered ? block.hoverImg : block.staticImg}
        alt={block.title}
        className="h-96 w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4">
        <span className="text-xs uppercase tracking-widest text-amber">
          {block.subtitle}
        </span>
      </div>
      <div className="absolute bottom-4 left-4">
        <span className="font-display text-lg text-bone-white">{block.title}</span>
      </div>
    </Link>
  );
}
