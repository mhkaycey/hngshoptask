import "server-only";
import { Pool } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export type QueryResultRow = Record<string, unknown>;

/** Run a parameterized query against the pool. */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: readonly unknown[] = []
) {
  return pool.query<T>(text, params as unknown[]);
}

/**
 * Run `callback` inside a transaction. Commits on success,
 * rolls back and rethrows on error. The client is always released.
 */
export async function withTransaction<T>(
  callback: (client: {
    query: <R extends QueryResultRow = QueryResultRow>(
      text: string,
      params?: readonly unknown[]
    ) => Promise<{ rows: R[]; rowCount: number | null }>;
  }) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export { pool };
