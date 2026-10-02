import Link from "next/link";
import { listOrders } from "@/lib/adminOrders";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import StatusBadge from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/format";

export const metadata = { title: "Orders" };

type SearchParams = Promise<{
  status?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: string;
}>;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status, from, to, q, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const { orders, total, totalPages } = await listOrders({
    status,
    from,
    to,
    q,
    page: currentPage,
  });

  const columns: Column<(typeof orders)[number]>[] = [
    {
      key: "id",
      header: "Order",
      cell: (row) => (
        <Link
          href={`/admin/orders/${row.id}`}
          className="font-mono text-xs font-medium text-ink-soft hover:text-ink hover:underline"
        >
          {row.id.slice(0, 8)}…
        </Link>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.customer_name ?? "Guest"}</p>
          <p className="text-xs text-ink-soft">{row.customer_email ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      cell: (row) => <span className="font-semibold">{formatCurrency(row.total)}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "date",
      header: "Date",
      cell: (row) => (
        <span className="text-ink-soft">
          {new Date(row.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "items",
      header: "Items",
      cell: (row) => row.item_count,
    },
  ];

  const hasFilters = Boolean(status || from || to || q);

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold">Orders</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {total} {total === 1 ? "order" : "orders"}
      </p>

      <form
        method="GET"
        className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:items-center"
      >
        <Input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Order id or customer…"
          aria-label="Search by order id or customer"
          className="lg:col-span-2"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          aria-label="Filter by status"
          className="h-10 rounded-lg border border-ink/15 bg-parchment px-3 text-sm outline-none focus:border-clay"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <Input type="date" name="from" defaultValue={from ?? ""} aria-label="From date" />
        <Input type="date" name="to" defaultValue={to ?? ""} aria-label="To date" />
        <Button type="submit" variant="secondary">
          Filter
        </Button>
        {hasFilters && (
          <Link
            href="/admin/orders"
            className="text-center text-sm font-medium text-ink-soft hover:text-ink"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={orders}
          emptyMessage={
            hasFilters ? "No orders match these filters." : "No orders yet."
          }
        />
      </div>

      <Pagination
        basePath="/admin/orders"
        page={currentPage}
        totalPages={totalPages}
        searchParams={{ status, from, to, q }}
      />
    </div>
  );
}
