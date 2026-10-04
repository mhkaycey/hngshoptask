import "server-only";
import { query, withTransaction } from "@/lib/db";
import { checkoutSchema, type CheckoutResult } from "@/lib/validations/checkout";
import { sendOrderConfirmationEmail } from "@/lib/mailgun";
import { formatCurrency } from "@/lib/format";

export class StockError extends Error {}

type CheckoutServiceInput = {
  fullName: string;
  email: string;
  shippingAddress: string;
  cartItems: { productId: string; quantity: number }[];
};

/**
 * Core checkout pipeline shared by the web Server Action and /api/v1.
 * `userId` comes from the resolved session on the caller side (null = guest).
 * All invariants from AGENTS.md: server-side prices, one transaction,
 * atomic stock decrement, email after commit.
 */
export async function processCheckoutOrder(
  input: CheckoutServiceInput,
  userId: string | null
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid checkout details.",
    };
  }
  const { fullName, email, shippingAddress } = parsed.data;

  try {
    // Blocked signed-in users may not order.
    if (userId) {
      const { rows } = await query<{ is_blocked: boolean }>(
        `SELECT is_blocked FROM users WHERE id = $1`,
        [userId]
      );
      if (rows[0]?.is_blocked) {
        return { success: false, message: "Your account cannot place orders." };
      }
    }

    const { orderId, total, lines } = await withTransaction(async (tx) => {
      let totalCents = 0;
      const lines: {
        productId: string;
        name: string;
        quantity: number;
        unitPrice: string;
      }[] = [];

      // Re-read prices from the database (never trust client prices).
      for (const item of parsed.data.cartItems) {
        const { rows } = await tx.query<{
          id: string;
          name: string;
          price: string;
          is_active: boolean;
        }>(
          `SELECT id, name, price, is_active FROM products WHERE id = $1 FOR UPDATE`,
          [item.productId]
        );
        const product = rows[0];
        if (!product || !product.is_active) {
          throw new StockError(`A product in your cart is no longer available.`);
        }
        totalCents += Math.round(Number(product.price) * 100) * item.quantity;
        lines.push({
          productId: product.id,
          name: product.name,
          quantity: item.quantity,
          unitPrice: product.price,
        });
      }

      const { rows: orderRows } = await tx.query<{ id: string }>(
        `INSERT INTO orders (user_id, status, total, shipping_address)
         VALUES ($1, 'pending', $2, $3)
         RETURNING id`,
        [userId, (totalCents / 100).toFixed(2), shippingAddress]
      );
      const newOrderId = orderRows[0].id;

      for (const line of lines) {
        // Atomic conditional decrement — fails if stock is insufficient.
        const { rowCount } = await tx.query(
          `UPDATE products
             SET stock = stock - $2, updated_at = now()
           WHERE id = $1 AND is_active = TRUE AND stock >= $2`,
          [line.productId, line.quantity]
        );
        if (rowCount !== 1) {
          throw new StockError(
            "Insufficient stock for one or more items. Your order was not placed."
          );
        }

        await tx.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
           VALUES ($1, $2, $3, $4)`,
          [newOrderId, line.productId, line.quantity, line.unitPrice]
        );
      }

      return { orderId: newOrderId, total: (totalCents / 100).toFixed(2), lines };
    });

    // Email AFTER commit — failure is logged, never fails the order.
    const sent = await sendOrderConfirmationEmail({
      to: email,
      fullName,
      orderId,
      total: formatCurrency(total),
      items: lines.map((line) => ({
        name: line.name,
        quantity: line.quantity,
        price: formatCurrency(
          (Number(line.unitPrice) * line.quantity).toFixed(2)
        ),
      })),
    });
    if (!sent) {
      console.warn(`[checkout] confirmation email not sent for order ${orderId}`);
    }

    return { success: true, orderId };
  } catch (error) {
    if (error instanceof StockError) {
      return { success: false, message: error.message };
    }
    console.error("[checkout] failed:", error);
    return {
      success: false,
      message: "Something went wrong placing your order. Please try again.",
    };
  }
}
