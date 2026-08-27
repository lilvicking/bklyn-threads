import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl tracking-widest text-amber">ADMIN</h1>
      <p className="mt-1 text-sm text-silver-gray">
        Signed in as {session.user.email} — inventory management coming next.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Products", hint: "Create & edit listings" },
          { label: "Orders", hint: "Fulfillment & tracking" },
          { label: "Media", hint: "Image uploads" },
        ].map((c) => (
          <div
            key={c.label}
            className="border border-silver-gray/20 bg-black/30 p-5 text-center"
          >
            <p className="font-display text-lg text-bone-white">{c.label}</p>
            <p className="mt-1 text-xs text-silver-gray">{c.hint}</p>
          </div>
        ))}
      </div>
    </main>
  );
}