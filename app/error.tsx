"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-sm uppercase tracking-widest text-clay">
        Something went wrong
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-ink">
        Well, that&#39;s not supposed to happen
      </h1>
      <p className="mt-4 max-w-md text-ink-soft">
        An unexpected error occurred. Please try again — if it keeps happening,
        come back a little later.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-ink-soft/60">
          Error reference: {error.digest}
        </p>
      )}
      <div className="mt-8 flex gap-4">
        <button
          onClick={reset}
          className="rounded-full bg-clay px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-clay-deep"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-ink/15 px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-parchment"
        >
          Back to the shop
        </Link>
      </div>
    </main>
  );
}
