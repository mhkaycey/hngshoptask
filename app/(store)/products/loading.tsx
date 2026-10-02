export default function ProductsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <div className="h-8 w-48 animate-pulse rounded bg-sand/60" />
      <div className="mt-6 flex gap-4">
        <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-sand/60" />
        <div className="h-10 w-40 animate-pulse rounded-lg bg-sand/60" />
      </div>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-ink/10"
          >
            <div className="aspect-square w-full animate-pulse bg-sand/60" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-16 animate-pulse rounded bg-sand/60" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-sand/60" />
              <div className="h-5 w-20 animate-pulse rounded bg-sand/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
