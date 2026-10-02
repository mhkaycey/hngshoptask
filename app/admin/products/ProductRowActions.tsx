"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import {
  setProductActive,
  deleteProduct,
} from "@/app/actions/admin/products";

export default function ProductRowActions({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<"deactivate" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ success: boolean; message?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        setDialog(null);
        setError(null);
        router.refresh();
      } else {
        setError(result.message ?? "Action failed.");
        setDialog(null);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/products/${productId}/edit`}
        className="rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-medium hover:bg-parchment"
      >
        Edit
      </Link>

      {isActive ? (
        <button
          onClick={() => setDialog("deactivate")}
          className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"
        >
          Deactivate
        </button>
      ) : (
        <button
          onClick={() => run(() => setProductActive(productId, true))}
          className="rounded-lg border border-green-300 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
        >
          Reactivate
        </button>
      )}

      <button
        onClick={() => setDialog("delete")}
        className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
      >
        Delete
      </button>

      {error && <span className="text-xs text-red-600">{error}</span>}

      <ConfirmDialog
        open={dialog === "deactivate"}
        destructive
        title="Deactivate product?"
        message="The product will be hidden from the storefront but kept with its order history. You can reactivate it anytime."
        confirmLabel="Deactivate"
        busy={pending}
        onConfirm={() => run(() => setProductActive(productId, false))}
        onCancel={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog === "delete"}
        destructive
        title="Delete product?"
        message="This permanently deletes the product. Only possible when it has no orders — otherwise, deactivate it instead."
        confirmLabel="Delete permanently"
        busy={pending}
        onConfirm={() => run(() => deleteProduct(productId))}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
