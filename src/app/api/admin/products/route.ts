import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { AdminProductSchema } from "@/types";

export const revalidate = 0;

// slugify for fast unique-slug creation when the form supplies a name first.
function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `product-${Date.now()}`
  );
}

// GET /api/admin/products?q=&category=&status=&inventoryStatus=
export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const inventoryStatus = searchParams.get("inventoryStatus");

  const products = await prisma.product.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(category ? { category: category as never } : {}),
      ...(status ? { status: status as never } : {}),
      ...(inventoryStatus ? { inventoryStatus: inventoryStatus as never } : {}),
    },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

// POST /api/admin/products — create a product
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = AdminProductSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  const slug = data.slug || slugify(data.name);

  // category must be one of the fixed enums (create-new handled via UI prompt
  // mapping to the closest enum; see admin docs).
  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description ?? null,
      category: data.category,
      status: data.status,
      inventoryStatus: data.inventoryStatus,
      basePrice: data.basePrice,
      salePrice: data.salePrice ?? null,
      sku: data.sku ?? null,
      featured: data.featured ?? false,
      images: {
        create: data.images.map((img, i) => ({
          url: img.url,
          alt: img.alt ?? null,
          position: img.position ?? i,
          featured: img.featured ?? false,
        })),
      },
      variants: {
        create: data.variants.map((v, i) => ({
          sku: v.sku ?? `${slug.toUpperCase()}-${i}`,
          size: v.size ?? null,
          color: v.color ?? null,
          priceAdj: v.priceAdj ?? 0,
          stock: v.stock ?? 0,
        })),
      },
    },
    include: { images: true, variants: true },
  });

  return NextResponse.json(product, { status: 201 });
}