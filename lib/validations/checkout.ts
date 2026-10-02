import { z } from "zod";

export const MAX_CART_ITEMS = 50;
export const MAX_QUANTITY_PER_ITEM = 10;

export const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(200, "Full name is too long"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  shippingAddress: z
    .string()
    .trim()
    .min(10, "Shipping address is too short")
    .max(1000, "Shipping address is too long"),
  cartItems: z
    .array(
      z.object({
        productId: z.string().uuid("Invalid product"),
        quantity: z
          .number()
          .int("Quantity must be a whole number")
          .positive("Quantity must be positive")
          .max(MAX_QUANTITY_PER_ITEM, "Maximum 10 per item"),
      })
    )
    .min(1, "Your cart is empty")
    .max(MAX_CART_ITEMS, "Too many items in the cart"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type CheckoutResult =
  | { success: true; orderId: string }
  | { success: false; message: string };
