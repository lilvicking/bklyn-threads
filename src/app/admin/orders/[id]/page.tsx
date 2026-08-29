import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { orderStatusLabels } from "@/lib/admin";
import OrderActions from "@/components/admin/OrderActions";

export const revalidate = 0;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { email: true, name: true } },
      items: {
        include: {
          product: { select: { name: true, slug: true } },
          variant: true,
        },
      },
    },
  });

  if (!order) {
    return (
      <div>
        <p className="text-sm text-cardinal">Order not found.</p>
        <Link href="/admin/orders" className="mt-2 inline-block text-sm text-amber hover:underline">
          ← Back to orders
        </Link>
      </div>
    );
  }

  const ship = [
    order.shippingLine1,
    order.shippingCity,
    order.shippingPostal,
    order.shippingCountry,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <header className="mb-6">
        <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-silver-gray hover:text-bone-white">
          <ArrowLeft size={15} /> Back to orders
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl tracking-widest text-amber">#{order.id.slice(0, 8)}</h1>
          <span className="rounded-sm border border-silver-gray/25 bg-silver-gray/5 px-2 py-0.5 text-xs uppercase tracking-wider">
            {orderStatusLabels[order.status] ?? order.status}
          </span>
          <span className="text-lg text-bone-white">{formatPrice(order.total)}</span>
        </div>
        <p className="mt-1 text-sm text-silver-gray">
          Placed {new Date(order.createdAt).toLocaleString()} ·{" "}
          {order.user?.name ?? order.user?.email ?? "Guest"}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded border border-silver-gray/20 bg-black/30 p-5">
            <h2 className="font-display text-lg tracking-widest text-amber">Items</h2>
            <div className="mt-3 divide-y divide-silver-gray/10">
              {order.items.map((it) => (
                <div key={it.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="text-bone-white">{it.product.name}</p>
                    <p className="text-xs text-silver-gray">
                      {it.variant?.size ? `Size ${it.variant.size} · ` : ""}
                      {it.variant?.color ? `Color ${it.variant.color} · ` : ""}
                      SKU {it.variant?.sku ?? "—"} · Qty {it.quantity}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-bone-white">
                    {formatPrice(it.unitPrice * it.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1 border-t border-silver-gray/20 pt-4 text-sm text-silver-gray">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-bone-white">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-bone-white">
                  {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-base text-bone-white">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>

          {ship && (
            <section className="rounded border border-silver-gray/20 bg-black/30 p-5">
              <h2 className="flex items-center gap-2 font-display text-lg tracking-widest text-amber">
                <MapPin size={16} /> Shipping address
              </h2>
              <p className="mt-3 text-sm text-bone-white">{order.shippingName ?? ""}</p>
              <p className="text-sm text-silver-gray">{ship}</p>
            </section>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="rounded border border-silver-gray/20 bg-black/30 p-5">
            <h2 className="font-display text-lg tracking-widest text-amber">Manage</h2>
            <div className="mt-4">
              <OrderActions
                orderId={order.id}
                currentStatus={order.status}
                trackingNumber={order.trackingNumber}
                initialNotes={order.notes}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}