"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatCurrency } from "@/lib/format";

export default function CartPage() {
  const { items, loaded, updateQuantity, removeItem, clear } = useCart();

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  if (!loaded) {
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <div className="h-8 w-32 animate-pulse rounded bg-sand/60" />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Your cart</h1>
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/25 bg-parchment/50 py-20 text-center">
          <span className="font-display text-3xl italic text-clay">✳</span>
          <p className="font-display text-lg font-semibold">Your cart is empty</p>
          <p className="text-sm text-ink-soft">
            Browse the catalog to find something you like.
          </p>
          <Link
            href="/products"
            className="mt-3 inline-flex h-11 items-center rounded-full bg-ink px-6 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-cream shadow-[3px_3px_0_0_var(--color-gold)] transition-all hover:bg-clay hover:shadow-[3px_3px_0_0_var(--color-clay-deep)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Your cart</h1>
        <button
          onClick={clear}
          className="link-underline font-mono text-xs uppercase tracking-[0.15em] text-ink-soft hover:text-clay-deep"
        >
          Clear cart
        </button>
      </div>

      <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-ink/10 bg-sand/50">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              )}
            </div>

            <div className="flex-1">
              <Link
                href={`/products/${item.productId}`}
                className="link-underline font-display text-lg font-semibold"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-ink-soft">
                {formatCurrency(item.price)} each
                {item.quantity >= item.stock && (
                  <span className="ml-2 font-mono text-xs uppercase tracking-wide text-gold">
                    (max stock: {item.stock})
                  </span>
                )}
              </p>
            </div>

            <div className="flex h-10 items-center rounded-full border border-ink/20 bg-parchment">
              <button
                type="button"
                aria-label={`Decrease quantity of ${item.name}`}
                onClick={() =>
                  updateQuantity(item.productId, item.quantity - 1)
                }
                className="h-full w-10 text-lg"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-medium">
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label={`Increase quantity of ${item.name}`}
                onClick={() =>
                  updateQuantity(item.productId, item.quantity + 1)
                }
                disabled={item.quantity >= item.stock}
                className="h-full w-10 text-lg disabled:text-ink/25"
              >
                +
              </button>
            </div>

            <span className="w-24 text-right font-display text-lg font-semibold">
              {formatCurrency(Number(item.price) * item.quantity)}
            </span>

            <button
              onClick={() => removeItem(item.productId)}
              aria-label={`Remove ${item.name} from cart`}
              className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft/70 hover:text-clay-deep"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col items-end gap-4">
        <div className="flex w-full items-center justify-between border-t-2 border-ink/15 pt-6 sm:w-auto sm:gap-12">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-ink-soft">Subtotal</span>
          <span className="font-display text-3xl font-semibold text-clay">
            {formatCurrency(subtotal)}
          </span>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft/70">
          Final prices are confirmed at checkout.
        </p>
        <Link
          href="/checkout"
          className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-12 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-cream shadow-[4px_4px_0_0_var(--color-gold)] transition-all hover:bg-clay hover:shadow-[4px_4px_0_0_var(--color-clay-deep)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
        >
          Checkout
        </Link>
      </div>
    </main>
  );
}
