"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { blockUser, unblockUser, setUserRole } from "@/app/actions/admin/users";

export default function UserRowActions({
  userId,
  isBlocked,
  role,
  isSelf,
}: {
  userId: string;
  isBlocked: boolean;
  role: "user" | "admin";
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<"block" | "demote" | "promote" | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ success: boolean; message: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      setDialog(null);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  // You can never block or demote yourself.
  if (isSelf) {
    return <span className="text-xs text-ink-soft/70">This is you</span>;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {isBlocked ? (
        <button
          onClick={() => run(() => unblockUser(userId))}
          disabled={pending}
          className="rounded-lg border border-green-300 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
        >
          Unblock
        </button>
      ) : (
        <button
          onClick={() => setDialog("block")}
          disabled={pending}
          className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Block
        </button>
      )}

      {role === "admin" ? (
        <button
          onClick={() => setDialog("demote")}
          disabled={pending}
          className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
        >
          Demote to user
        </button>
      ) : (
        <button
          onClick={() => setDialog("promote")}
          disabled={pending}
          className="rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-medium hover:bg-parchment disabled:opacity-50"
        >
          Make admin
        </button>
      )}

      {error && <span className="text-xs text-red-600">{error}</span>}

      <ConfirmDialog
        open={dialog === "block"}
        destructive
        title="Block this user?"
        message="They will be signed out on their next request and unable to sign in or place orders. You can unblock them anytime."
        confirmLabel="Block user"
        busy={pending}
        onConfirm={() => run(() => blockUser(userId))}
        onCancel={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog === "demote"}
        destructive
        title="Remove admin access?"
        message="This user will lose access to the admin area immediately."
        confirmLabel="Demote to user"
        busy={pending}
        onConfirm={() => run(() => setUserRole(userId, "user"))}
        onCancel={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog === "promote"}
        title="Grant admin access?"
        message="This user will gain full access to the admin area, including products, orders, and users."
        confirmLabel="Make admin"
        busy={pending}
        onConfirm={() => run(() => setUserRole(userId, "admin"))}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
