import Link from "next/link";

interface HeroProps {
  videoUrl: string | null;
  autoplay?: boolean;
  muted?: boolean;
}

export default function Hero({
  videoUrl,
  autoplay = true,
  muted = true,
}: HeroProps) {
  // Browsers block *unmuted* autoplay. So whenever we autoplay, force muted +
  // playsInline — that is the correct fix for "autoplay blocked by the browser".
  const willAutoPlay = !!videoUrl && autoplay;
  const isMuted = willAutoPlay ? true : muted;

  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      {videoUrl ? (
        <video
          src={videoUrl}
          autoPlay={willAutoPlay}
          muted={isMuted}
          playsInline
          loop
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        // Placeholder gradient background — swap in a real arch/video asset.
        <div className="absolute inset-0 bg-gradient-to-br from-obsidian via-cardinal to-amber" />
      )}

            {/* CRT-style dark overlay + scanlines for legibility */}
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 crt-overlay" />

            <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <h1 className="font-display text-4xl leading-tight text-bone-white drop-shadow-[0_0_14px_rgba(245,197,24,.75)] sm:text-5xl md:text-6xl">
          MIDWEST HEAT.
          <br />
          <span className="text-amber">Y2K FLAVA.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-silver-gray/80 drop-shadow-[0_0_8px_rgba(0,0,0,.8)] sm:text-base">
          St. Louis-bred streetwear rooted in 90s hip-hop. Step in, cop the
          classics, turn the block.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="#shop"
            className="inline-block rounded-xl border-2 border-amber bg-amber px-7 py-3 font-display text-xs font-bold tracking-widest uppercase text-obsidian transition-all duration-200 hover:scale-105 hover:shadow-[0_0_32px_rgba(245,197,24,.9)]"
          >
            SHOP THE COLLECTION
          </Link>
          <Link
            href="#culture"
            className="inline-block rounded-xl border border-silver-gray/40 px-7 py-3 font-display text-xs font-bold tracking-widest uppercase text-bone-white transition-all duration-200 hover:border-amber hover:text-amber"
          >
            THE CULTURE
          </Link>
        </div>
      </div>
    </section>
  );
}
