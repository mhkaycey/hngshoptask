"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { withTransaction } from "@/lib/db";
import { sendOrderStatusEmail } from "@/lib/mailgun";
import { isUuid } from "@/lib/validations/ids";
import { logAdminActivity } from "@/lib/adminActivity";

const ORDER_STATUSES = ["pending", "processing", "completed", "cancelled"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Allowed transitions: forward only, plus cancel from pending/processing. */
const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export type UpdateOrderStatusResult =
  | { success: true; message: string }
  | { success: false; message: string };

export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<UpdateOrderStatusResult> {
  const admin = await requireAdmin();

  if (!isUuid(orderId)) {
    return { success: false, message: "Invalid order id." };
  }

  if (!ORDER_STATUSES.includes(newStatus as OrderStatus)) {
    return { success: false, message: "Invalid status." };
  }

  try {
    let previousStatus: OrderStatus | undefined;
    const customer = await withTransaction(async (tx) => {
      const { rows } = await tx.query<{ status: OrderStatus }>(
        `SELECT status FROM orders WHERE id = $1 FOR UPDATE`,
        [orderId]
      );
      const current = rows[0]?.status;
      if (!current) {
        throw new NotFoundError();
      }
      previousStatus = current;

      if (current === newStatus) {
        throw new RuleError("The order already has that status.");
      }
      if (!ALLOWED[current].includes(newStatus as OrderStatus)) {
        throw new RuleError(
          `Cannot move an order from "${current}" to "${newStatus}". Allowed: ${ALLOWED[current].join(", ") || "none"}.`
        );
      }

      // Cancelling returns reserved stock for every item.
      if (newStatus === "cancelled") {
        const { rows: items } = await tx.query<{
          product_id: string;
          quantity: number;
        }>(
          `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
          [orderId]
        );
        for (const item of items) {
          await tx.query(
            `UPDATE products SET stock = stock + $2, updated_at = now() WHERE id = $1`,
            [item.product_id, item.quantity]
          );
        }
      }

      await tx.query(
        `UPDATE orders SET status = $2, updated_at = now() WHERE id = $1`,
        [orderId, newStatus]
      );

      // Recipient details for the post-commit notification.
      const { rows: customerRows } = await tx.query<{
        email: string | null;
        name: string | null;
        total: string;
      }>(
        `SELECT u.email, u.name, o.total
           FROM orders o LEFT JOIN users u ON u.id = o.user_id
          WHERE o.id = $1`,
        [orderId]
      );
      return customerRows[0];
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    await logAdminActivity({
      adminId: admin.id,
      action: "order.status",
      entityType: "order",
      entityId: orderId,
      detail: `Status: ${previousStatus} → ${newStatus}`,
    });

    // Optional notification — logged on failure, never blocks the update.
    if (customer?.email) {
      const sent = await sendOrderStatusEmail({
        to: customer.email,
        fullName: customer.name ?? "customer",
        orderId,
        status: newStatus,
      });
      if (!sent) {
        console.warn(`[admin] status email not sent for order ${orderId}`);
      }
    }

    return { success: true, message: `Order updated to "${newStatus}".` };
  } catch (error) {
    if (error instanceof RuleError) {
      return { success: false, message: error.message };
    }
    if (error instanceof NotFoundError) {
      return { success: false, message: "Order not found." };
    }
    console.error("[admin] updateOrderStatus:", error);
    return { success: false, message: "Could not update the order status." };
  }
}

class RuleError extends Error {}
class NotFoundError extends Error {}
