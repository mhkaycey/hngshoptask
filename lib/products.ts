import "server-only";
import { query } from "@/lib/db";
import type { Product } from "@/components/store/ProductCard";

export const PRODUCTS_PER_PAGE = 12;

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const { rows } = await query<Product>(
    `SELECT id, name, description, price, stock, category, image_url
     FROM products
     WHERE is_active = TRUE AND stock > 0
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
}

export async function getCategories(): Promise<string[]> {
  const { rows } = await query<{ category: string }>(
    `SELECT DISTINCT category FROM products WHERE is_active = TRUE ORDER BY category`
  );
  return rows.map((r) => r.category);
}

export async function listProducts(options: {
  search?: string;
  category?: string;
  page?: number;
}): Promise<{ products: Product[]; total: number; totalPages: number }> {
  const page = Math.max(1, options.page ?? 1);
  const search = options.search?.trim();
  const category = options.category?.trim();
  const offset = (page - 1) * PRODUCTS_PER_PAGE;

  const conditions: string[] = ["is_active = TRUE"];
  const params: unknown[] = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`name ILIKE $${params.length}`);
  }
  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }
  const where = conditions.join(" AND ");

  const { rows: countRows } = await query<{ count: string }>(
    `SELECT count(*)::int::text AS count FROM products WHERE ${where}`,
    params
  );
  const total = Number(countRows[0]?.count ?? 0);

  const { rows } = await query<Product>(
    `SELECT id, name, description, price, stock, category, image_url
     FROM products
     WHERE ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, PRODUCTS_PER_PAGE, offset]
  );

  return {
    products: rows,
    total,
    totalPages: Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE)),
  };
}

export async function getProduct(id: string): Promise<Product | null> {
  const { rows } = await query<Product>(
    `SELECT id, name, description, price, stock, category, image_url
     FROM products
     WHERE id = $1 AND is_active = TRUE`,
    [id]
  );
  return rows[0] ?? null;
}
