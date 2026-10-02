import { z } from "zod";

/**
 * Admin product form/input schema.
 * Note: the DB column is `stock` (this maps to the "inventory count").
 */
export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  price: z.coerce
    .number({ message: "Enter a valid price" })
    .min(0, "Price cannot be negative")
    .max(1_000_000),
  stock: z.coerce
    .number({ message: "Enter a valid stock count" })
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
  category: z.string().trim().min(1, "Category is required").max(100),
  image_url: z
    .string()
    .trim()
    .refine(
      (url) =>
        url === "" ||
        (url.startsWith("https://res.cloudinary.com/") && /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(url)),
      "Image must be a Cloudinary URL (https://res.cloudinary.com/...)"
    )
    .optional()
    .or(z.literal("")),
});

export const stockUpdateSchema = z.object({
  id: z.string().uuid(),
  stock: z.coerce
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .max(1_000_000),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductActionResult =
  | { success: true; message?: string }
  | { success: false; message: string };
