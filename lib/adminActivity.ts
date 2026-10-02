import "server-only";
import { query } from "@/lib/db";

export type AdminActivity = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  detail: string | null;
  created_at: string;
  admin_email: string | null;
};

/**
 * Best-effort audit log. Never throws — a logging failure must not block
 * the admin action it records.
 */
export async function logAdminActivity(entry: {
  adminId: string;
  action: string;
  entityType: "product" | "order" | "user";
  entityId?: string | null;
  detail?: string | null;
}): Promise<void> {
  try {
    await query(
      `INSERT INTO admin_activity (admin_id, action, entity_type, entity_id, detail)
       VALUES ($1, $2, $3, $4, $5)`,
      [entry.adminId, entry.action, entry.entityType, entry.entityId ?? null, entry.detail ?? null]
    );
  } catch (error) {
    console.warn("[admin-activity] failed to record:", error);
  }
}

export async function getRecentActivity(limit = 10): Promise<AdminActivity[]> {
  try {
    const { rows } = await query<AdminActivity>(
      `SELECT a.id, a.action, a.entity_type, a.entity_id, a.detail, a.created_at,
              u.email AS admin_email
         FROM admin_activity a
         LEFT JOIN users u ON u.id = a.admin_id
        ORDER BY a.created_at DESC
        LIMIT $1`,
      [limit]
    );
    return rows;
  } catch (error) {
    // Table not migrated yet — render an empty list rather than breaking the dashboard.
    console.warn("[admin-activity] could not load:", error);
    return [];
  }
}
