import Link from "next/link";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import ProductForm from "../../ProductForm";

export const metadata = { title: "Edit product" };

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = await params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    notFound();
  }

  const [{ rows }, { rows: categoryRows }] = await Promise.all([
    query<{
      id: string;
      name: string;
      description: string | null;
      price: string;
      stock: number;
      category: string;
      image_url: string | null;
    }>(
      `SELECT id, name, description, price, stock, category, image_url
         FROM products WHERE id = $1`,
      [id]
    ),
    query<{ category: string }>(
      `SELECT DISTINCT category FROM products ORDER BY category`
    ),
  ]);

  const product = rows[0];
  if (!product) notFound();

  return (
    <div>
      <nav className="text-sm text-ink-soft">
        <Link href="/admin/products" className="hover:text-ink">
          ← Back to products
        </Link>
      </nav>
      <h1 className="mb-8 mt-4 text-2xl font-display font-semibold">Edit “{product.name}”</h1>
      <ProductForm defaults={product} categories={categoryRows.map((r) => r.category)} />
    </div>
  );
}
