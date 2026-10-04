/**
 * Thin HTTP client for the shop's /api/v1 endpoints.
 * The bearer token is issued by POST /api/v1/auth/google and stored
 * in the device keychain (see lib/auth.ts).
 */
import { getAuthToken, setAuthToken, clearAuthToken } from "./auth";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; status: number };

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<ApiResult<T>> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  let body: { success?: boolean; message?: string; data?: T } | null = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok || !body?.success) {
    if (res.status === 401) await clearAuthToken();
    return {
      success: false,
      message: body?.message ?? `Request failed (${res.status}).`,
      status: res.status,
    };
  }
  return { success: true, data: body.data as T };
}

export const api = {
  request,
  setAuthToken,
  clearAuthToken,
};

// ---- Typed endpoint helpers ----

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  category: string | null;
  image_url: string | null;
};

export type Review = {
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string | null;
};

export function listProducts(params: { search?: string; category?: string; page?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.category) qs.set("category", params.category);
  if (params.page) qs.set("page", String(params.page));
  const suffix = qs.toString() ? `?${qs}` : "";
  return request<{
    products: Product[];
    total: number;
    totalPages: number;
    categories: string[];
  }>(`/api/v1/products${suffix}`);
}

export function getProduct(id: string) {
  return request<{
    product: Product;
    reviews: Review[];
    stats: { average: number; count: number };
  }>(`/api/v1/products/${id}`);
}

export function submitReview(productId: string, rating: number, comment: string) {
  return request<unknown>(`/api/v1/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify({ rating, comment }),
  });
}

export function wishlist() {
  return request<{ items: Product[] }>("/api/v1/wishlist");
}

export function addToWishlist(productId: string) {
  return request<{ inWishlist: boolean }>("/api/v1/wishlist", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
}

export function removeFromWishlist(productId: string) {
  return request<{ inWishlist: boolean }>(
    `/api/v1/wishlist?productId=${encodeURIComponent(productId)}`,
    { method: "DELETE" }
  );
}

export function checkout(input: {
  fullName: string;
  email: string;
  shippingAddress: string;
  cartItems: { productId: string; quantity: number }[];
}) {
  return request<{ orderId: string }>("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type OrderSummary = {
  id: string;
  status: string;
  total: string;
  created_at: string;
  item_count: string;
};

export function listOrders() {
  return request<{ orders: OrderSummary[] }>("/api/v1/orders");
}

export function exchangeGoogleToken(idToken: string) {
  return request<{
    token: string;
    expiresIn: number;
    user: { id: string; email: string; name: string | null; avatarUrl: string | null };
  }>("/api/v1/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

export function getSession() {
  return request<{
    user: { id: string; role: string; email: string; name: string | null };
  }>("/api/v1/auth/session");
}
