const styles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
  active: "bg-green-100 text-green-800",
  inactive: "bg-sand/70 text-ink-soft",
  blocked: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        styles[status] ?? "bg-parchment text-ink-soft"
      }`}
    >
      {status}
    </span>
  );
}
