import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    redirect(`/login?callbackUrl=/admin`);
  }

  return (
    <div className="flex min-h-screen bg-obsidian text-bone-white">
      <AdminSidebar />
      <main className="min-w-0 flex-1 px-6 py-8">{children}</main>
    </div>
  );
}