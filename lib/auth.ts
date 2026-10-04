import "server-only";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { upsertGoogleUser } from "@/lib/services/users";

type DbUser = {
  id: string;
  role: "user" | "admin";
  is_blocked: boolean;
};

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

      // Shared upsert (also used by /api/v1/auth/google for the mobile app).
      const result = await upsertGoogleUser({
        googleId,
        email,
        name: user.name,
        avatarUrl: user.image,
      });
      return result !== null;
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
