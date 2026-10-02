import "server-only";
import { query } from "@/lib/db";

export type DashboardStats = {
  totalRevenue: string;
  totalOrders: string;
  /** Revenue/order count for the previous period (for trend comparison). */
  prevRevenue: string;
  prevOrders: string;
  totalCustomers: string;
  lowStockCount: string;
};

export type DailySalesPoint = { date: string; revenue: string; orders: string };

export type TopProduct = {
  id: string;
  name: string;
  quantity_sold: string;
  revenue: string;
};

export type RecentOrder = {
  id: string;
  total: string;
  status: string;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
};

export type LowStockProduct = {
  id: string;
  name: string;
  stock: number;
  category: string;
};

/** Stats for the last `days` days, plus the same figures for the period
 *  before that so the dashboard can show period-over-period trends. */
export async function getDashboardStats(days = 30): Promise<DashboardStats> {
  const safeDays = [7, 30, 90].includes(days) ? days : 30;
  const { rows } = await query<DashboardStats>(
    `SELECT
      COALESCE(sum(total) FILTER (
        WHERE status <> 'cancelled' AND created_at >= CURRENT_DATE - make_interval(days => $1)
      ), 0)::text AS "totalRevenue",
      count(*) FILTER (
        WHERE status <> 'cancelled' AND created_at >= CURRENT_DATE - make_interval(days => $1)
      )::int::text AS "totalOrders",
      COALESCE(sum(total) FILTER (
        WHERE status <> 'cancelled'
          AND created_at >= CURRENT_DATE - make_interval(days => 2 * $1)
          AND created_at <  CURRENT_DATE - make_interval(days => $1)
      ), 0)::text AS "prevRevenue",
      count(*) FILTER (
        WHERE status <> 'cancelled'
          AND created_at >= CURRENT_DATE - make_interval(days => 2 * $1)
          AND created_at <  CURRENT_DATE - make_interval(days => $1)
      )::int::text AS "prevOrders",
      (SELECT count(*) FROM users)::int::text AS "totalCustomers",
      (SELECT count(*) FROM products WHERE is_active AND stock <= 5)::int::text AS "lowStockCount"
    FROM orders`,
    [safeDays]
  );
  return rows[0];
}

/** Last `days` days of revenue/order counts; missing days are zero-filled in SQL. */
export async function getDailySales(days = 30): Promise<DailySalesPoint[]> {
  const safeDays = [7, 30, 90].includes(days) ? days : 30;
  const { rows } = await query<{ day: string; revenue: string; orders: string }>(
    `SELECT to_char(d.day, 'YYYY-MM-DD') AS day,
            COALESCE(sum(o.total) FILTER (WHERE o.status <> 'cancelled'), 0)::text AS revenue,
            count(o.id) FILTER (WHERE o.status <> 'cancelled')::int::text AS orders
       FROM generate_series(
              (CURRENT_DATE - make_interval(days => $1 - 1))::date,
              CURRENT_DATE,
              INTERVAL '1 day'
            ) AS d(day)
       LEFT JOIN orders o ON o.created_at::date = d.day
      GROUP BY d.day
      ORDER BY d.day`,
    [safeDays]
  );
  return rows.map((r) => ({ date: r.day, revenue: r.revenue, orders: r.orders }));
}

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  const { rows } = await query<TopProduct>(
    `SELECT p.id, p.name,
            sum(i.quantity)::int::text AS quantity_sold,
            sum(i.subtotal)::text AS revenue
       FROM order_items i
       JOIN orders o ON o.id = i.order_id
       JOIN products p ON p.id = i.product_id
      WHERE o.status <> 'cancelled'
      GROUP BY p.id, p.name
      ORDER BY sum(i.quantity) DESC, p.name
      LIMIT $1`,
    [limit]
  );
  return rows;
}

export async function getRecentOrders(limit = 5): Promise<RecentOrder[]> {
  const { rows } = await query<RecentOrder>(
    `SELECT o.id, o.total, o.status, o.created_at,
            u.name AS customer_name, u.email AS customer_email
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
      LIMIT $1`,
    [limit]
  );
  return rows;
}

export async function getLowStockProducts(): Promise<LowStockProduct[]> {
  const { rows } = await query<LowStockProduct>(
    `SELECT id, name, stock, category
       FROM products
      WHERE is_active = TRUE AND stock <= 5
      ORDER BY stock ASC, name
      LIMIT 10`
  );
  return rows;
}
