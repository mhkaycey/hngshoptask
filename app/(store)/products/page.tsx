import Link from "next/link";
import { getCategories, listProducts } from "@/lib/products";
import ProductGrid from "@/components/store/ProductGrid";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Products" };

type SearchParams = Promise<{
  q?: string;
  category?: string;
  page?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, category, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const [{ products, total, totalPages }, categories] = await Promise.all([
    listProducts({ search: q, category, page: currentPage }),
    getCategories(),
  ]);

  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    params.set("page", String(target));
    return `/products?${params.toString()}`;
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
      <p className="mt-1 font-mono text-xs uppercase tracking-[0.3em] text-clay">
        The catalogue
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        All products
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        {total} {total === 1 ? "product" : "products"}
      </p>

      <form
        method="GET"
        className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <Input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name…"
          className="sm:max-w-md"
          aria-label="Search products by name"
        />
        <select
          name="category"
          defaultValue={category ?? ""}
          aria-label="Filter by category"
          className="h-10 rounded-xl border border-ink/15 bg-parchment/60 px-3 text-sm text-ink outline-none focus:border-clay"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <Button type="submit">Filter</Button>
        {(q || category) && (
          <Link
            href="/products"
            className="link-underline text-center font-mono text-xs uppercase tracking-[0.15em] text-ink-soft hover:text-ink"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="mt-10">
        <ProductGrid products={products} />
      </div>

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={pageHref(currentPage - 1)}
              className="rounded-full border border-ink/20 bg-parchment px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] hover:bg-sand"
            >
              ← Previous
            </Link>
          )}
          <span className="px-2 font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={pageHref(currentPage + 1)}
              className="rounded-full border border-ink/20 bg-parchment px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] hover:bg-sand"
            >
              Next →
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
