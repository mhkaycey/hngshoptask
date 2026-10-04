import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { processCheckoutOrder } from "@/lib/services/checkout";
import { listUserOrders } from "@/lib/orders";
import { rateLimit, clientKeyFromRequest } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/orders — checkout.
 * Body: { fullName, email, shippingAddress, cartItems: [{productId, quantity}] }
 * Prices always come from the database; the transaction and stock rules
 * live in the shared service (same as the web Server Action).
 */
export async function POST(request: Request) {
  const user = await getApiUser(request);

  const limit = rateLimit(
    `checkout:${clientKeyFromRequest(request, user?.id)}`,
    10,
    60_000
  );
  if (!limit.ok) {
    return NextResponse.json(
      { success: false, message: "Too many attempts. Please slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const result = await processCheckoutOrder(
    {
      fullName: String(body.fullName ?? ""),
      email: String(body.email ?? ""),
      shippingAddress: String(body.shippingAddress ?? ""),
      cartItems: Array.isArray(body.cartItems)
        ? (body.cartItems as { productId: string; quantity: number }[])
        : [],
    },
    user?.id ?? null
  );
  return NextResponse.json(result, { status: result.success ? 201 : 400 });
}

/** GET /api/v1/orders — the signed-in user's orders. */
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Sign in to view your orders." },
      { status: 401 }
    );
  }
  try {
    const orders = await listUserOrders(user.id);
    return NextResponse.json({ success: true, data: { orders } });
  } catch (error) {
    console.error("[api/v1/orders] list failed:", error);
    return NextResponse.json(
      { success: false, message: "Could not load orders." },
      { status: 500 }
    );
  }
}
