"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

/**
 * Client upload control. Posts a single file to /api/admin/upload, then calls
 * back with the resulting public URL. `type` maps to images|videos on the API.
 */
export default function UploadButton({
  type = "images",
  label,
  onUploaded,
}: {
  type?: "images" | "videos";
  label?: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File) {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", type);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Upload failed");
      onUploaded(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-sm border border-silver-gray/30 bg-silver-gray/5 px-3 py-1.5 text-sm text-bone-white hover:bg-silver-gray/10 disabled:opacity-50"
      >
        <Upload size={14} /> {busy ? "Uploading…" : label ?? "Upload"}
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={type === "videos" ? "video/mp4,video/webm" : "image/*"}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
        }}
      />
      {error && <p className="mt-1 text-xs text-cardinal">{error}</p>}
    </div>
  );
}