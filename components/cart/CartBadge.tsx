"use client";

import { useCart } from "@/components/cart/CartProvider";

export default function CartBadge() {
  const { count, loaded, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      aria-label={`Cart${loaded ? ` (${count} items)` : ""}`}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-parchment transition-colors hover:bg-sand"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.5l1.7 10.4a2.25 2.25 0 0 0 2.22 1.85h8.9a2.25 2.25 0 0 0 2.2-1.72l1.5-6.03H6.2M9 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm9.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>
      {loaded && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay px-1 font-mono text-[10px] font-bold text-cream">
          {count}
        </span>
      )}
    </button>
  );
}
