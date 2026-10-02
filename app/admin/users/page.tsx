import { auth } from "@/lib/auth";
import { listUsers } from "@/lib/adminUsers";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import StatusBadge from "@/components/admin/StatusBadge";
import UserRowActions from "./UserRowActions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/format";

export const metadata = { title: "Users" };

type SearchParams = Promise<{ q?: string; page?: string }>;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const [session, { users, total, totalPages }] = await Promise.all([
    auth(),
    listUsers({ search: q, page: currentPage }),
  ]);
  const selfId = session?.user?.id;

  const columns: Column<(typeof users)[number]>[] = [
    {
      key: "user",
      header: "User",
      cell: (row) => (
        <div>
          <p className="font-medium">
            {row.name}
            {row.id === selfId && (
              <span className="ml-2 text-xs font-normal text-ink-soft/70">(you)</span>
            )}
          </p>
          <p className="text-xs text-ink-soft">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (row) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
            row.role === "admin"
              ? "bg-indigo-100 text-indigo-800"
              : "bg-parchment text-ink-soft"
          }`}
        >
          {row.role}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge status={row.is_blocked ? "blocked" : "active"} />
      ),
    },
    {
      key: "orders",
      header: "Orders",
      cell: (row) => row.order_count,
    },
    {
      key: "spent",
      header: "Total spent",
      cell: (row) => (
        <span className="font-semibold">{formatCurrency(row.total_spent ?? 0)}</span>
      ),
    },
    {
      key: "joined",
      header: "Joined",
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
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <UserRowActions
          userId={row.id}
          isBlocked={row.is_blocked}
          role={row.role}
          isSelf={row.id === selfId}
        />
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold">Users</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {total} {total === 1 ? "user" : "users"}
      </p>

      <form method="GET" className="mt-6 flex max-w-md gap-3">
        <Input
          type="search"
          name="q"
          defaultValue={q?.trim() ?? ""}
          placeholder="Search by name or email…"
          aria-label="Search users"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={users}
          emptyMessage={q ? `No users match “${q.trim()}”.` : "No users yet."}
        />
      </div>

      <Pagination
        basePath="/admin/users"
        page={currentPage}
        totalPages={totalPages}
        searchParams={{ q: q?.trim() }}
      />
    </div>
  );
}
