import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserOrder } from "@/lib/orders";
import { formatCurrency } from "@/lib/format";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  return { title: `Order ${id.slice(0, 8)} — hngshop` };
}

export default async function OrderDetailPage({ params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/?error=unauthenticated");
  }

  const { id } = await params;
  // Scoped by user_id — someone else's order (or a bad id) is simply not found.
  const order = await getUserOrder(session.user.id, id);
  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <nav className="text-sm text-ink-soft">
        <Link href="/account/orders" className="hover:text-ink">
          ← Back to my orders
        </Link>
      </nav>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Order details</h1>
          <p className="mt-1 font-mono text-sm text-ink-soft">{order.id}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{formatCurrency(order.total)}</p>
          <p className="text-sm capitalize text-ink-soft">Status: {order.status}</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-ink-soft">
        Placed{" "}
        {new Date(order.created_at).toLocaleString("en-US", {
          dateStyle: "long",
          timeStyle: "short",
        })}
      </p>

      {/* Status timeline */}
      {order.status === "cancelled" ? (
        <p className="mt-6 rounded-xl border border-ink/15 bg-parchment px-5 py-3 font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
          ✕ This order was cancelled
        </p>
      ) : (
        <ol className="mt-8 flex items-center gap-2">
          {(["pending", "processing", "completed"] as const).map(
            (step, i, steps) => {
              const currentIndex = steps.indexOf(
                order.status as (typeof steps)[number]
              );
              const done = currentIndex >= i;
              return (
                <li key={step} className="flex flex-1 items-center gap-2">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] ${
                      done
                        ? "bg-moss text-cream"
                        : "border border-ink/25 bg-parchment text-ink-soft/60"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[0.15em] ${
                      done ? "text-ink" : "text-ink-soft/60"
                    }`}
                  >
                    {step}
                  </span>
                  {i < steps.length - 1 && (
                    <span
                      aria-hidden
                      className={`h-px flex-1 ${
                        currentIndex > i ? "bg-moss/50" : "bg-ink/15"
                      }`}
                    />
                  )}
                </li>
              );
            }
          )}
        </ol>
      )}

      <section className="mt-8">
        <h2 className="font-semibold">Items</h2>
        <ul className="mt-3 divide-y divide-ink/10 rounded-xl border border-ink/10">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 px-6 py-4"
            >
              <div>
                {item.product_name ? (
                  <Link
                    href={`/products/${item.product_id}`}
                    className="font-medium hover:underline"
                  >
                    {item.product_name}
                  </Link>
                ) : (
                  <span className="font-medium text-ink-soft/70">
                    Product no longer available
                  </span>
                )}
                <p className="mt-0.5 text-sm text-ink-soft">
                  {item.quantity} × {formatCurrency(item.unit_price)}{" "}
                  <span className="text-ink-soft/70">(price at purchase)</span>
                </p>
              </div>
              <span className="font-semibold">
                {formatCurrency(item.subtotal)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold">Shipping address</h2>
        <p className="mt-3 whitespace-pre-line rounded-xl border border-ink/10 px-6 py-4 text-sm leading-6 text-ink-soft">
          {order.shipping_address}
        </p>
      </section>
    </main>
  );
}
