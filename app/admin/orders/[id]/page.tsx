import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/adminOrders";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatCurrency } from "@/lib/format";
import StatusControl from "../StatusControl";

export const metadata = { title: "Order details" };

type Params = Promise<{ id: string }>;

export default async function AdminOrderDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) {
    notFound();
  }

  return (
    <div>
      <nav className="text-sm text-ink-soft">
        <Link href="/admin/orders" className="hover:text-ink">
          ← Back to orders
        </Link>
      </nav>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">
            Order <span className="font-mono text-base text-ink-soft">{order.id}</span>
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Placed{" "}
            {new Date(order.created_at).toLocaleString("en-US", {
              dateStyle: "long",
              timeStyle: "short",
            })}{" "}
            · {order.item_count} {order.item_count === "1" ? "item" : "items"}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <span className="text-3xl font-bold">{formatCurrency(order.total)}</span>
          <StatusControl orderId={order.id} status={order.status} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="font-semibold">Items</h2>
          <ul className="mt-3 divide-y divide-ink/10 rounded-xl border border-ink/10 bg-parchment">
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

        <div className="flex flex-col gap-6">
          <section>
            <h2 className="font-semibold">Customer</h2>
            <div className="mt-3 rounded-xl border border-ink/10 bg-parchment px-5 py-4 text-sm">
              <p className="font-medium">{order.customer_name ?? "Guest checkout"}</p>
              <p className="mt-1 text-ink-soft">
                {order.customer_email ?? "No account email"}
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-semibold">Shipping address</h2>
            <p className="mt-3 whitespace-pre-line rounded-xl border border-ink/10 bg-parchment px-5 py-4 text-sm leading-6 text-ink-soft">
              {order.shipping_address}
            </p>
          </section>

          <section>
            <h2 className="font-semibold">Status</h2>
            <div className="mt-3 rounded-xl border border-ink/10 bg-parchment px-5 py-4">
              <StatusBadge status={order.status} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
