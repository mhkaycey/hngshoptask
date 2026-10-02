"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import {
  productSchema,
  stockUpdateSchema,
  type ProductActionResult,
} from "@/lib/validations/product";
import { isCloudinaryUrl } from "@/lib/cloudinary";
import { isUuid } from "@/lib/validations/ids";
import { logAdminActivity } from "@/lib/adminActivity";

type ProductResult =
  | { success: true; id?: string; message?: string }
  | { success: false; message: string };

function parseProduct(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    stock: formData.get("stock"),
    category: formData.get("category"),
    image_url: formData.get("image_url") ?? "",
  });
}

function revalidateProductPages(id?: string) {
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/products");
  if (id) revalidatePath(`/products/${id}`);
}

export async function createProduct(
  formData: FormData
): Promise<ProductResult> {
  const admin = await requireAdmin();

  const parsed = parseProduct(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid product data." };
  }
  const { name, description, price, stock, category } = parsed.data;
  const image_url = parsed.data.image_url || null;

  if (image_url && !isCloudinaryUrl(image_url)) {
    return { success: false, message: "Image must be hosted on our Cloudinary account." };
  }

  try {
    const { rows } = await query<{ id: string }>(
      `INSERT INTO products (name, description, price, stock, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [name, description || null, price.toFixed(2), stock, category, image_url]
    );
    revalidateProductPages(rows[0].id);
    await logAdminActivity({
      adminId: admin.id,
      action: "product.create",
      entityType: "product",
      entityId: rows[0].id,
      detail: `Created product "${name}"`,
    });
    return { success: true, id: rows[0].id };
  } catch (error) {
    console.error("[admin] createProduct:", error);
    return { success: false, message: "Could not create the product." };
  }
}

export async function updateProduct(
  id: string,
  formData: FormData
): Promise<ProductResult> {
  const admin = await requireAdmin();

  if (!isUuid(id)) {
    return { success: false, message: "Invalid product id." };
  }

  const parsed = parseProduct(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid product data." };
  }
  const { name, description, price, stock, category } = parsed.data;
  const image_url = parsed.data.image_url || null;

  if (image_url && !isCloudinaryUrl(image_url)) {
    return { success: false, message: "Image must be hosted on our Cloudinary account." };
  }

  try {
    const { rowCount } = await query(
      `UPDATE products
         SET name = $2, description = $3, price = $4, stock = $5,
             category = $6, image_url = $7, updated_at = now()
       WHERE id = $1`,
      [id, name, description || null, price.toFixed(2), stock, category, image_url]
    );
    if (rowCount !== 1) {
      return { success: false, message: "Product not found." };
    }
    revalidateProductPages(id);
    await logAdminActivity({
      adminId: admin.id,
      action: "product.update",
      entityType: "product",
      entityId: id,
      detail: `Updated product "${name}"`,
    });
    return { success: true };
  } catch (error) {
    console.error("[admin] updateProduct:", error);
    return { success: false, message: "Could not update the product." };
  }
}

/** Soft delete — products with order history are deactivated, never removed. */
export async function setProductActive(
  id: string,
  active: boolean
): Promise<ProductActionResult> {
  const admin = await requireAdmin();

  if (!isUuid(id)) {
    return { success: false, message: "Invalid product id." };
  }

  try {
    const { rowCount } = await query(
      `UPDATE products SET is_active = $2, updated_at = now() WHERE id = $1`,
      [id, active]
    );
    if (rowCount !== 1) {
      return { success: false, message: "Product not found." };
    }
    revalidateProductPages(id);
    await logAdminActivity({
      adminId: admin.id,
      action: active ? "product.activate" : "product.deactivate",
      entityType: "product",
      entityId: id,
      detail: active ? "Reactivated product" : "Deactivated product",
    });
    return {
      success: true,
      message: active ? "Product reactivated." : "Product deactivated.",
    };
  } catch (error) {
    console.error("[admin] setProductActive:", error);
    return { success: false, message: "Could not update the product status." };
  }
}

export async function updateStock(
  id: string,
  stock: number
): Promise<ProductActionResult> {
  const admin = await requireAdmin();

  const parsed = stockUpdateSchema.safeParse({ id, stock });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid stock value." };
  }

  try {
    const { rowCount } = await query(
      `UPDATE products SET stock = $2, updated_at = now() WHERE id = $1`,
      [id, parsed.data.stock]
    );
    if (rowCount !== 1) {
      return { success: false, message: "Product not found." };
    }
    revalidateProductPages(id);
    await logAdminActivity({
      adminId: admin.id,
      action: "product.stock",
      entityType: "product",
      entityId: id,
      detail: `Set stock to ${parsed.data.stock}`,
    });
    return { success: true, message: "Stock updated." };
  } catch (error) {
    console.error("[admin] updateStock:", error);
    return { success: false, message: "Could not update stock." };
  }
}

/** Hard delete — allowed only when the product has no order history. */
export async function deleteProduct(id: string): Promise<ProductActionResult> {
  const admin = await requireAdmin();

  if (!isUuid(id)) {
    return { success: false, message: "Invalid product id." };
  }

  try {
    const { rows } = await query<{ order_count: string }>(
      `SELECT count(*)::int::text AS order_count FROM order_items WHERE product_id = $1`,
      [id]
    );
    if (Number(rows[0]?.order_count ?? 0) > 0) {
      return {
        success: false,
        message: "This product has orders and cannot be deleted. Deactivate it instead.",
      };
    }

    const { rowCount } = await query(`DELETE FROM products WHERE id = $1`, [id]);
    if (rowCount !== 1) {
      return { success: false, message: "Product not found." };
    }
    revalidateProductPages(id);
    await logAdminActivity({
      adminId: admin.id,
      action: "product.delete",
      entityType: "product",
      entityId: id,
      detail: "Hard-deleted product (no order history)",
    });
    return { success: true, message: "Product deleted." };
  } catch (error) {
    console.error("[admin] deleteProduct:", error);
    return { success: false, message: "Could not delete the product." };
  }
}
