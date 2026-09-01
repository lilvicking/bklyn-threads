import Link from "next/link";

const NAV_ITEMS = [
  { label: "Shop", href: "#shop" },
  { label: "The Culture", href: "#culture" },
  { label: "Lookbook", href: "#lookbook" },
];

// Placeholder GIF clips for the 2000s R&B/rap dropdown menus.
// Swap these image URLs (or replace the <img>s with <Image>s) for real clips.
const DROPDOWN_GIFS: Record<string, string[]> = {
  Shop: [
    "https://placehold.co/240x160/111111/ffffff?text=106+%26+Park+Drop",
    "https://placehold.co/240x160/181818/ffffff?text=Velour+%26+R.B.",
    "https://placehold.co/240x160/1f1f1f/ffffff?text=Arch+City+Exclusives",
  ],
  "The Culture": ["https://placehold.co/240x160/111111/ffffff?text=STL+Bounce+%7C+Block+Party"],
  Lookbook: ["https://placehold.co/240x160/181818/ffffff?text=Lookbook+Clip+%7C+Y2K"],
};

export default function Header() {
  return (
    <header className="w-full bg-obsidian text-bone-white shadow-[0_2px_0_0_rgba(245,197,24,0.2)]">
      {/* Scrolling marquee top bar */}
      <div className="relative isolate overflow-hidden whitespace-nowrap bg-cardinal py-1.5 text-[10px] font-display tracking-[0.25em] text-bone-white">
        <div className="animate-marquee">
          <span className="mx-8">🔥 THE GATEWAY TO Y2K FASHION 🔥</span>
          <span className="mx-8">🚚 WORLDWIDE SHIPPING 🚚</span>
          <span className="mx-8">STL 🧱 STAND UP 🔥</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:py-4">
        {/* "JAY FΛB" logotype — Λ stands in for the St. Louis Arch until an SVG/logo asset is dropped in. */}
        <Link
          href="/"
          className="font-display text-[1.45rem] tracking-[0.3em] text-amber"
        >
          JAY FΛB
        </Link>

        <nav className="flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.label}
              item={item}
              gifs={DROPDOWN_GIFS[item.label] || []}
            />
          ))}
        </nav>
      </div>
    </header>
  );
}

function NavItem({
  item,
  gifs,
}: {
  item: { label: string; href: string };
  gifs: string[];
}) {
  return (
    <div className="relative group">
      <Link
        href={item.href}
        className="font-display text-xs tracking-widest uppercase text-silver-gray transition-colors group-hover:text-amber"
      >
        {item.label}
      </Link>

      {/* Dropdown of embedded 2000s clip GIFs (placeholder images for now). */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 hidden min-w-[260px] flex-wrap gap-2 rounded-md bg-obsidian p-3 shadow-2xl ring-1 ring-silver-gray/30 group-hover:flex">
        {gifs.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${item.label} look ${i + 1}`}
            className="h-28 w-40 rounded object-cover object-top"
            loading="lazy"
          />
        ))}
        <Link
          href={item.href}
          className="mt-2 block text-center text-[10px] uppercase tracking-widest text-amber"
        >
          View {item.label}
        </Link>
      </div>
    </div>
  );
}
