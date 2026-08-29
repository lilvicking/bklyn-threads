import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { AdminProductSchema } from "@/types";

export const revalidate = 0;

// GET /api/admin/products/:id — full product with relations
export async function GET(
  _req: Request,
  ctx: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const product = await prisma.product.findUnique({
    where: { id: ctx.params.id },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      collection: true,
    },
  });
  if (!product)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(product);
}

// PATCH /api/admin/products/:id — update product + replace images/variants
export async function PATCH(
  req: Request,
  ctx: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = AdminProductSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  const id = ctx.params.id;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const slug = data.slug
    ? data.slug
    : data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

  // Replace both child collections in one transaction so edits are atomic.
  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId: id } }),
    prisma.variant.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
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
      },
    }),
    ...data.images.map((img, i) =>
      prisma.productImage.create({
        data: {
          url: img.url,
          alt: img.alt ?? null,
          position: img.position ?? i,
          featured: img.featured ?? false,
          productId: id,
        },
      }),
    ),
    ...data.variants.map((v, i) =>
      prisma.variant.create({
        data: {
          sku: v.sku ?? `${slug.toUpperCase()}-${i}`,
          size: v.size ?? null,
          color: v.color ?? null,
          priceAdj: v.priceAdj ?? 0,
          stock: v.stock ?? 0,
          productId: id,
        },
      }),
    ),
  ]);

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/products/:id
export async function DELETE(
  _req: Request,
  ctx: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.product.findUnique({
    where: { id: ctx.params.id },
  });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.product.delete({ where: { id: ctx.params.id } });
  return NextResponse.json({ ok: true });
}