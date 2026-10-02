"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/actions/admin/orders";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import StatusBadge from "@/components/admin/StatusBadge";

/** Next status an admin may pick for the given current status. */
const NEXT_STATUSES: Record<string, string[]> = {
  pending: ["processing", "cancelled"],
  processing: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export default function StatusControl({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const options = NEXT_STATUSES[status] ?? [];

  function apply(next: string) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next);
      if (result.success) {
        setSuccess(result.message);
        setTarget(null);
        router.refresh();
      } else {
        setError(result.message);
        setTarget(null);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <StatusBadge status={status} />

      {options.length === 0 ? (
        <span className="text-xs text-ink-soft/70">Final status</span>
      ) : (
        options.map((next) => (
          <button
            key={next}
            onClick={() => (next === "cancelled" ? setTarget(next) : apply(next))}
            disabled={pending}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize disabled:opacity-50 ${
              next === "cancelled"
                ? "border-red-300 text-red-600 hover:bg-red-50"
                : "border-ink/15 hover:bg-parchment"
            }`}
          >
            Mark {next}
          </button>
        ))
      )}

      {success && <span className="text-xs text-green-700">{success}</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}

      <ConfirmDialog
        open={target === "cancelled"}
        destructive
        title="Cancel this order?"
        message="Cancelling returns all reserved stock to the inventory and notifies the customer. This cannot be undone."
        confirmLabel="Cancel order"
        busy={pending}
        onConfirm={() => apply("cancelled")}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
