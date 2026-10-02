import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listUserOrders } from "@/lib/orders";
import { formatCurrency } from "@/lib/format";

export const metadata = { title: "My orders" };

const statusStyles: Record<string, string> = {
  pending: "bg-gold/20 text-ink",
  processing: "bg-clay/15 text-clay-deep",
  completed: "bg-moss/15 text-moss",
  cancelled: "bg-ink/10 text-ink-soft line-through",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/?error=unauthenticated");
  }

  const orders = await listUserOrders(session.user.id);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <h1 className="font-display text-4xl font-semibold tracking-tight">My orders</h1>

      {orders.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-2 rounded-xl border border-dashed border-ink/15 py-20 text-center">
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm text-ink-soft">
            Your past orders will appear here after checkout.
          </p>
          <Link
            href="/products"
            className="mt-3 rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream hover:bg-clay"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-ink/10 rounded-xl border border-ink/10">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/account/orders/${order.id}`}
                className="flex flex-col gap-2 px-6 py-5 hover:bg-parchment/50 sm:flex-row sm:items-center sm:justify-between"
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
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      statusStyles[order.status] ?? "bg-parchment text-ink-soft"
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
    </main>
  );
}
