import "server-only";
import { query } from "@/lib/db";
import { isUuid } from "@/lib/validations/ids";

export type WishlistServiceResult =
  | { success: true; inWishlist: boolean }
  | { success: false; message: string };

/** Core add — `userId` must already be resolved from a session. */
export async function addToWishlistCore(
  userId: string,
  productId: string
): Promise<WishlistServiceResult> {
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
    return { success: true, inWishlist: true };
  } catch (error) {
    console.error("[wishlist] add failed:", error);
    return { success: false, message: "Could not save this product." };
  }
}

/** Core remove. */
export async function removeFromWishlistCore(
  userId: string,
  productId: string
): Promise<WishlistServiceResult> {
  if (!isUuid(productId)) {
    return { success: false, message: "Invalid product." };
  }
  try {
    await query(
      `DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2`,
      [userId, productId]
    );
    return { success: true, inWishlist: false };
  } catch (error) {
    console.error("[wishlist] remove failed:", error);
    return { success: false, message: "Could not remove this product." };
  }
}
