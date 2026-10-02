import "server-only";
import { query } from "@/lib/db";

export type OrderSummary = {
  id: string;
  status: string;
  total: string;
  created_at: string;
  item_count: string;
};

export type OrderDetail = OrderSummary & {
  shipping_address: string;
  items: {
    id: string;
    product_id: string;
    product_name: string | null;
    quantity: number;
    unit_price: string;
    subtotal: string;
  }[];
};

/** List a user's orders. userId must come from the session, never the request. */
export async function listUserOrders(userId: string): Promise<OrderSummary[]> {
  const { rows } = await query<OrderSummary>(
    `SELECT o.id, o.status, o.total, o.created_at,
            count(i.id)::int::text AS item_count
       FROM orders o
       LEFT JOIN order_items i ON i.order_id = o.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC`,
    [userId]
  );
  return rows;
}

/**
 * Fetch one order scoped to the owning user.
 * Returns null if the order doesn't exist OR belongs to someone else.
 */
export async function getUserOrder(
  userId: string,
  orderId: string
): Promise<OrderDetail | null> {
  // Orders are UUIDs; an invalid id is simply "not found".
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)
  ) {
    return null;
  }

  const { rows } = await query<OrderSummary & { shipping_address: string }>(
    `SELECT id, status, total, created_at, shipping_address,
            '0' AS item_count
       FROM orders
      WHERE id = $1 AND user_id = $2`,
    [orderId, userId]
  );
  const order = rows[0];
  if (!order) return null;

  const { rows: items } = await query<OrderDetail["items"][number]>(
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
