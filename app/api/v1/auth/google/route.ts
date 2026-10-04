import { NextResponse } from "next/server";
import { z } from "zod";
import { upsertGoogleUser } from "@/lib/services/users";
import { issueApiSessionToken } from "@/lib/api-auth";
import { rateLimit, clientKeyFromRequest } from "@/lib/rate-limit";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  idToken: z.string().min(10).max(5000),
});

type TokenInfo = {
  sub: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
  aud?: string;
  exp?: string;
};

/**
 * POST /api/v1/auth/google — mobile token exchange.
 * The client sends a Google ID token (from expo-auth-session / Google Sign-In);
 * the server verifies it against Google's tokeninfo endpoint, upserts the
 * user via the same path as the web sign-in, and returns an Auth.js
 * session JWT the mobile app sends as `Authorization: Bearer <token>`.
 */
export async function POST(request: Request) {
  const limit = rateLimit(`auth-google:${clientKeyFromRequest(request)}`, 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { success: false, message: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "idToken is required." },
      { status: 400 }
    );
  }

  try {
    // Verify the ID token with Google (no extra dependency needed).
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(parsed.data.idToken)}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: "Invalid Google token." },
        { status: 401 }
      );
    }
    const info = (await res.json()) as TokenInfo;

    // Audience must match our OAuth client; token must be unexpired.
    const expectedAud = process.env.AUTH_GOOGLE_ID;
    if (expectedAud && info.aud !== expectedAud) {
      return NextResponse.json(
        { success: false, message: "Invalid audience." },
        { status: 401 }
      );
    }
    if (info.exp && Number(info.exp) * 1000 < Date.now()) {
      return NextResponse.json(
        { success: false, message: "Token expired." },
        { status: 401 }
      );
    }
    if (!info.sub || !info.email) {
      return NextResponse.json(
        { success: false, message: "Token is missing an email claim." },
        { status: 401 }
      );
    }

    const user = await upsertGoogleUser({
      googleId: info.sub,
      email: info.email,
      name: info.name,
      avatarUrl: info.picture,
    });
    if (!user) {
      // Blocked users are rejected at sign-in.
      return NextResponse.json(
        { success: false, message: "Your account cannot sign in." },
        { status: 403 }
      );
    }

    const { rows } = await query<{ email: string; name: string | null; role: "user" | "admin" }>(
      `SELECT email, name, role FROM users WHERE id = $1`,
      [user.id]
    );
    const profile = rows[0];

    const token = await issueApiSessionToken({
      id: user.id,
      role: profile?.role ?? "user",
      email: profile?.email,
      name: profile?.name,
    });

    return NextResponse.json({
      success: true,
      data: {
        token,
        expiresIn: 60 * 60 * 24 * 30,
        user: {
          id: user.id,
          email: profile?.email ?? info.email,
          name: profile?.name ?? info.name ?? null,
          avatarUrl: info.picture ?? null,
        },
      },
    });
  } catch (error) {
    console.error("[api/v1/auth/google] failed:", error);
    return NextResponse.json(
      { success: false, message: "Sign-in failed. Please try again." },
      { status: 500 }
    );
  }
}
