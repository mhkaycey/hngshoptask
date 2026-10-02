import Link from "next/link";
import { auth } from "@/lib/auth";
import CheckoutForm from "./CheckoutForm";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await auth();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <nav className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
        <Link href="/cart" className="hover:text-clay">
          ← Back to cart
        </Link>
      </nav>
      <h1 className="mb-6 mt-4 font-display text-4xl font-semibold tracking-tight">Checkout</h1>

      {/* Progress stepper */}
      <ol className="mb-10 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.15em]">
        <li>
          <Link href="/cart" className="flex items-center gap-2 text-ink-soft hover:text-clay">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-ink/25 bg-parchment">
              ✓
            </span>
            Cart
          </Link>
        </li>
        <li aria-hidden className="h-px w-8 bg-ink/25" />
        <li className="flex items-center gap-2 text-ink">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-cream">
            2
          </span>
          Details
        </li>
        <li aria-hidden className="h-px w-8 bg-ink/25" />
        <li className="flex items-center gap-2 text-ink-soft/60">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-ink/25">
            3
          </span>
          Confirmation
        </li>
      </ol>
      <CheckoutForm
        defaultName={session?.user?.name ?? null}
        defaultEmail={session?.user?.email ?? null}
      />
    </main>
  );
}
