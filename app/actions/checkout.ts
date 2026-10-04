"use server";

import { auth } from "@/lib/auth";
import { processCheckoutOrder } from "@/lib/services/checkout";
import type { CheckoutResult } from "@/lib/validations/checkout";

type CartItemInput = { productId: string; quantity: number };

/** Web Server Action — thin wrapper over the shared checkout service. */
export async function processCheckout(
  formData: FormData,
  cartItems: CartItemInput[]
): Promise<CheckoutResult> {
  const session = await auth();
  return processCheckoutOrder(
    {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      shippingAddress: String(formData.get("shippingAddress") ?? ""),
      cartItems,
    },
    session?.user?.id ?? null
  );
}
