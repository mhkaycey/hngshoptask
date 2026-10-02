import "server-only";
import { query } from "@/lib/db";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  is_blocked: boolean;
  order_count: string;
  total_spent: string | null;
  created_at: string;
};

export async function listUsers(options: {
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ users: AdminUserRow[]; total: number; totalPages: number }> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = options.pageSize ?? 10;
  const search = options.search?.trim();

  const conditions: string[] = [];
  const params: unknown[] = [];
  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`
    );
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows: countRows } = await query<{ count: string }>(
    `SELECT count(*)::int::text AS count FROM users u ${where}`,
    params
  );
  const total = Number(countRows[0]?.count ?? 0);

  const { rows } = await query<AdminUserRow>(
    `SELECT u.id, u.name, u.email, u.role, u.is_blocked, u.created_at,
            count(o.id) FILTER (WHERE o.status <> 'cancelled')::int::text AS order_count,
            COALESCE(sum(o.total) FILTER (WHERE o.status <> 'cancelled'), 0)::text AS total_spent
       FROM users u
       LEFT JOIN orders o ON o.user_id = u.id
       ${where}
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, pageSize, (page - 1) * pageSize]
  );

  return {
    users: rows,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
