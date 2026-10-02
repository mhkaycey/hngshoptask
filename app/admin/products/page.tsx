import Image from "next/image";
import Link from "next/link";
import { query } from "@/lib/db";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import StatusBadge from "@/components/admin/StatusBadge";
import ProductRowActions from "./ProductRowActions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/format";

export const metadata = { title: "Products" };

const PAGE_SIZE = 10;

type AdminProduct = {
  id: string;
  name: string;
  price: string;
  stock: number;
  category: string;
  image_url: string | null;
  is_active: boolean;
};

type SearchParams = Promise<{ q?: string; page?: string }>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const search = q?.trim();

  const conditions: string[] = [];
  const params: unknown[] = [];
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`name ILIKE $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows: countRows } = await query<{ count: string }>(
    `SELECT count(*)::int::text AS count FROM products ${where}`,
    params
  );
  const total = Number(countRows[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const { rows } = await query<AdminProduct>(
    `SELECT id, name, price, stock, category, image_url, is_active
       FROM products
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, PAGE_SIZE, (currentPage - 1) * PAGE_SIZE]
  );

  const columns: Column<AdminProduct>[] = [
    {
      key: "product",
      header: "Product",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-parchment">
            {row.image_url && (
              <Image
                src={row.image_url}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
              />
            )}
          </div>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-ink-soft">{row.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      cell: (row) => formatCurrency(row.price),
    },
    {
      key: "stock",
      header: "Stock",
      cell: (row) => (
        <span className={row.stock === 0 ? "font-medium text-red-600" : undefined}>
          {row.stock}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge status={row.is_active ? "active" : "inactive"} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (row) => <ProductRowActions productId={row.id} isActive={row.is_active} />,
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">Products</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {total} {total === 1 ? "product" : "products"} (including inactive)
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-cream hover:bg-clay"
        >
          + New product
        </Link>
      </div>

      <form method="GET" className="mt-6 flex max-w-md gap-3">
        <Input
          type="search"
          name="q"
          defaultValue={search ?? ""}
          placeholder="Search by name…"
          aria-label="Search products"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={rows}
          emptyMessage={search ? `No products match “${search}”.` : "No products yet."}
        />
      </div>

      <Pagination
        basePath="/admin/products"
        page={currentPage}
        totalPages={totalPages}
        searchParams={{ q: search }}
      />
    </div>
  );
}
