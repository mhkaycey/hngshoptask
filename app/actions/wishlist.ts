"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { isUuid } from "@/lib/validations/ids";

export type WishlistResult =
  | { success: true; inWishlist: boolean }
  | { success: false; message: string; requiresAuth?: boolean };

/** Add a product to the signed-in user's wishlist. */
export async function addToWishlist(productId: string): Promise<WishlistResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return {
      success: false,
      message: "Sign in to save products to your wishlist.",
      requiresAuth: true,
    };
  }
  if (!isUuid(productId)) {
    return { success: false, message: "Invalid product." };
  }

  try {
    // Only active products can be saved; the insert is idempotent.
    await query(
      `INSERT INTO wishlist_items (user_id, product_id)
       SELECT $1, id FROM products
       WHERE id = $2 AND is_active = TRUE
       ON CONFLICT (user_id, product_id) DO NOTHING`,
      [userId, productId]
    );
    revalidatePath("/wishlist");
    return { success: true, inWishlist: true };
  } catch (error) {
    console.error("[wishlist] add failed:", error);
    return { success: false, message: "Could not save this product." };
  }
}

/** Remove a product from the signed-in user's wishlist. */
export async function removeFromWishlist(
  productId: string
): Promise<WishlistResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return {
      success: false,
      message: "Sign in to manage your wishlist.",
      requiresAuth: true,
    };
  }
  if (!isUuid(productId)) {
    return { success: false, message: "Invalid product." };
  }

  try {
    await query(
      `DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2`,
      [userId, productId]
    );
    revalidatePath("/wishlist");
    revalidatePath(`/products/${productId}`);
    return { success: true, inWishlist: false };
  } catch (error) {
    console.error("[wishlist] remove failed:", error);
    return { success: false, message: "Could not remove this product." };
  }
}

/** Toggle wishlist membership for a product. */
export async function toggleWishlist(
  productId: string,
  currentlySaved: boolean
): Promise<WishlistResult> {
  return currentlySaved
    ? removeFromWishlist(productId)
    : addToWishlist(productId);
}
