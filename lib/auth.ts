import "server-only";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

type DbUser = {
  id: string;
  role: "user" | "admin";
  is_blocked: boolean;
};

function isAdminEmail(email: string): boolean {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    // Email/password sign-in, used by admins (see /admin/login).
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const { rows } = await query<
          DbUser & { password_hash: string | null }
        >(
          `SELECT id, role, is_blocked, password_hash FROM users WHERE email = $1`,
          [email.toLowerCase()]
        );
        const dbUser = rows[0];
        if (!dbUser || !dbUser.password_hash || dbUser.is_blocked) return null;

        const valid = await bcrypt.compare(password, dbUser.password_hash);
        if (!valid) return null;

        return { id: dbUser.id, email: email.toLowerCase(), name: email };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Credentials users are validated against the database in authorize().
      if (account?.provider === "credentials") return true;

      const googleId = user.id;
      const email = user.email;
      if (!googleId || !email) return false;

      const normalizedEmail = email.toLowerCase();

      // Link by google_id OR email (email is unique) — never trust a raw
      // upsert, and never crash if a row already exists with this email.
      const { rows } = await query<DbUser>(
        `SELECT id, role, is_blocked FROM users
          WHERE google_id = $1 OR email = $2`,
        [googleId, normalizedEmail]
      );

      if (rows.length === 0) {
        await query(
          `INSERT INTO users (google_id, email, name, avatar_url, role)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            googleId,
            normalizedEmail,
            user.name ?? normalizedEmail.split("@")[0],
            user.image ?? null,
            isAdminEmail(email) ? "admin" : "user",
          ]
        );
        return true;
      }

      const dbUser = rows[0];
      if (dbUser.is_blocked) return false;

      await query(
        `UPDATE users
            SET google_id = $2, email = $3, name = $4, avatar_url = $5, updated_at = now()
          WHERE id = $1`,
        [
          dbUser.id,
          googleId,
          normalizedEmail,
          user.name ?? normalizedEmail.split("@")[0],
          user.image ?? null,
        ]
      );

      // Promote on every sign-in if the email is in ADMIN_EMAILS.
      if (isAdminEmail(email) && dbUser.role !== "admin") {
        await query(`UPDATE users SET role = 'admin', updated_at = now() WHERE id = $1`, [
          dbUser.id,
        ]);
      }

      return true;
    },
    async jwt({ token, user }) {
      // On initial sign-in, attach the internal users.id and role.
      if (user?.id) {
        // Credentials authorize() already resolved the database row by id;
        // Google sign-ins resolve by google_id.
        const { rows } = await query<DbUser>(
          `SELECT id, role, is_blocked FROM users WHERE id = $1 OR google_id = $2`,
          [user.id, user.id]
        );
        if (rows[0] && !rows[0].is_blocked) {
          token.id = rows[0].id;
          token.role = rows[0].role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "user" | "admin") ?? "user";
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

/**
 * Server-side admin guard. Re-reads role/is_blocked from the database
 * (the JWT may be stale) and redirects if not an authorized admin.
 */
export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || !session.user) {
    redirect("/admin/login");
  }

  const { rows } = await query<DbUser & { email: string }>(
    `SELECT id, email, role, is_blocked FROM users WHERE id = $1`,
    [userId]
  );
  const dbUser = rows[0];
  if (!dbUser || dbUser.is_blocked || dbUser.role !== "admin") {
    redirect("/admin/login?error=forbidden");
  }

  return { id: dbUser.id, email: dbUser.email };
}
