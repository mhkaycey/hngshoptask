"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { isUuid } from "@/lib/validations/ids";
import {
  reviewSchema,
  type ReviewResult,
} from "@/lib/validations/review";
import { hasPurchasedProduct } from "@/lib/reviews";

/**
 * Create or update the signed-in user's review of a product.
 * Only customers who actually bought the product may review it.
 */
export async function submitReview(formData: FormData): Promise<ReviewResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, message: "Sign in to write a review." };
  }

  const productId = String(formData.get("productId") ?? "");
  if (!isUuid(productId)) {
    return { success: false, message: "Invalid product." };
  }

  const parsed = reviewSchema.safeParse({
    productId,
    rating: formData.get("rating"),
    comment: formData.get("comment") ?? "",
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

    revalidatePath(`/products/${productId}`);
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
export async function deleteReview(productId: string): Promise<ReviewResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || !isUuid(productId)) {
    return { success: false, message: "Invalid request." };
  }

  try {
    await query(
      `DELETE FROM reviews WHERE user_id = $1 AND product_id = $2`,
      [userId, productId]
    );
    revalidatePath(`/products/${productId}`);
    return { success: true };
  } catch (error) {
    console.error("[reviews] delete failed:", error);
    return { success: false, message: "Could not delete your review." };
  }
}
