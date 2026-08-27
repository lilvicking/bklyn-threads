import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

// GET /api/products?category=TEES — list active products.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      ...(category ? { category: category as never } : {}),
    },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}