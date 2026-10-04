import "server-only";
import { query } from "@/lib/db";

type DbUser = {
  id: string;
  role: "user" | "admin";
  is_blocked: boolean;
};

export function isAdminEmail(email: string): boolean {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export type GoogleProfile = {
  googleId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
};

/**
 * Upsert a Google-identified user keyed by google_id OR email.
 * Returns the internal user id, or null if the user is blocked
 * (blocked users are rejected at sign-in).
 * Shared by the Auth.js signIn callback and /api/v1/auth/google.
 */
export async function upsertGoogleUser(
  profile: GoogleProfile
): Promise<{ id: string } | null> {
  const normalizedEmail = profile.email.toLowerCase();

  const { rows } = await query<DbUser>(
    `SELECT id, role, is_blocked FROM users
      WHERE google_id = $1 OR email = $2`,
    [profile.googleId, normalizedEmail]
  );

  if (rows.length === 0) {
    const { rows: inserted } = await query<{ id: string }>(
      `INSERT INTO users (google_id, email, name, avatar_url, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        profile.googleId,
        normalizedEmail,
        profile.name ?? normalizedEmail.split("@")[0],
        profile.avatarUrl ?? null,
        isAdminEmail(profile.email) ? "admin" : "user",
      ]
    );
    return inserted[0];
  }

  const dbUser = rows[0];
  if (dbUser.is_blocked) return null;

  await query(
    `UPDATE users
        SET google_id = $2, email = $3, name = $4, avatar_url = $5, updated_at = now()
      WHERE id = $1`,
    [
      dbUser.id,
      profile.googleId,
      normalizedEmail,
      profile.name ?? normalizedEmail.split("@")[0],
      profile.avatarUrl ?? null,
    ]
  );

  // Promote on every sign-in if the email is in ADMIN_EMAILS.
  if (isAdminEmail(profile.email) && dbUser.role !== "admin") {
    await query(
      `UPDATE users SET role = 'admin', updated_at = now() WHERE id = $1`,
      [dbUser.id]
    );
  }

  return { id: dbUser.id };
}
