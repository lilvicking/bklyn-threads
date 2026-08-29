import { createServerClient } from "@/lib/stripe";
// POST /api/checkout — create a Stripe Checkout Session from cart items.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { CheckoutInputSchema } from "@/types";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = CheckoutInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const variantIds = parsed.data.items.map((i) => i.variantId);
  const variants = await prisma.variant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  const line_items = parsed.data.items.map((item) => {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant) throw new Error(`Unknown variant: ${item.variantId}`);
    if (variant.stock < item.quantity)
      throw new Error(`Insufficient stock for ${variant.sku}`);
    return {
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: variant.product.basePrice + variant.priceAdj,
        product_data: {
          name: `${variant.product.name}${variant.size ? ` — ${variant.size}` : ""}`,
        },
      },
    };
  });

  // Get the logged-in user (if any) so we can attach the order later via webhook metadata.
  const session = await getServerSession(authOptions);

  const stripe = createServerClient();
  const sessionObj = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    success_url: `${req.headers.get("origin") ?? "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.get("origin") ?? "http://localhost:3000"}/cart`,
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "JP"],
    },
    metadata: {
      items: JSON.stringify(parsed.data.items),
      userId: session?.user?.id ?? "",
    },
  });

  return NextResponse.json({ url: sessionObj.url });
}