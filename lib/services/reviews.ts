import "server-only";
import { query } from "@/lib/db";
import { isUuid } from "@/lib/validations/ids";
import { reviewSchema, type ReviewResult } from "@/lib/validations/review";
import { hasPurchasedProduct } from "@/lib/reviews";

/**
 * Create or update the signed-in user's review of a product.
 * `userId` must be resolved from a session on the caller side.
 */
export async function submitReviewCore(
  userId: string,
  input: { productId: string; rating: number | string; comment?: string }
): Promise<ReviewResult> {
  const productId = String(input.productId ?? "");
  if (!isUuid(productId)) {
    return { success: false, message: "Invalid product." };
  }

  const parsed = reviewSchema.safeParse({
    productId,
    rating: input.rating,
    comment: input.comment ?? "",
  });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid review.",
    };
  }
  const { rating, comment } = parsed.data;

  try {
    // Authorization gate: the user must have bought this product.
    const purchased = await hasPurchasedProduct(userId, productId);
    if (!purchased) {
      return {
        success: false,
        message: "Only customers who purchased this product can review it.",
      };
    }

    await query(
      `INSERT INTO reviews (user_id, product_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET rating = EXCLUDED.rating,
                     comment = EXCLUDED.comment,
                     updated_at = now()`,
      [userId, productId, rating, comment || null]
    );
    return { success: true };
  } catch (error) {
    console.error("[reviews] submit failed:", error);
    return {
      success: false,
      message: "Could not save your review. Please try again.",
    };
  }
}

/** Remove the signed-in user's review of a product. */
export async function deleteReviewCore(
  userId: string,
  productId: string
): Promise<ReviewResult> {
  if (!isUuid(productId)) {
    return { success: false, message: "Invalid request." };
  }
  try {
    await query(
      `DELETE FROM reviews WHERE user_id = $1 AND product_id = $2`,
      [userId, productId]
    );
    return { success: true };
  } catch (error) {
    console.error("[reviews] delete failed:", error);
    return { success: false, message: "Could not delete your review." };
  }
}
