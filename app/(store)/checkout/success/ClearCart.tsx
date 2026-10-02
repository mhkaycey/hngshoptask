"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";

/** Clears the cart once, after the success page has mounted. */
export default function ClearCart() {
  const { clear, loaded, items } = useCart();

  useEffect(() => {
    if (loaded && items.length > 0) {
      clear();
    }
  }, [loaded, items.length, clear]);

  return null;
}
