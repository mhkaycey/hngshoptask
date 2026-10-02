import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listUserOrders } from "@/lib/orders";
import { formatCurrency } from "@/lib/format";
import { SignOutButton } from "@/components/GoogleAuthButton";

export const metadata = { title: "My account" };

const statusStyles: Record<string, string> = {
  pending: "bg-gold/20 text-ink",
  processing: "bg-clay/15 text-clay-deep",
  completed: "bg-moss/15 text-moss",
  cancelled: "bg-ink/10 text-ink-soft line-through",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/?error=unauthenticated");
  }

  const orders = await listUserOrders(session.user.id);
  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-clay">
        Your corner of the shop
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
        My account
      </h1>

      {/* Profile card */}
      <section className="mt-8 flex flex-col gap-6 rounded-2xl border border-ink/10 bg-parchment p-6 shadow-[6px_6px_0_0_var(--color-sand)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "avatar"}
              width={64}
              height={64}
              className="rounded-full ring-2 ring-clay/40 ring-offset-2 ring-offset-parchment"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sand font-display text-2xl italic">
              {(session.user.name ?? "?").charAt(0)}
            </div>
          )}
          <div>
            <p className="font-display text-xl font-semibold">
              {session.user.name ?? "Shopper"}
            </p>
            <p className="text-sm text-ink-soft">{session.user.email}</p>
          </div>
        </div>
        <SignOutButton />
      </section>

      {/* Stats */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink/10 bg-parchment/50 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft">
            Orders
          </p>
          <p className="mt-1 font-display text-3xl font-semibold">
            {orders.length}
          </p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-parchment/50 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft">
            Total spent
          </p>
          <p className="mt-1 font-display text-3xl font-semibold">
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-parchment/50 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft">
            Latest order
          </p>
          <p className="mt-1 truncate font-display text-3xl font-semibold">
            {orders.length > 0
              ? formatCurrency(orders[0].total)
              : "—"}
          </p>
        </div>
      </section>

      {/* Recent orders */}
      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Recent orders
          </h2>
          <Link
            href="/account/orders"
            className="link-underline font-mono text-xs uppercase tracking-[0.15em] text-ink-soft hover:text-ink"
          >
            View all →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-ink/25 bg-parchment/50 py-16 text-center">
            <span className="font-display text-3xl italic text-clay">✳</span>
            <p className="font-display text-lg font-semibold">No orders yet</p>
            <p className="text-sm text-ink-soft">
              Your past orders will appear here after checkout.
            </p>
            <Link
              href="/products"
              className="mt-3 inline-flex h-10 items-center rounded-full bg-ink px-6 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-cream transition-colors hover:bg-clay"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-ink/10 rounded-2xl border border-ink/10">
            {orders.slice(0, 5).map((order) => (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex flex-col gap-2 px-6 py-4 transition-colors hover:bg-parchment/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      Order{" "}
                      <span className="font-mono text-sm text-ink-soft">
                        {order.id.slice(0, 8)}…
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm text-ink-soft">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      · {order.item_count}{" "}
                      {order.item_count === "1" ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${
                        statusStyles[order.status] ??
                        "bg-parchment text-ink-soft"
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
