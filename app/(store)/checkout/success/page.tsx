import Link from "next/link";
import ClearCart from "./ClearCart";

export const metadata = { title: "Order confirmed" };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-6 py-24 text-center">
      <ClearCart />
      {/* Progress stepper — confirmation */}
      <ol className="mb-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-soft/60">
        <li className="flex items-center gap-2 text-ink-soft">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-ink/25 bg-parchment">✓</span>
          Cart
        </li>
        <li aria-hidden className="h-px w-8 bg-ink/25" />
        <li className="flex items-center gap-2 text-ink-soft">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-ink/25 bg-parchment">✓</span>
          Details
        </li>
        <li aria-hidden className="h-px w-8 bg-ink/25" />
        <li className="flex items-center gap-2 text-moss">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-moss text-cream">✓</span>
          Confirmation
        </li>
      </ol>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-moss/15">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-8 w-8 text-moss"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
        </svg>
      </div>
      <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight">Thank you for your order!</h1>
      <p className="mt-3 text-ink-soft">
        Your order has been received. A confirmation email is on its way.
      </p>
      {orderId && (
        <p className="mt-4 rounded-lg bg-parchment px-4 py-2 font-mono text-sm">
          Order ID: {orderId}
        </p>
      )}
      <Link
        href="/products"
        className="mt-8 rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream hover:bg-clay"
      >
        Continue shopping
      </Link>
    </main>
  );
}
