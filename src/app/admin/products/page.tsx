import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { categoryLabels } from "@/types";
import ProductFilters from "@/components/admin/ProductFilters";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const revalidate = 0;

const ORDER_BY = { createdAt: "desc" as const };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; status?: string; inventoryStatus?: string };
}) {
  const q = searchParams.q?.trim();
  const { category, status, inventoryStatus } = searchParams;

  const products = await prisma.product.findMany({
    where: {
      ...(q
        ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }] }
        : {}),
      ...(category ? { category: category as never } : {}),
      ...(status ? { status: status as never } : {}),
      ...(inventoryStatus ? { inventoryStatus: inventoryStatus as never } : {}),
    },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
    },
    orderBy: ORDER_BY,
  });

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-widest text-amber">PRODUCTS</h1>
          <p className="mt-1 text-sm text-silver-gray">{products.length} listing(s).</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-sm bg-amber px-4 py-2 font-display text-sm uppercase tracking-widest text-black hover:bg-amber/80"
        >
          <Plus size={16} /> New product
        </Link>
      </header>

      <ProductFilters />

      <div className="mt-4 overflow-x-auto rounded border border-silver-gray/20 bg-black/30">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-silver-gray/20 text-left text-xs uppercase tracking-wider text-silver-gray">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-silver-gray/10">
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-silver-gray">
                  No products match.
                </td>
              </tr>
            )}
            {products.map((p) => {
              const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
              const effective = p.salePrice && p.salePrice < p.basePrice ? p.salePrice : p.basePrice;
              return (
                <tr key={p.id} className="hover:bg-silver-gray/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.images[0].url}
                          alt={p.name}
                          className="h-12 w-12 rounded-sm object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-sm bg-silver-gray/10" />
                      )}
                      <div>
                        <Link href={`/admin/products/${p.id}/edit`} className="text-bone-white hover:text-amber">
                          {p.name}
                        </Link>
                        <p className="text-xs text-silver-gray">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-silver-gray">
                    {categoryLabels[p.category as keyof typeof categoryLabels] ?? p.category}
                  </td>
                  <td className="px-4 py-3">
                    {formatPrice(effective)}
                    {p.salePrice && p.salePrice < p.basePrice && (
                      <span className="ml-1 text-xs text-silver-gray line-through">
                        {formatPrice(p.basePrice)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={totalStock <= 5 ? "text-cardinal" : "text-silver-gray"}>
                      {totalStock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-silver-gray">{p.inventoryStatus.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-xs text-amber underline-offset-2 hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteProductButton productId={p.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}