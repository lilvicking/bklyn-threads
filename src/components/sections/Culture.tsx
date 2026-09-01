import Link from "next/link";

interface ScrapEntry {
  id: number;
  text: string;
  img: string;
}

const ENTRIES: ScrapEntry[] = [
  { id: 1, text: "The Arch — STL 2003", img: "https://placehold.co/480x640/111111/ffffff?text=Arch" },
  { id: 2, text: "Gate Camp '99", img: "https://placehold.co/480x720/1a1a1a/ffffff?text=Gate+Camp" },
  { id: 3, text: "Parking Lot Flex", img: "https://placehold.co/480x520/222222/ffffff?text=Parking+Lot" },
  { id: 4, text: "Summer '04 Mix", img: "https://placehold.co/480x600/111111/ffffff?text=Mix+Tape" },
  { id: 5, text: "Sidewalk Sessions", img: "https://placehold.co/480x500/1a1a1a/ffffff?text=Sidewalk" },
  { id: 6, text: "Backyard BBQ", img: "https://placehold.co/480x660/222222/ffffff?text=BBQ" },
];

// Torn-paper clip-path points (a rough jagged edge)
const TORN =
  "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%)";

export default function Culture() {
  return (
    <section id="culture" className="relative mx-auto max-w-7xl px-4 py-16">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl text-amber">The Culture</h2>
        <p className="mt-2 text-xs uppercase tracking-widest text-silver-gray">
          A scrapbook of STL weekends that never ended.
        </p>
      </div>

      {/* Metallic tape spines */}
      <div className="absolute left-1/2 top-0 hidden -translate-x-1/2 -translate-y-1/2 h-8 w-64 -rotate-10 bg-gradient-to-r from-silver-gray/30 via-bone-white/40 to-silver-gray/30 md:block" />

      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
        {ENTRIES.map((e) => (
          <div
            key={e.id}
            className="relative mb-6 inline-block w-full rounded-md"
          >
            {/* Torn-paper border via inset box-shadow */}
            <div className="relative overflow-hidden rounded-md">
              <img
                src={e.img}
                alt={e.text}
                className="h-auto w-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Metallic tape accent */}
            <div className="absolute -top-1 left-2 right-2 h-2 -translate-y-1/2 bg-gradient-to-r from-silver-gray/40 via-bone-white/50 to-silver-gray/40" />
            <p className="font-display text-center text-xs text-bone-white">
              {e.text}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="#shop"
          className="inline-block border border-amber px-5 py-2 font-display text-xs uppercase tracking-widest text-amber"
        >
          Explore The Culture
        </Link>
      </div>
    </section>
  );
}
