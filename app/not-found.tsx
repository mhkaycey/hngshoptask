import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-sm uppercase tracking-widest text-clay">404</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-ink">
        We couldn&#39;t find that page
      </h1>
      <p className="mt-4 max-w-md text-ink-soft">
        The page may have moved, or the link might be a little off. Everything
        else is still on the shelf.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-full bg-clay px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-clay-deep"
        >
          Back to the shop
        </Link>
        <Link
          href="/products"
          className="rounded-full border border-ink/15 px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-parchment"
        >
          Browse products
        </Link>
      </div>
    </main>
  );
}
