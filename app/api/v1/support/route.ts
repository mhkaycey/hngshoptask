import { NextResponse } from "next/server";
import { sendSupportMessageCore } from "@/lib/services/support";
import { rateLimit, clientKeyFromRequest } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** POST /api/v1/support — public contact form. */
export async function POST(request: Request) {
  const limit = rateLimit(
    `support:${clientKeyFromRequest(request)}`,
    5,
    60_000
  );
  if (!limit.ok) {
    return NextResponse.json(
      { success: false, message: "Too many messages. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const result = await sendSupportMessageCore(body);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
