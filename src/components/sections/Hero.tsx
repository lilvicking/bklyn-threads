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

      {/* CRT-style dark overlay for legibility */}
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <h1 className="font-display text-4xl leading-tight text-bone-white drop-shadow-[0_0_14px_rgba(245,197,24,.75)] sm:text-5xl md:text-6xl">
          MIDWEST HEAT.
          <br />
          <span className="text-amber">Y2K FLAVA.</span>
        </h1>

        <Link
          href="#shop"
          className="mt-8 inline-block border-2 border-amber bg-amber px-6 py-3 font-display text-xs font-bold tracking-widest uppercase text-obsidian transition-all duration-200 hover:scale-105 hover:shadow-[0_0_28px_rgba(245,197,24,.9)]"
        >
          SHOP THE COLLECTION
        </Link>
      </div>
    </section>
  );
}
