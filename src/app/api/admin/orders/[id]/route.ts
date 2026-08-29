import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { OrderStatusEnum } from "@/types";

export const revalidate = 0;

// GET /api/admin/orders/:id — detail with items + shipping + customer
export async function GET(
  _req: Request,
  ctx: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const order = await prisma.order.findUnique({
    where: { id: ctx.params.id },
    include: {
      user: { select: { id: true, email: true, name: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true } },
          variant: true,
        },
      },
    },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(order);
}

// PATCH /api/admin/orders/:id — status / trackingNumber / notes
export async function PATCH(
  req: Request,
  ctx: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const data = body ?? {};

  const patch: Record<string, unknown> = {};
  if (typeof data.status === "string") {
    if (!OrderStatusEnum.safeParse(data.status).success)
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    patch.status = data.status;
  }
  if (typeof data.trackingNumber === "string")
    patch.trackingNumber = data.trackingNumber;
  if (typeof data.notes === "string") patch.notes = data.notes;

  const order = await prisma.order.update({
    where: { id: ctx.params.id },
    data: patch,
    include: { items: { include: { product: true, variant: true } } },
  });

  return NextResponse.json(order);
}

// DELETE /api/admin/orders/:id
export async function DELETE(
  _req: Request,
  ctx: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.order.delete({ where: { id: ctx.params.id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}