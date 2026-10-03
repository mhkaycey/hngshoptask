import "server-only";
import { query } from "@/lib/db";

export type Review = {
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string | null;
  reviewer_avatar: string | null;
};

export type ReviewStats = {
  average: number;
  count: number;
};

/** All reviews for a product, newest first, with reviewer display info. */
export async function getReviews(productId: string): Promise<Review[]> {
  const { rows } = await query<Review>(
    `SELECT r.user_id, r.rating, r.comment, r.created_at,
            u.name AS reviewer_name, u.avatar_url AS reviewer_avatar
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id = $1
     ORDER BY r.updated_at DESC
     LIMIT 100`,
    [productId]
  );
  return rows;
}

/** Average rating and review count for a product. */
export async function getReviewStats(productId: string): Promise<ReviewStats> {
  const { rows } = await query<{ avg: string | null; count: string }>(
    `SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)::text AS avg,
            count(*)::int::text AS count
     FROM reviews
     WHERE product_id = $1`,
    [productId]
  );
  return {
    average: Number(rows[0]?.avg ?? 0),
    count: Number(rows[0]?.count ?? 0),
  };
}

/** The signed-in user's own review of a product (if any), for pre-filling the form. */
export async function getUserReview(
  userId: string,
  productId: string
): Promise<Review | null> {
  const { rows } = await query<Review>(
    `SELECT r.user_id, r.rating, r.comment, r.created_at,
            u.name AS reviewer_name, u.avatar_url AS reviewer_avatar
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.user_id = $1 AND r.product_id = $2`,
    [userId, productId]
  );
  return rows[0] ?? null;
}

/**
 * Purchase verification: has this user received a non-cancelled order
 * containing this product? This is the gate for writing a review.
 */
export async function hasPurchasedProduct(
  userId: string,
  productId: string
): Promise<boolean> {
  const { rows } = await query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE oi.product_id = $1
         AND o.user_id = $2
         AND o.status IN ('pending', 'processing', 'completed')
     ) AS exists`,
    [productId, userId]
  );
  return rows[0]?.exists === true;
}
