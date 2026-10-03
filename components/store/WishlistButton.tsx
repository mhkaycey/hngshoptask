"use client";

import { useState, useTransition } from "react";
import { addToWishlist, removeFromWishlist } from "@/app/actions/wishlist";

export default function WishlistButton({
  productId,
  initiallySaved,
  signedIn,
}: {
  productId: string;
  initiallySaved: boolean;
  signedIn: boolean;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!signedIn) {
      setNotice("Sign in to save products to your wishlist.");
      window.setTimeout(() => setNotice(null), 3000);
      return;
    }
    const next = !saved;
    setSaved(next); // optimistic
    startTransition(async () => {
      const result = next
        ? await addToWishlist(productId)
        : await removeFromWishlist(productId);
      if (!result.success) {
        setSaved(!next); // revert
        setNotice(result.message);
        window.setTimeout(() => setNotice(null), 3000);
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={saved}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-ink/20 bg-parchment px-5 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-ink transition-all hover:bg-sand disabled:opacity-60"
      >
        <span aria-hidden className={saved ? "text-clay" : "text-ink-soft"}>
          {saved ? "♥" : "♡"}
        </span>
        {saved ? "Saved" : "Save"}
      </button>
      {notice && (
        <span className="font-mono text-[11px] text-clay-deep">{notice}</span>
      )}
    </div>
  );
}
