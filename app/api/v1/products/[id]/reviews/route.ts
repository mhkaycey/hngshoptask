import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { submitReviewCore, deleteReviewCore } from "@/lib/services/reviews";

export const dynamic = "force-dynamic";

/** POST /api/v1/products/:id/reviews — body: { rating, comment? }. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Sign in to write a review." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { id } = await params;
  const input =
    typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const result = await submitReviewCore(user.id, {
    productId: id,
    rating: (input.rating as string | number | undefined) ?? "",
    comment: typeof input.comment === "string" ? input.comment : "",
  });
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

/** DELETE /api/v1/products/:id/reviews — remove the caller's review. */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Sign in first." },
      { status: 401 }
    );
  }
  const { id } = await params;
  const result = await deleteReviewCore(user.id, id);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
