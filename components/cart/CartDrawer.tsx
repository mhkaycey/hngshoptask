"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatCurrency } from "@/lib/format";

export default function CartDrawer() {
  const { isOpen, closeCart, items, updateQuantity, removeItem } = useCart();

  // Close on Escape and lock scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  // Rendered only while open: a fixed element translated off-screen can still
  // extend the layout viewport on mobile and be revealed by overscroll.
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <button
        aria-label="Close cart"
        onClick={closeCart}
        className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-[2px]"
      />

      {/* Panel — anchored right by the flex container, not by coordinates. */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="relative z-10 flex h-full w-full max-w-md animate-drawer-in flex-col border-l border-ink/10 bg-cream shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Your cart{" "}
            <span className="font-mono text-sm font-normal text-ink-soft">
              ({items.reduce((s, i) => s + i.quantity, 0)})
            </span>
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 bg-parchment text-lg transition-colors hover:bg-sand"
          >
            ✕
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="font-display text-4xl italic text-clay">✳</span>
            <p className="font-display text-lg font-semibold">
              Your cart is empty
            </p>
            <p className="text-sm text-ink-soft">
              Browse the catalogue to find something you like.
            </p>
            <Link
              href="/products"
              onClick={closeCart}
              className="link-underline mt-2 font-mono text-xs uppercase tracking-[0.15em] text-ink-soft hover:text-ink"
            >
              Start shopping →
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 py-5">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-ink/10 bg-sand/50">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.productId}`}
                        onClick={closeCart}
                        className="font-display text-base font-semibold leading-snug hover:text-clay"
                      >
                        {item.name}
                      </Link>
                      <span className="shrink-0 text-sm font-semibold">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex h-8 items-center rounded-full border border-ink/20 bg-parchment">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="h-full w-8 text-base"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-mono text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock}
                          className="h-full w-8 text-base disabled:text-ink/25"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft/70 hover:text-clay-deep"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-ink/10 bg-parchment/60 px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-ink-soft">
                  Subtotal
                </span>
                <span className="font-display text-2xl font-semibold text-clay">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft/70">
                Final prices confirmed at checkout.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-cream shadow-[3px_3px_0_0_var(--color-gold)] transition-all hover:bg-clay hover:shadow-[3px_3px_0_0_var(--color-clay-deep)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                >
                  Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="link-underline inline-flex h-10 items-center justify-center font-mono text-xs uppercase tracking-[0.15em] text-ink-soft hover:text-ink"
                >
                  View full cart
                </Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
