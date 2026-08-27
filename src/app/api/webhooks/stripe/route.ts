import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// POST /api/webhooks/stripe — handle checkout.session.completed to create an order.
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
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
    const session = event.data.object as Stripe.Checkout.Session;
    const items = session.metadata?.items
      ? (JSON.parse(session.metadata.items) as { variantId: string; quantity: number }[])
      : [];

    await prisma.order.create({
      data: {
        stripeId: session.id,
        subtotal: session.amount_subtotal ?? 0,
        total: session.amount_total ?? 0,
        status: "UNFULFILLED",
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