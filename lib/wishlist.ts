import "server-only";
import { query } from "@/lib/db";
import type { Product } from "@/components/store/ProductCard";

export type WishlistProduct = Product & { wishlisted_at: string };

/** Products a user has saved, most recently saved first. */
export async function getWishlistProducts(
  userId: string
): Promise<WishlistProduct[]> {
  const { rows } = await query<WishlistProduct>(
    `SELECT p.id, p.name, p.description, p.price, p.stock, p.category, p.image_url,
            w.created_at AS wishlisted_at
     FROM wishlist_items w
     JOIN products p ON p.id = w.product_id
     WHERE w.user_id = $1 AND p.is_active = TRUE
     ORDER BY w.created_at DESC`,
    [userId]
  );
  return rows;
}

/** Whether a single product is on the user's wishlist. */
export async function isWishlisted(
  userId: string,
  productId: string
): Promise<boolean> {
  const { rows } = await query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM wishlist_items WHERE user_id = $1 AND product_id = $2
     ) AS exists`,
    [userId, productId]
  );
  return rows[0]?.exists === true;
}
