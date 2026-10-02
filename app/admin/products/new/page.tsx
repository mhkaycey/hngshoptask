import Link from "next/link";
import { query } from "@/lib/db";
import ProductForm from "../ProductForm";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const { rows } = await query<{ category: string }>(
    `SELECT DISTINCT category FROM products ORDER BY category`
  );

  return (
    <div>
      <nav className="text-sm text-ink-soft">
        <Link href="/admin/products" className="hover:text-ink">
          ← Back to products
        </Link>
      </nav>
      <h1 className="mb-8 mt-4 text-2xl font-display font-semibold">New product</h1>
      <ProductForm categories={rows.map((r) => r.category)} />
    </div>
  );
}
