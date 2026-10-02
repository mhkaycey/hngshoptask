import Link from "next/link";

/** Query-param based pagination; preserves all existing search params. */
export default function Pagination({
  basePath,
  page,
  totalPages,
  searchParams = {},
}: {
  basePath: string;
  page: number;
  totalPages: number;
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (target: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(target));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <nav className="mt-6 flex items-center justify-center gap-2">
      {page > 1 && (
        <Link
          href={href(page - 1)}
          className="rounded-lg border border-ink/15 px-4 py-2 text-sm hover:bg-parchment"
        >
          ← Previous
        </Link>
      )}
      <span className="px-2 text-sm text-ink-soft">
        Page {page} of {totalPages}
      </span>
      {page < totalPages && (
        <Link
          href={href(page + 1)}
          className="rounded-lg border border-ink/15 px-4 py-2 text-sm hover:bg-parchment"
        >
          Next →
        </Link>
      )}
    </nav>
  );
}
