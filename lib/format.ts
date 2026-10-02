/** Currency used for all storefront price display. */
export const CURRENCY = "USD";

export function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY,
  }).format(typeof amount === "string" ? Number(amount) : amount);
}
