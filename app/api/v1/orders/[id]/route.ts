import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { getUserOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

/** GET /api/v1/orders/:id — one order, scoped to the owning user. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Sign in to view your orders." },
      { status: 401 }
    );
  }
  const { id } = await params;
  try {
    const order = await getUserOrder(user.id, id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: { order } });
  } catch (error) {
    console.error("[api/v1/orders/:id] failed:", error);
    return NextResponse.json(
      { success: false, message: "Could not load order." },
      { status: 500 }
    );
  }
}
