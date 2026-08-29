"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { DollarSign, ShoppingBag, Package, AlertTriangle } from "lucide-react";

type Analytics = {
  activeProducts: number;
  salesTodayCents: number;
  ordersTodayCount: number;
  recentOrders: Array<{
    id: string;
    status: string;
    total: number;
    createdAt: string;
    user: { name: string | null; email: string | null } | null;
  }>;
  lowStockAlerts: Array<{
    variantId: string;
    sku: string;
    stock: number;
    productName: string;
    productSlug: string;
    size: string | null;
    color: string | null;
  }>;
  topSellingProducts: Array<{
    productId: string;
    name: string;
    slug: string;
    unitsSold: number;
  }>;
};

function Card({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-silver-gray/20 bg-black/30 p-5">
      <p className="text-xs uppercase tracking-widest text-silver-gray">{label}</p>
      <div className="mt-3 text-2xl font-semibold text-bone-white">{children}</div>
      {hint && <p className="mt-1 text-xs text-silver-gray">{hint}</p>}
    </div>
  );
}
export default function AnalyticsDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
      .then(setData)
      .catch(() => setError("Could not load analytics."));
  }, []);

  if (error) return <p className="text-sm text-cardinal">{error}</p>;
  if (!data) return <p className="text-sm text-silver-gray">Loading…</p>;

  const lowStockLink = (slug: string) =>
    `/admin/products?q=${encodeURIComponent(slug)}`;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Sales today" hint={`${data.ordersTodayCount} order(s)`}>
          <span className="flex items-center gap-2">
            <DollarSign size={18} /> {formatPrice(data.salesTodayCents)}
          </span>
        </Card>
        <Card label="Orders today" hint="all statuses">
          <span className="flex items-center gap-2">
            <ShoppingBag size={18} /> {data.ordersTodayCount}
          </span>
        </Card>
        <Card label="Active products" hint="live listings">
          <span className="flex items-center gap-2">
            <Package size={18} /> {data.activeProducts}
          </span>
        </Card>
        <Card label="Low stock alerts" hint="variants ≤ 5 units">
          <span className="flex items-center gap-2">
            <AlertTriangle size={18} /> {data.lowStockAlerts.length}
          </span>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded border border-silver-gray/20 bg-black/30 p-5">
          <h2 className="font-display text-lg tracking-widest text-amber">
            Top selling products
          </h2>
          <ul className="mt-3 space-y-2">
            {data.topSellingProducts.length === 0 && (
              <p className="text-sm text-silver-gray">No sales yet.</p>
            )}
            {data.topSellingProducts.map((p) => (
              <li
                key={p.productId}
                className="flex items-center justify-between border-b border-silver-gray/10 pb-2 text-sm"
              >
                <Link
                  href={`/admin/products/${p.productId}/edit`}
                  className="truncate pr-3 text-bone-white hover:text-amber"
                >
                  {p.name}
                </Link>
                <span className="whitespace-nowrap text-silver-gray">
                  {p.unitsSold} sold
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded border border-silver-gray/20 bg-black/30 p-5">
          <h2 className="font-display text-lg tracking-widest text-amber">
            Low stock alerts
          </h2>
          <ul className="mt-3 space-y-2">
            {data.lowStockAlerts.length === 0 && (
              <p className="text-sm text-silver-gray">All stocked.</p>
            )}
            {data.lowStockAlerts.map((v) => (
              <li
                key={v.variantId}
                className="flex items-center justify-between border-b border-silver-gray/10 pb-2 text-sm"
              >
                <Link
                  href={lowStockLink(v.productSlug)}
                  className="truncate pr-3 text-bone-white hover:text-amber"
                >
                  {v.productName}
                  {v.size ? ` — ${v.size}` : ""}
                </Link>
                <span
                  className={
                    v.stock <= 2
                      ? "whitespace-nowrap text-cardinal"
                      : "whitespace-nowrap text-silver-gray"
                  }
                >
                  {v.stock} left
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded border border-silver-gray/20 bg-black/30 p-5">
        <h2 className="font-display text-lg tracking-widest text-amber">
          Recent orders
        </h2>
        <div className="mt-3 divide-y divide-silver-gray/10">
          {data.recentOrders.length === 0 && (
            <p className="text-sm text-silver-gray">No orders yet.</p>
          )}
          {data.recentOrders.map((o) => (
            <Link
              key={o.id}
              href={`/admin/orders/${o.id}`}
              className="flex items-center justify-between gap-3 py-2.5 text-sm hover:bg-silver-gray/5"
            >
              <span className="truncate">
                <span className="text-bone-white">#{o.id.slice(0, 8)}</span>
                <span className="ml-3 text-silver-gray">
                  {o.user?.name ?? o.user?.email ?? "Guest"}
                </span>
              </span>
              <span className="whitespace-nowrap text-silver-gray">{o.status}</span>
              <span className="whitespace-nowrap text-bone-white">
                {formatPrice(o.total)}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}