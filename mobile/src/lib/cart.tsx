/** Simple in-memory cart, persisted to AsyncStorage. */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Product } from "./api";

export type CartItem = {
  productId: string;
  name: string;
  price: string;
  image_url: string | null;
  quantity: number;
  stock: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "hngshop.cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setItems(JSON.parse(raw));
        } catch {}
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const total = items.reduce(
      (sum, i) => sum + Number(i.price) * i.quantity,
      0
    );
    return {
      items,
      itemCount,
      total,
      addItem(product, quantity = 1) {
        setItems((prev) => {
          const existing = prev.find((i) => i.productId === product.id);
          if (existing) {
            return prev.map((i) =>
              i.productId === product.id
                ? { ...i, quantity: Math.min(i.quantity + quantity, Math.min(product.stock, 10)) }
                : i
            );
          }
          return [
            ...prev,
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              image_url: product.image_url,
              quantity: Math.min(quantity, Math.min(product.stock, 10)),
              stock: product.stock,
            },
          ];
        });
      },
      setQuantity(productId, quantity) {
        setItems((prev) =>
          quantity <= 0
            ? prev.filter((i) => i.productId !== productId)
            : prev.map((i) =>
                i.productId === productId
                  ? { ...i, quantity: Math.min(quantity, Math.min(i.stock, 10)) }
                  : i
              )
        );
      },
      removeItem(productId) {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
      },
      clear() {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
