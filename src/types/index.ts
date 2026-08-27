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