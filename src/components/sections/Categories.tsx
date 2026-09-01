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
            <h2 className="font-display text-3xl text-bone-white">
        Shop Collections
      </h2>
      <p className="mt-2 max-w-xl text-sm text-silver-gray/70">
        Hover the blocks to preview the drops in motion.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
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
      <div className="overflow-hidden rounded-xl shadow-xl ring-1 ring-silver-gray/20">
        <img
          src={hovered ? block.hoverImg : block.staticImg}
          alt={block.title}
          className="aspect-square w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="badge absolute left-3 top-3 bg-amber text-obsidian">
          NEW DROP
        </span>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent p-4">
          <h3 className="font-display text-lg text-bone-white">{block.title}</h3>
          <p className="text-xs uppercase tracking-widest text-amber">
            {block.subtitle}
          </p>
        </div>
      </div>
    </Link>
  );
}
