"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { processCheckout } from "@/app/actions/checkout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/format";

export default function CheckoutForm({
  defaultName,
  defaultEmail,
}: {
  defaultName?: string | null;
  defaultEmail?: string | null;
}) {
  const { items, loaded } = useCart();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  if (loaded && items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/25 bg-parchment/50 py-20 text-center">
        <span className="font-display text-3xl italic text-clay">✳</span>
        <p className="mt-2 font-display text-lg font-semibold">Your cart is empty</p>
        <p className="mt-1 text-sm text-ink-soft">
          Add some products before checking out.
        </p>
      </div>
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const cartItems = items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }));

    startTransition(async () => {
      const result = await processCheckout(formData, cartItems);
      if (result.success) {
        router.push(`/checkout/success?orderId=${result.orderId}`);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]"
    >
      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="fullName" className="mb-1 block text-sm font-medium">
            Full name
          </label>
          <Input
            id="fullName"
            name="fullName"
            required
            defaultValue={defaultName ?? ""}
            placeholder="Ada Lovelace"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={defaultEmail ?? ""}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="shippingAddress" className="mb-1 block text-sm font-medium">
            Shipping address
          </label>
          <textarea
            id="shippingAddress"
            name="shippingAddress"
            required
            rows={4}
            minLength={10}
            placeholder="Street, city, state/region, postal code, country"
            className="w-full rounded-xl border border-ink/15 bg-parchment/60 p-3 text-sm text-ink outline-none placeholder:text-ink-soft/70 focus:border-clay focus:bg-parchment"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

      <aside className="h-fit rounded-xl border border-ink/10 p-6">
        <h2 className="font-semibold">Order summary</h2>
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-4 text-sm">
              <span className="text-ink-soft">
                {item.name}
                <span className="text-ink-soft/70"> × {item.quantity}</span>
              </span>
              <span className="font-medium">
                {formatCurrency(Number(item.price) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-ink/10 pt-4">
          <span className="font-medium">Subtotal</span>
          <span className="text-lg font-bold">{formatCurrency(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-ink-soft/70">
          Prices are confirmed from our records at order time.
        </p>
        <Button type="submit" disabled={pending} className="mt-6 w-full">
          {pending ? "Placing order…" : "Place order"}
        </Button>

        {/* Reassurance band */}
        <ul className="mt-5 space-y-2.5 border-t border-ink/10 pt-4">
          <li className="flex items-center gap-2.5 text-xs text-ink-soft">
            <span aria-hidden className="text-moss">🔒</span>
            Secure checkout — prices verified against our records at order time
          </li>
          <li className="flex items-center gap-2.5 text-xs text-ink-soft">
            <span aria-hidden className="text-clay">✉</span>
            Order confirmation sent to your email immediately
          </li>
          <li className="flex items-center gap-2.5 text-xs text-ink-soft">
            <span aria-hidden className="text-gold">✳</span>
            Track every order from your account page
          </li>
        </ul>
      </aside>
    </form>
  );
}
