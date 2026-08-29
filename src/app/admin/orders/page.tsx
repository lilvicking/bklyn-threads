import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { orderStatusLabels } from "@/lib/admin";

export const revalidate = 0;

const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const { status, q } = searchParams;

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(q?.trim()
        ? {
            OR: [
              { id: { contains: q.trim(), mode: "insensitive" } },
              { shippingName: { contains: q.trim(), mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { email: true, name: true } },
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const inputCls =
    "border border-silver-gray/30 bg-obsidian px-3 py-1.5 text-sm text-bone-white outline-none focus:border-amber";

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl tracking-widest text-amber">ORDERS</h1>
        <p className="mt-1 text-sm text-silver-gray">{orders.length} order(s).</p>
      </header>

      <form
        className="mb-4 flex flex-wrap items-center gap-3"
        // eslint-disable-next-line react/no-unknown-property
        method="get"
      >
        <input name="q" defaultValue={q} placeholder="Search id or customer…" className={inputCls} />
        <select name="status" defaultValue={status ?? ""} className={inputCls}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{orderStatusLabels[s] ?? s}</option>
          ))}
        </select>
        <button type="submit" className="rounded-sm bg-amber px-4 py-1.5 text-sm font-semibold text-black">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded border border-silver-gray/20 bg-black/30">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-silver-gray/20 text-left text-xs uppercase tracking-wider text-silver-gray">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-silver-gray/10">
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-silver-gray">
                  No orders match.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-silver-gray/5">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-bone-white hover:text-amber">
                    #{o.id.slice(0, 8)}
                  </Link>
                  {o.trackingNumber && <p className="text-xs text-silver-gray">Tracking {o.trackingNumber}</p>}
                </td>
                <td className="px-4 py-3 text-silver-gray">
                  {o.shippingName ?? o.user?.name ?? o.user?.email ?? "Guest"}
                </td>
                <td className="px-4 py-3 text-silver-gray">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-sm border border-silver-gray/25 bg-silver-gray/5 px-2 py-0.5 text-xs uppercase tracking-wide">
                    {orderStatusLabels[o.status] ?? o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-bone-white">{formatPrice(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}