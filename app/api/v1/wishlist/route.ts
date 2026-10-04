import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { getWishlistProducts } from "@/lib/wishlist";
import {
  addToWishlistCore,
  removeFromWishlistCore,
} from "@/lib/services/wishlist";

export const dynamic = "force-dynamic";

/** GET /api/v1/wishlist — the signed-in user's saved products. */
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Sign in to view your wishlist." },
      { status: 401 }
    );
  }
  try {
    const items = await getWishlistProducts(user.id);
    return NextResponse.json({ success: true, data: { items } });
  } catch (error) {
    console.error("[api/v1/wishlist] list failed:", error);
    return NextResponse.json(
      { success: false, message: "Could not load wishlist." },
      { status: 500 }
    );
  }
}

/** POST /api/v1/wishlist — body: { productId } — add (idempotent). */
export async function POST(request: Request) {
  const user = await getApiUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Sign in to save products to your wishlist." },
      { status: 401 }
    );
  }
  const body = (await request.json().catch(() => ({}))) as {
    productId?: string;
  };
  if (!body.productId) {
    return NextResponse.json(
      { success: false, message: "productId is required." },
      { status: 400 }
    );
  }
  const result = await addToWishlistCore(user.id, body.productId);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

/** DELETE /api/v1/wishlist?productId=... — remove. */
export async function DELETE(request: Request) {
  const user = await getApiUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Sign in to manage your wishlist." },
      { status: 401 }
    );
  }
  const productId = new URL(request.url).searchParams.get("productId");
  if (!productId) {
    return NextResponse.json(
      { success: false, message: "productId is required." },
      { status: 400 }
    );
  }
  const result = await removeFromWishlistCore(user.id, productId);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
