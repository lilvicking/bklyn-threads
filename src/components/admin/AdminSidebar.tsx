import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  Clapperboard,
  LogOut,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/media", label: "Media & Branding", icon: Clapperboard },
  { href: "/admin/settings", label: "Settings & SEO", icon: Settings },
];

export default function AdminSidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-silver-gray/15 bg-black/30">
      <div className="px-5 py-5">
        <h2 className="font-display text-lg tracking-widest text-amber">
          BKLYN<span className="text-bone-white">/ADMIN</span>
        </h2>
        <Link
          href="/"
          className="mt-1 inline-block text-xs text-silver-gray hover:text-bone-white"
        >
          ← Back to storefront
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-silver-gray transition-colors hover:bg-silver-gray/10 hover:text-bone-white"
            >
              <Icon size={16} strokeWidth={1.75} />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-silver-gray/20 p-3">
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-silver-gray hover:text-cardinal"
        >
          <LogOut size={16} strokeWidth={1.75} />
          Sign out
        </Link>
      </div>
    </aside>
  );
}