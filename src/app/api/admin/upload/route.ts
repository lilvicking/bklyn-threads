import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/admin";

export const revalidate = 0;
// Allow 60mb for hero videos per the requirement.
export const maxDuration = 60;

const ALLOWED_IMAGE = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);
const ALLOWED_VIDEO = new Set(["mp4", "webm"]);
const MAX_VIDEO = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE = 10 * 1024 * 1024; // 10MB

// POST /api/admin/upload — multipart; returns { url } for the saved file.
// Form field: `file`. Optional field: `folder` = images (default) | videos.
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Not a valid upload" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0)
    return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const folder = form.get("type") === "videos" ? "videos" : "images";
  const ext = (file.name.split(".").pop() ?? "").toLowerCase();

  if (folder === "images" && !ALLOWED_IMAGE.has(ext))
    return NextResponse.json(
      { error: "Unsupported image type. Allowed: " + [...ALLOWED_IMAGE].join(", ") },
      { status: 400 },
    );
  if (folder === "videos" && !ALLOWED_VIDEO.has(ext))
    return NextResponse.json(
      { error: "Unsupported video type. Allowed: mp4, webm" },
      { status: 400 },
    );

  const limit = folder === "videos" ? MAX_VIDEO : MAX_IMAGE;
  if (file.size > limit)
    return NextResponse.json(
      { error: `File too large (max ${Math.floor(limit / 1024 / 1024)}MB)` },
      { status: 400 },
    );

  const bytes = Buffer.from(await file.arrayBuffer());
  const base = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(base, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const filename = `${Date.now()}-${safeName}`;
  await writeFile(path.join(base, filename), bytes);

  return NextResponse.json({
    url: `/uploads/${folder}/${filename}`,
    meta: { name: safeName, size: file.size, type: file.type },
  });
}