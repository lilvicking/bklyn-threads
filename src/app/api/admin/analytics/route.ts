import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const revalidate = 0;

// GET /api/admin/analytics — dashboard metrics.
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const [todayOrders, totals, topSelling, lowStock, activeProducts] =
    await Promise.all([
      // Sales today (only completed orders).
      prisma.order.findMany({
        where: { createdAt: { gte: startOfToday, lt: endOfToday } },
        select: { total: true, id: true, status: true },
      }),

      // Lifetime totals per status.
      prisma.order.groupBy({ by: ["status"], _sum: { total: true }, _count: true }),

      // Top products by units sold.
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),

      // Low stock alerts (variants with <= 5 units).
      prisma.variant.findMany({
        where: { stock: { lte: 5 } },
        include: { product: { select: { id: true, name: true, slug: true } } },
        orderBy: { stock: "asc" },
        take: 10,
      }),

      prisma.product.count({ where: { status: "ACTIVE" } }),
    ]);

  const productNames = await prisma.product.findMany({
    where: {
      id: { in: topSelling.map((t) => t.productId) },
    },
    select: { id: true, name: true, slug: true },
  });

  const salesToday = todayOrders
    .filter((o) => o.status !== "CANCELLED" && o.status !== "REFUNDED")
    .reduce((sum, o) => sum + o.total, 0);

  const topSellingProducts = topSelling.map((row) => {
    const product = productNames.find((p) => p.id === row.productId);
    return {
      productId: row.productId,
      name: product?.name ?? "Unknown",
      slug: product?.slug ?? "",
      unitsSold: row._sum.quantity ?? 0,
    };
  });

  return NextResponse.json({
    activeProducts,
    salesTodayCents: salesToday,
    ordersTodayCount: todayOrders.length,
    recentOrders: await prisma.order.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    totalsByStatus: totals,
    lowStockAlerts: lowStock.map((v) => ({
      variantId: v.id,
      sku: v.sku,
      stock: v.stock,
      productName: v.product.name,
      productSlug: v.product.slug,
      size: v.size ?? null,
      color: v.color ?? null,
    })),
    topSellingProducts,
  });
}