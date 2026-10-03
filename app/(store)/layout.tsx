import Navbar from "@/components/Navbar";
import { CartProvider } from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import StoreFooter from "@/components/store/StoreFooter";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        {children}
        <StoreFooter />
      </div>
      <CartDrawer />
    </CartProvider>
  );
}
