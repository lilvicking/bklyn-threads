import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { User as DbUser } from "@prisma/client";

/**
 * Guards an admin-only page/route. Returns the authenticated user when the
 * visitor holds the ADMIN role, otherwise `null`.
 */
export async function requireAdmin(): Promise<DbUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "ADMIN") return null;

  // The session only carries id/email/role; resolve the current record so we
  // always operate on a fresh, DB-backed user.
  const id = session.user.id;
  if (!id) return null;

  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({ where: { id } });
  return user && user.role === "ADMIN" ? user : null;
}

/** Stripe-style labels for the order statuses shown in the admin UI. */
export const orderStatusLabels: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export const inventoryStatusLabels: Record<string, string> = {
  IN_STOCK: "In stock",
  OUT_OF_STOCK: "Out of stock",
  PRE_ORDER: "Pre-order",
  HIDDEN_FROM_STORE: "Hidden from store",
};

export const ORDER_STATUS_ORDER = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];