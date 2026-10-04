import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/v1/auth/session — current user for the mobile app. */
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Not signed in." },
      { status: 401 }
    );
  }
  const { rows } = await query<{
    email: string;
    name: string | null;
    avatar_url: string | null;
    is_blocked: boolean;
  }>(
    `SELECT email, name, avatar_url, is_blocked FROM users WHERE id = $1`,
    [user.id]
  );
  const profile = rows[0];
  if (!profile || profile.is_blocked) {
    return NextResponse.json(
      { success: false, message: "Not signed in." },
      { status: 401 }
    );
  }
  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: user.id,
        role: user.role,
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatar_url,
      },
    },
  });
}
