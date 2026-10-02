/**
 * Applies db/schema.sql and (optionally) db/seed.sql to the database.
 * Usage:
 *   npx tsx --env-file=.env scripts/migrate.ts          # schema + seed
 *   npx tsx --env-file=.env scripts/migrate.ts --no-seed # schema only
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "@neondatabase/serverless";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env.local or export it.");
  process.exit(1);
}

const seed = !process.argv.includes("--no-seed");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    console.log("Applying schema...");
    await pool.query(readFileSync(join(root, "db/schema.sql"), "utf8"));

    if (seed) {
      console.log("Seeding products...");
      await pool.query(readFileSync(join(root, "db/seed.sql"), "utf8"));
    }

    const { rows } = await pool.query<{ count: string }>(
      "SELECT count(*)::text AS count FROM products"
    );
    console.log(`Done. Products in database: ${rows[0].count}`);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
