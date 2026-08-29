import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const revalidate = 0;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim();

  const customers = await prisma.user.findMany({
    where: {
      role: { not: "ADMIN" },
      ...(q
        ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] }
        : {}),
    },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 20 },
    },
    orderBy: { createdAt: "desc" },
  });

  const guestOrders = await prisma.order.findMany({
    where: {
      userId: null,
      ...(q ? { shippingName: { contains: q, mode: "insensitive" } } : {}),
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const inputCls =
    "border border-silver-gray/30 bg-obsidian px-3 py-1.5 text-sm text-bone-white outline-none focus:border-amber";

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl tracking-widest text-amber">CUSTOMERS</h1>
        <p className="mt-1 text-sm text-silver-gray">
          {customers.length} registered customer(s) · {guestOrders.length} guest order(s).
        </p>
      </header>

      <form className="mb-4 flex items-center gap-3" method="get">
        <input name="q" defaultValue={q} placeholder="Search email, name or guest…" className={inputCls} />
        <button type="submit" className="rounded-sm bg-amber px-4 py-1.5 text-sm font-semibold text-black">
          Search
        </button>
      </form>

      <section className="rounded border border-silver-gray/20 bg-black/30">
        <h2 className="border-b border-silver-gray/20 px-5 py-3 font-display text-lg tracking-widest text-amber">
          Registered customers
        </h2>
        {customers.length === 0 && <p className="px-5 py-8 text-sm text-silver-gray">No registered customers.</p>}
        <div className="divide-y divide-silver-gray/10">
          {customers.map((c) => {
            const lifetime = c.orders.reduce((s, o) => s + o.total, 0);
            return (
              <div key={c.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div>
                  <p className="text-bone-white">{c.name ?? c.email}</p>
                  <p className="text-xs text-silver-gray">{c.email} · joined {new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-bone-white">{c.orders.length} order(s)</p>
                  <p className="text-xs text-silver-gray">{formatPrice(lifetime)} lifetime</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded border border-silver-gray/20 bg-black/30">
        <h2 className="border-b border-silver-gray/20 px-5 py-3 font-display text-lg tracking-widest text-amber">
          Guest orders
        </h2>
        {guestOrders.length === 0 && <p className="px-5 py-8 text-sm text-silver-gray">No guest orders.</p>}
        <div className="divide-y divide-silver-gray/10">
          {guestOrders.map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-silver-gray/5">
              <div>
                <p className="text-bone-white">{o.shippingName ?? "Guest"}</p>
                <p className="text-xs text-silver-gray">{o.shippingLine1 ?? "—"} · #{o.id.slice(0, 8)}</p>
              </div>
              <div className="text-right">
                <p className="text-bone-white">{formatPrice(o.total)}</p>
                <p className="text-xs text-silver-gray">{new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}