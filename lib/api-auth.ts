import "server-only";
import { decode, encode } from "next-auth/jwt";
import { auth } from "@/lib/auth";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const TOKEN_SALT =
  process.env.NODE_ENV === "production" &&
  process.env.AUTH_URL?.startsWith("https")
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

export type ApiUser = {
  id: string;
  role: "user" | "admin";
};

/**
 * Resolve the caller for an API route handler. Accepts either:
 *  - the browser session cookie (same-origin web client), via `auth()`; or
 *  - an Authorization: Bearer <jwt> header (mobile app), where the JWT is
 *    the same Auth.js session token issued by /api/v1/auth/google.
 */
export async function getApiUser(
  request: Request
): Promise<ApiUser | null> {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    const token = await decode({
      token: header.slice("Bearer ".length).trim(),
      salt: TOKEN_SALT,
      secret: process.env.AUTH_SECRET as string,
    });
    if (token?.id) {
      return { id: token.id as string, role: (token.role as ApiUser["role"]) ?? "user" };
    }
    return null;
  }
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  return { id, role: session.user.role ?? "user" };
}

/** Issue an Auth.js-compatible session JWT for a mobile client. */
export async function issueApiSessionToken(user: {
  id: string;
  role: "user" | "admin";
  email?: string;
  name?: string | null;
}): Promise<string> {
  return encode({
    token: {
      id: user.id,
      role: user.role,
      sub: user.id,
      email: user.email,
      name: user.name ?? undefined,
    },
    salt: TOKEN_SALT,
    secret: process.env.AUTH_SECRET as string,
    maxAge: SESSION_MAX_AGE,
  });
}
