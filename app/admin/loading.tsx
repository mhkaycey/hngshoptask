export default function AdminDashboardLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="h-8 w-44 animate-pulse rounded bg-sand/60" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-ink/10 bg-parchment"
          />
        ))}
      </div>

      <div className="h-72 animate-pulse rounded-xl border border-ink/10 bg-parchment" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-56 animate-pulse rounded-xl border border-ink/10 bg-parchment" />
        <div className="h-56 animate-pulse rounded-xl border border-ink/10 bg-parchment" />
      </div>

      <div className="h-40 animate-pulse rounded-xl border border-ink/10 bg-parchment" />
    </div>
  );
}
