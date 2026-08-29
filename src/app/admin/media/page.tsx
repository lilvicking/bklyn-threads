"use client";

import { useEffect, useState } from "react";
import UploadButton from "@/components/admin/UploadButton";

type Settings = {
  heroVideoUrl: string | null;
  heroVideoAutoplay: boolean;
  heroVideoMuted: boolean;
  headerBgColor: string;
  footerBgColor: string;
  primaryButtonColor: string;
  accentColor: string;
  textColor: string;
  backgroundType: string;
  backgroundValue: string;
  backgroundImageUrl: string | null;
  headingFont: string;
  bodyFont: string;
};

const THEME_FIELDS = [
  ["headerBgColor", "Header background"],
  ["footerBgColor", "Footer background"],
  ["primaryButtonColor", "Primary button"],
  ["accentColor", "Accent color"],
  ["textColor", "Text color"],
] as const;

const FONTS = ["VT323", "Inter", "Space Grotesk", "Syne", "Bebas Neue", "IBM Plex Mono"];

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-3 border border-silver-gray/20 bg-obsidian px-3 py-2">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 cursor-pointer border-0 bg-transparent" />
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-24 bg-transparent font-mono text-sm text-bone-white outline-none" />
    </label>
  );
}

const cls = "block text-xs uppercase tracking-wider text-silver-gray";
const inputCls =
  "mt-1 w-full border border-silver-gray/30 bg-obsidian px-3 py-2 text-sm text-bone-white outline-none focus:border-amber";
const h2 = "font-display text-lg tracking-widest text-amber";
export default function MediaPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load"))))
      .then(setS)
      .catch(() => setMessage("Could not load settings."));
  }, []);

  if (!s) return <p className="text-sm text-silver-gray">{message ?? "Loading…"}</p>;

  async function save(patch: Partial<Settings>) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Save failed");
      setS(json);
      setMessage("Saved.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {message && (
        <p className={"text-sm " + (message.startsWith("Could") ? "text-cardinal" : "text-emerald-300")}>{message}</p>
      )}

      <section className="rounded border border-silver-gray/20 bg-black/30 p-5">
        <h2 className={h2}>Hero video</h2>
        <p className="mt-1 text-xs text-silver-gray">MP4 / WebM, up to 50MB. Shown on the storefront hero.</p>
        <div className="mt-4 space-y-4">
          {s.heroVideoUrl ? (
            <video
              key={s.heroVideoUrl}
              src={s.heroVideoUrl}
              controls
              autoPlay={s.heroVideoAutoplay}
              muted={s.heroVideoMuted}
              className="aspect-video w-full rounded-sm border border-silver-gray/20 bg-black"
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-sm border border-dashed border-silver-gray/30 text-sm text-silver-gray">
              No hero video uploaded
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <UploadButton type="videos" label="Upload video" onUploaded={(url) => save({ heroVideoUrl: url })} />
            {s.heroVideoUrl && (
              <button
                type="button"
                onClick={() => save({ heroVideoUrl: null as never })}
                className="rounded-sm border border-cardinal/40 px-3 py-1.5 text-sm text-cardinal hover:bg-cardinal/10"
              >
                Remove
              </button>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-silver-gray">
            <input type="checkbox" checked={s.heroVideoAutoplay} onChange={(e) => save({ heroVideoAutoplay: e.target.checked })} />
            Autoplay
          </label>
          <label className="flex items-center gap-2 text-sm text-silver-gray">
            <input type="checkbox" checked={s.heroVideoMuted} onChange={(e) => save({ heroVideoMuted: e.target.checked })} />
            Muted
          </label>
        </div>
      </section>
<section className="rounded border border-silver-gray/20 bg-black/30 p-5">
        <h2 className={h2}>Theme customization</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-1 md:grid-cols-2">
          {THEME_FIELDS.map(([key, label]) => (
            <div key={key}>
              <p className="mb-1 text-xs uppercase tracking-wider text-silver-gray">{label}</p>
              <ColorField value={s[key as keyof Settings] as string} onChange={(v) => save({ [key]: v })} />
            </div>
          ))}
        </div>

        <div className="mt-5">
          <label className={cls}>Background</label>
          <div className="mt-2 flex gap-2">
            {["solid_color", "gradient", "image"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => save({ backgroundType: t })}
                className={
                  "flex-1 rounded-sm border px-3 py-2 text-sm capitalize transition-colors " +
                  (s.backgroundType === t ? "border-amber bg-amber/10 text-amber" : "border-silver-gray/30 text-silver-gray hover:text-bone-white")
                }
              >
                {t.replaceAll("_", " ")}
              </button>
            ))}
          </div>
          {s.backgroundType === "solid_color" && (
            <div className="mt-3">
              <ColorField value={s.backgroundValue} onChange={(v) => save({ backgroundValue: v })} />
            </div>
          )}
          {s.backgroundType === "gradient" && (
            <input
              value={s.backgroundValue}
              onChange={(e) => save({ backgroundValue: e.target.value })}
              className={inputCls}
              placeholder="linear-gradient(135deg, #0d0d0d, #c41e3a)"
            />
          )}
          {s.backgroundType === "image" && (
            <div className="mt-3">
              {s.backgroundImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.backgroundImageUrl} alt="" className="mb-2 h-24 w-full rounded-sm object-cover" />
              )}
              <UploadButton type="images" label="Upload background image" onUploaded={(url) => save({ backgroundImageUrl: url })} />
            </div>
          )}
        </div>

        <div className="mt-5">
          <label className={cls}>Heading font</label>
          <select value={s.headingFont} onChange={(e) => save({ headingFont: e.target.value })} className={inputCls}>
            {FONTS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
          <label className={cls + " mt-3"}>Body font</label>
          <select value={s.bodyFont} onChange={(e) => save({ bodyFont: e.target.value })} className={inputCls}>
            {FONTS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="mt-6">
          <button
            type="button"
            disabled={saving}
            onClick={() => save({})}
            className="rounded-sm bg-amber px-6 py-2.5 font-display text-sm uppercase tracking-widest text-black hover:bg-amber/80 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save branding"}
          </button>
        </div>
      </section>
    </div>
  );
}