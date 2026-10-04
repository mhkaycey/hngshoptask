import { NextResponse } from "next/server";
import { z } from "zod";
import { listProducts, getCategories } from "@/lib/products";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  search: z.string().trim().max(200).optional(),
  category: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).max(1000).optional(),
});

/** GET /api/v1/products — paginated, active products only. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    search: url.searchParams.get("search") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Invalid query parameters." },
      { status: 400 }
    );
  }

  try {
    const result = await listProducts(parsed.data);
    const categories = await getCategories();
    return NextResponse.json({
      success: true,
      data: { ...result, categories },
    });
  } catch (error) {
    console.error("[api/v1/products] list failed:", error);
    return NextResponse.json(
      { success: false, message: "Could not load products." },
      { status: 500 }
    );
  }
}
