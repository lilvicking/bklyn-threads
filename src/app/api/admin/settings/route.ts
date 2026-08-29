import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const revalidate = 0;

// Ensures the singleton row exists.
async function ensureSettings() {
  const existing = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.siteSettings.create({ data: { id: 1 } });
}

// GET /api/admin/settings — full SiteSettings record
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const settings = await ensureSettings();
  return NextResponse.json(settings);
}

// PATCH /api/admin/settings — partial update of allowed scalar fields
export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const allowed: Record<string, unknown> = {};

  const stringKeys = [
    "siteTitle",
    "metaDescription",
    "ogImageUrl",
    "heroVideoUrl",
    "headerBgColor",
    "footerBgColor",
    "primaryButtonColor",
    "accentColor",
    "textColor",
    "backgroundType",
    "backgroundValue",
    "backgroundImageUrl",
    "headingFont",
    "bodyFont",
    "supportedRegions",
    "termsOfService",
    "privacyPolicy",
    "refundPolicy",
  ] as const;

  for (const key of stringKeys) {
    if (typeof body[key] === "string") allowed[key] = body[key];
  }

  const boolKeys = ["heroVideoAutoplay", "heroVideoMuted"] as const;
  for (const key of boolKeys)
    if (typeof body[key] === "boolean") allowed[key] = body[key];

  const intKeys = [
    "shippingFlatRate",
    "freeShippingThreshold",
  ] as const;
  for (const key of intKeys)
    if (typeof body[key] === "number") allowed[key] = body[key];

  await ensureSettings();

  const settings = await prisma.siteSettings.update({
    where: { id: 1 },
    data: allowed,
  });

  return NextResponse.json(settings);
}