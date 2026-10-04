"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  submitReviewCore,
  deleteReviewCore,
} from "@/lib/services/reviews";
import type { ReviewResult } from "@/lib/validations/review";

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
  const result = await submitReviewCore(userId, {
    productId,
    rating: formData.get("rating")?.toString() ?? "",
    comment: String(formData.get("comment") ?? ""),
  });
  if (result.success && isUuidLike(productId)) {
    revalidatePath(`/products/${productId}`);
  }
  return result;
}

function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/** Remove the signed-in user's review of a product. */
export async function deleteReview(productId: string): Promise<ReviewResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, message: "Invalid request." };
  }
  const result = await deleteReviewCore(userId, productId);
  if (result.success) revalidatePath(`/products/${productId}`);
  return result;
}
