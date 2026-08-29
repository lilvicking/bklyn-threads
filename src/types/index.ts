import { z } from "zod";

export const Category = z.enum([
  "TEES",
  "OUTERWEAR",
  "HEADWEAR",
  "FOOTWEAR",
  "ACCESSORIES",
]);
export type Category = z.infer<typeof Category>;

export const categoryLabels: Record<Category, string> = {
  TEES: "Tees",
  OUTERWEAR: "Outerwear",
  HEADWEAR: "Headwear",
  FOOTWEAR: "Footwear",
  ACCESSORIES: "Accessories",
};

export const ProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  category: Category,
  basePrice: z.number().int().nonnegative(),
});

export type ProductInput = z.infer<typeof ProductSchema>;

// --- Admin: full product create/update payload ---------------------------
export const CategoryEnum = Category;
export const OrderStatusEnum = z.enum([
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);
export const InventoryStatusEnum = z.enum([
  "IN_STOCK",
  "OUT_OF_STOCK",
  "PRE_ORDER",
  "HIDDEN_FROM_STORE",
]);
export const ProductStatusEnum = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]);

export const VariantInputSchema = z.object({
  id: z.string().optional(), // present on update so we can match rows
  sku: z.string().min(0).optional(),
  size: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  priceAdj: z.number().int().default(0).optional(),
  stock: z.number().int().nonnegative().default(0).optional(),
});
export type VariantInput = z.infer<typeof VariantInputSchema>;

export const ProductImageInputSchema = z.object({
  id: z.string().optional(),
  url: z.string().min(1),
  alt: z.string().optional(),
  position: z.number().int().default(0).optional(),
  featured: z.boolean().default(false).optional(),
});
export type ProductImageInput = z.infer<typeof ProductImageInputSchema>;

export const AdminProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().nullable(),
  category: CategoryEnum,
  status: ProductStatusEnum,
  inventoryStatus: InventoryStatusEnum,
  basePrice: z.number().int().nonnegative(),
  salePrice: z.number().int().nonnegative().nullable().optional(),
  sku: z.string().optional().nullable(),
  featured: z.boolean().optional(),
  images: z.array(ProductImageInputSchema).optional().default([]),
  variants: z.array(VariantInputSchema).optional().default([]),
});
export type AdminProductInput = z.infer<typeof AdminProductSchema>;

export const CheckoutInputSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Cart is empty"),
});
export type CheckoutInput = z.infer<typeof CheckoutInputSchema>;