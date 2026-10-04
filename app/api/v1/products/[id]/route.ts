import { NextResponse } from "next/server";
import { getProduct } from "@/lib/products";
import { getReviews, getReviewStats } from "@/lib/reviews";
import { isUuid } from "@/lib/validations/ids";

export const dynamic = "force-dynamic";

/** GET /api/v1/products/:id — product detail with reviews and stats. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid product id." },
      { status: 400 }
    );
  }

  try {
    const product = await getProduct(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }
    const [reviews, stats] = await Promise.all([
      getReviews(id),
      getReviewStats(id),
    ]);
    return NextResponse.json({ success: true, data: { product, reviews, stats } });
  } catch (error) {
    console.error("[api/v1/products/:id] failed:", error);
    return NextResponse.json(
      { success: false, message: "Could not load product." },
      { status: 500 }
    );
  }
}
