"use client";

import { useRef, useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus("sent");
  };

  return (
    <footer className="w-full bg-obsidian py-10 text-bone-white">
      <div className="mx-auto max-w-7xl px-4">
        <form onSubmit={submit} className="flex max-w-sm gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="JOIN THE JAYFAB STREET TEAM"
            className="flex-1 border border-silver-gray/30 bg-obsidian px-3 py-2 text-[11px] text-bone-white placeholder-silver-gray/50 focus:outline-none focus:ring-1 focus:ring-amber"
          />
          <button
            type="submit"
            className="border border-amber bg-amber px-4 py-2 font-display text-[11px] font-bold uppercase tracking-widest text-obsidian"
          >
            Sign up
          </button>
        </form>

        {status === "sent" && (
          <p className="mt-3 text-xs text-amber">Thanks — you're on the list.</p>
        )}

        <div className="mt-4 flex gap-4 text-xs">
          <Link href="#" className="text-silver-gray hover:text-amber">TikTok</Link>
          <Link href="#" className="text-silver-gray hover:text-amber">Instagram</Link>
          <Link href="#" className="text-silver-gray hover:text-amber">Twitter / X</Link>
        </div>
      </div>

      {/* Floating Winamp/iPod-style audio widget — bottom left corner. */}
      <AudioWidget />
    </footer>
  );
}

function AudioWidget() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  // NOTE: /audio/jayfab-bounce.mp3 is a placeholder path — drop a real
  // royalty-free STL beat there and the widget becomes live.
  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
    } else {
      a.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-md bg-[#1a1a1e] px-3 py-2 text-xs text-bone-white shadow-2xl ring-1 ring-silver-gray/40">
      <audio ref={audioRef} src="/audio/jayfab-bounce.mp3" loop />
      <span className="w-36 truncate">STL Bounce • 0:00 / 1:12</span>
      <button
        type="button"
        onClick={toggle}
        className="grid h-5 w-5 place-items-center rounded border border-silver-gray/30 text-[9px]"
      >
        {playing ? "⏸︎" : "▶"}
      </button>
    </div>
  );
}

