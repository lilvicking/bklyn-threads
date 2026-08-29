import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// POST /api/webhooks/stripe — handle checkout.session.completed to create an order.
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 },
    );
  }

  const raw = await req.text();
  const stripe = createServerClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    // Retrieve the full session to get shipping details.
    const sess = event.data.object as Stripe.Checkout.Session;
    const fullSession = await stripe.checkout.sessions.retrieve(sess.id);

    const items = fullSession.metadata?.items
      ? (JSON.parse(fullSession.metadata.items) as {
          variantId: string;
          quantity: number;
        }[])
      : [];

    // Fetch variants (with products) for correct pricing in OrderItems.
    const variantIds = items.map((i) => i.variantId);
    const variants = await prisma.variant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    // Build order item data
    const orderItems = items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) {
        throw new Error("Variant not found during webhook: " + item.variantId);
      }
      return {
        productId: variant.productId,
        variantId: variant.id,
        unitPrice: variant.product.basePrice + variant.priceAdj,
        quantity: item.quantity,
      };
    });

    // Parse shipping address from Stripe session
    const shipping = fullSession.shipping_details;
    const address = shipping?.address;

    const userId = fullSession.metadata?.userId || undefined;

    await prisma.order.create({
      data: {
        stripeId: fullSession.id,
        subtotal: fullSession.amount_subtotal ?? 0,
        total: fullSession.amount_total ?? 0,
        status: "PENDING",
        shippingName: shipping?.name ?? undefined,
        shippingLine1: address?.line1 ?? undefined,
        shippingCity: address?.city ?? undefined,
        shippingPostal: address?.postal_code ?? undefined,
        shippingCountry: address?.country ?? undefined,
        userId: userId || undefined,
        items: {
          create: orderItems,
        },
      },
    });

    // Deduct stock for fulfilled items.
    for (const item of items) {
      await prisma.variant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  }

  return NextResponse.json({ received: true });
}
