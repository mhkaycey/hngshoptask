"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  addToWishlistCore,
  removeFromWishlistCore,
} from "@/lib/services/wishlist";

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
  const result = await addToWishlistCore(userId, productId);
  if (result.success) revalidatePath("/wishlist");
  return result;
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
  const result = await removeFromWishlistCore(userId, productId);
  if (result.success) {
    revalidatePath("/wishlist");
    revalidatePath(`/products/${productId}`);
  }
  return result;
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
