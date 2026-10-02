/**
 * Creates (or updates) an admin user with an email/password login.
 *
 *   npx tsx --env-file=.env scripts/set-admin-password.ts <admin-email> '<password>'
 *
 * If the user exists (e.g. previously created via Google sign-in), their
 * password is set/updated and their role is promoted to admin.
 */
import { Pool } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const [email, password] = process.argv.slice(2);

if (!email || !password) {
  console.error("Usage: npx tsx --env-file=.env scripts/set-admin-password.ts <email> <password>");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    const normalizedEmail = email.toLowerCase();
    const hash = await bcrypt.hash(password, 12);

    const { rows } = await pool.query<{ id: string }>(
      `INSERT INTO users (email, name, password_hash, role)
       VALUES ($1, $1, $2, 'admin')
       ON CONFLICT (email) DO UPDATE
         SET password_hash = $2,
             role = 'admin',
             is_blocked = FALSE,
             updated_at = now()
       RETURNING id`,
      [normalizedEmail, hash]
    );
    console.log(`Admin ready: ${normalizedEmail} (id ${rows[0].id})`);
  } catch (error) {
    console.error("Failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
