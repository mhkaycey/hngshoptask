import "server-only";
import { query } from "@/lib/db";

export type AdminOrderRow = {
  id: string;
  total: string;
  status: string;
  created_at: string;
  customer_email: string | null;
  customer_name: string | null;
  item_count: string;
};

export type AdminOrderDetail = AdminOrderRow & {
  shipping_address: string;
  customer_avatar: string | null;
  items: {
    id: string;
    product_id: string;
    product_name: string | null;
    quantity: number;
    unit_price: string;
    subtotal: string;
  }[];
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function listOrders(options: {
  status?: string;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  q?: string;    // free-text: order id (full or prefix) or customer email/name
  page?: number;
  pageSize?: number;
}): Promise<{ orders: AdminOrderRow[]; total: number; totalPages: number }> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = options.pageSize ?? 10;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (options.q && options.q.trim()) {
    const q = options.q.trim();
    if (UUID_RE.test(q)) {
      // Full UUID — exact match.
      params.push(q);
      conditions.push(`o.id = $${params.length}`);
    } else {
      // Prefix of the order id, or customer email/name.
      params.push(`%${q}%`);
      conditions.push(
        `(o.id::text ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.name ILIKE $${params.length})`
      );
    }
  }

  const validStatuses = ["pending", "processing", "completed", "cancelled"];
  if (options.status && validStatuses.includes(options.status)) {
    params.push(options.status);
    conditions.push(`o.status = $${params.length}`);
  }
  if (options.from && /^\d{4}-\d{2}-\d{2}$/.test(options.from)) {
    params.push(options.from);
    conditions.push(`o.created_at >= $${params.length}::date`);
  }
  if (options.to && /^\d{4}-\d{2}-\d{2}$/.test(options.to)) {
    params.push(`${options.to} 23:59:59.999`);
    conditions.push(`o.created_at <= $${params.length}::timestamptz`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows: countRows } = await query<{ count: string }>(
    `SELECT count(*)::int::text AS count
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       ${where}`,
    params
  );
  const total = Number(countRows[0]?.count ?? 0);

  const { rows } = await query<AdminOrderRow>(
    `SELECT o.id, o.total, o.status, o.created_at,
            u.email AS customer_email, u.name AS customer_name,
            count(i.id)::int::text AS item_count
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       LEFT JOIN order_items i ON i.order_id = o.id
       ${where}
       GROUP BY o.id, u.email, u.name
       ORDER BY o.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, pageSize, (page - 1) * pageSize]
  );

  return {
    orders: rows,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Admin view of any order (ownership check happens via requireAdmin). */
export async function getOrder(orderId: string): Promise<AdminOrderDetail | null> {
  if (!UUID_RE.test(orderId)) return null;

  const { rows } = await query<
    Omit<AdminOrderDetail, "items">
  >(
    `SELECT o.id, o.total, o.status, o.created_at, o.shipping_address,
            u.email AS customer_email, u.name AS customer_name,
            u.avatar_url AS customer_avatar,
            '0' AS item_count
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
      WHERE o.id = $1`,
    [orderId]
  );
  const order = rows[0];
  if (!order) return null;

  const { rows: items } = await query<AdminOrderDetail["items"][number]>(
    `SELECT i.id, i.product_id, p.name AS product_name,
            i.quantity, i.unit_price, i.subtotal::text AS subtotal
       FROM order_items i
       LEFT JOIN products p ON p.id = i.product_id
      WHERE i.order_id = $1
      ORDER BY i.id`,
    [orderId]
  );

  return { ...order, items };
}
