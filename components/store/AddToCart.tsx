"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/cart/CartProvider";

export default function AddToCart({
  productId,
  name,
  price,
  image,
  stock,
}: {
  productId: string;
  name: string;
  price: string;
  image: string | null;
  stock: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const outOfStock = stock <= 0;
  const max = Math.min(stock, 10);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex h-10 items-center rounded-full border border-ink/20 bg-parchment">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={outOfStock}
          className="h-full w-10 text-lg disabled:text-ink/25"
        >
          −
        </button>
        <span className="w-10 text-center font-mono text-sm font-semibold">{quantity}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => setQuantity((q) => Math.min(max, q + 1))}
          disabled={outOfStock}
          className="h-full w-10 text-lg disabled:text-ink/25"
        >
          +
        </button>
      </div>

      <Button
        className="flex-1 sm:flex-none sm:px-10"
        disabled={outOfStock}
        onClick={() => {
          addItem({ productId, name, price, image, stock }, quantity);
          setAdded(true);
          window.setTimeout(() => setAdded(false), 2500);
        }}
      >
        {outOfStock ? "Out of stock" : added ? "✓ Added to cart" : "Add to cart"}
      </Button>
    </div>
  );
}
