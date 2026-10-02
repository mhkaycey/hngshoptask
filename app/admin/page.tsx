import Link from "next/link";
import {
  getDashboardStats,
  getDailySales,
  getTopProducts,
  getRecentOrders,
  getLowStockProducts,
} from "@/lib/adminStats";
import { getRecentActivity } from "@/lib/adminActivity";
import SalesChart from "./SalesChart";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatCurrency } from "@/lib/format";

export const metadata = { title: "Admin dashboard" };

const RANGES = [7, 30, 90] as const;

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = (RANGES as readonly number[]).includes(Number(range))
    ? Number(range)
    : 30;

  const [stats, daily, top, recent, lowStock, activity] = await Promise.all([
    getDashboardStats(days),
    getDailySales(days),
    getTopProducts(),
    getRecentOrders(),
    getLowStockProducts(),
    getRecentActivity(8),
  ]);

  const chartData = daily.map((d) => ({
    label: formatChartDay(d.date),
    revenue: Number(d.revenue),
    orders: Number(d.orders),
  }));

  /** Percentage change vs the previous period. Null when there is no baseline. */
  const delta = (current: number, previous: number): number | null =>
    previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;

  const statCards = [
    {
      label: `Revenue — ${days} days`,
      value: formatCurrency(stats.totalRevenue),
      hint: "excl. cancelled orders",
      trend: delta(Number(stats.totalRevenue), Number(stats.prevRevenue)),
    },
    {
      label: `Orders — ${days} days`,
      value: stats.totalOrders,
      hint: "excl. cancelled orders",
      trend: delta(Number(stats.totalOrders), Number(stats.prevOrders)),
    },
    { label: "Customers", value: stats.totalCustomers, hint: "registered users", trend: null },
    {
      label: "Low-stock products",
      value: stats.lowStockCount,
      hint: "active, ≤ 5 in stock",
      trend: null,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-clay">
            Overview
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
        </div>

        {/* Date range toggle */}
        <div
          role="group"
          aria-label="Date range"
          className="flex items-center gap-1 rounded-full border border-ink/15 bg-parchment p-1"
        >
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin?range=${r}`}
              aria-current={r === days ? "true" : undefined}
              className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                r === days
                  ? "bg-ink text-cream"
                  : "text-ink-soft hover:bg-sand hover:text-ink"
              }`}
            >
              {r}d
            </Link>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-ink/10 bg-parchment p-5 shadow-[4px_4px_0_0_var(--color-sand)]"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              {card.label}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold">{card.value}</p>
            <div className="mt-1 flex items-center gap-2">
              {card.trend !== null && (
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
                    card.trend >= 0
                      ? "bg-moss/15 text-moss"
                      : "bg-clay/15 text-clay-deep"
                  }`}
                >
                  {card.trend >= 0 ? "↑" : "↓"} {Math.abs(card.trend)}%
                </span>
              )}
              <p className="text-xs text-ink-soft/70">
                {card.trend !== null ? "vs previous period" : card.hint}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 30-day sales chart */}
      <section className="rounded-xl border border-ink/10 bg-parchment p-6">
        <h2 className="mb-4 font-semibold">Sales — last {days} days</h2>
        <SalesChart data={chartData} days={days} />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top products */}
        <section className="rounded-xl border border-ink/10 bg-parchment p-6">
          <h2 className="mb-4 font-semibold">Top products</h2>
          {top.length === 0 ? (
            <Empty text="No sales yet." />
          ) : (
            <ol className="divide-y divide-ink/5">
              {top.map((product, index) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="w-5 text-ink-soft/70">{index + 1}.</span>
                    <Link
                      href={`/products/${product.id}`}
                      className="truncate font-medium hover:underline"
                    >
                      {product.name}
                    </Link>
                  </span>
                  <span className="shrink-0 text-ink-soft">
                    {product.quantity_sold} sold ·{" "}
                    <span className="font-semibold text-ink">
                      {formatCurrency(product.revenue)}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Recent orders */}
        <section className="rounded-xl border border-ink/10 bg-parchment p-6">
          <h2 className="mb-4 font-semibold">Recent orders</h2>
          {recent.length === 0 ? (
            <Empty text="No orders yet." />
          ) : (
            <ul className="divide-y divide-ink/5">
              {recent.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-mono text-xs font-medium text-ink-soft hover:text-ink hover:underline"
                  >
                    {order.id.slice(0, 8)}…
                  </Link>
                  <span className="hidden min-w-0 truncate text-ink-soft sm:block">
                    {order.customer_name ?? order.customer_email ?? "Guest"}
                  </span>
                  <StatusBadge status={order.status} />
                  <span className="font-semibold">
                    {formatCurrency(order.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Recent admin activity */}
      <section className="rounded-xl border border-ink/10 bg-parchment p-6">
        <h2 className="mb-4 font-semibold">Recent admin activity</h2>
        {activity.length === 0 ? (
          <Empty text="No admin activity recorded yet." />
        ) : (
          <ul className="divide-y divide-ink/5">
            {activity.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-4 py-3 text-sm"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="rounded-full bg-sand/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                    {entry.action}
                  </span>
                  <span className="min-w-0 truncate text-ink-soft">
                    {entry.detail ?? entry.entity_type}
                  </span>
                </span>
                <span
                  className="shrink-0 text-xs text-ink-soft/70"
                  title={entry.admin_email ?? undefined}
                >
                  {new Date(entry.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Low stock */}
      <section className="rounded-xl border border-ink/10 bg-parchment p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Low stock</h2>
          <Link
            href="/admin/products"
            className="text-sm font-medium text-ink-soft hover:text-ink"
          >
            Manage products →
          </Link>
        </div>
        {lowStock.length === 0 ? (
          <Empty text="No active products are low on stock." />
        ) : (
          <ul className="divide-y divide-ink/5">
            {lowStock.map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between gap-4 py-3 text-sm"
              >
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="font-medium hover:underline"
                >
                  {product.name}
                </Link>
                <span className="flex items-center gap-4">
                  <span className="text-xs text-ink-soft">{product.category}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      product.stock === 0
                        ? "bg-clay/15 text-clay-deep"
                        : "bg-gold/20 text-ink"
                    }`}
                  >
                    {product.stock} left
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="py-10 text-center text-sm text-ink-soft">{text}</p>
  );
}

/** "YYYY-MM-DD" (or anything Date-parseable) → "Oct 1"; never "Invalid Date". */
function formatChartDay(day: string): string {
  const normalized = /^\d{4}-\d{2}-\d{2}/.test(day) ? `${day.slice(0, 10)}T00:00:00` : day;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime())
    ? day
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
