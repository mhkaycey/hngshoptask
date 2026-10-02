# Known Bugs & Pending Fixes

Last reviewed: 2026-10-01

## 1. Guest email is not persisted on orders

- **Where:** `db/schema.sql` (`orders` table), `app/actions/checkout.ts`
- **What:** The checkout form collects an email and uses it to send the confirmation, but the `orders` table has no `customer_email` column, so the email is discarded after checkout. The spec in `AGENTS.md` requires `orders.customer_email NOT NULL`.
- **Impact:** Admin order list/detail shows "Guest —" for guest orders; admins cannot contact guest customers; the new admin order search cannot find guest orders by email; status-change emails are only sent for signed-in customers (`updateOrderStatus` reads the email from the `users` join).
- **Fix:** Add `customer_email TEXT NOT NULL` to `orders` (migration + `db/schema.sql`), write it in the checkout insert, read it in `lib/adminOrders.ts`, and fall back to it for status emails.

## 2. `admin_activity` table not yet applied to the database

- **Where:** `db/schema.sql` (new block at the bottom)
- **What:** The activity-log feature is fully wired in code, but the table only exists in the schema file. It must be run once in the Neon SQL editor.
- **Impact:** Dashboard shows "No admin activity recorded yet" and every admin action logs a warning instead of an audit row. Nothing crashes (both paths are guarded).
- **Fix:** Run the `CREATE TABLE admin_activity ...` + index statements from `db/schema.sql` against Neon.

## 3. Schema/spec drift between `AGENTS.md` and the actual schema

- **Where:** `AGENTS.md` vs `db/schema.sql`
- **What:** The documented schema says roles are `customer | admin` and order items store `price_at_purchase`; the real schema uses `user | admin` and `unit_price` (+ generated `subtotal`). Code follows the real schema, so it works, but the docs mislead contributors (and the storefront status timeline relies on statuses that only exist in one of the two).
- **Impact:** Confusion for anyone (human or agent) working from `AGENTS.md`; future code written against the documented schema will fail.
- **Fix:** Reconcile `AGENTS.md` with `db/schema.sql` (or vice versa) in one pass.

## 4. Cart stock can go stale between add-to-cart and checkout

- **Where:** `components/cart/CartProvider.tsx`, `app/(store)/checkout/CheckoutForm.tsx`
- **What:** Stock is snapshotted into localStorage when an item is added and never re-validated before the checkout page renders. The server correctly rejects insufficient stock atomically, so no overselling is possible.
- **Impact:** UX only — the shopper can fill the whole form and only learn at submit time that an item sold out.
- **Fix:** Add a lightweight server action that validates `{ productId, quantity }[]` against current stock and shows a warning banner on the cart/checkout pages when items changed.

## 5. Blocked-user check at checkout only covers signed-in users

- **Where:** `app/actions/checkout.ts`
- **What:** Checkout checks `users.is_blocked` for the session user, which is correct per spec. Guest checkout cannot be blocked this way (by design), but there is also no rate limiting on the public checkout action.
- **Impact:** A determined guest can spam checkout (each failed attempt still burns nothing, but successful ones create real orders/emails).
- **Fix:** Add rate limiting on the checkout Server Action (per IP or per email), as the spec's security checklist already suggests.

## 6. Status-change email failures are invisible to admins

- **Where:** `app/actions/admin/orders.ts`
- **What:** When the Mailgun status email fails, the action still succeeds (per spec) and only logs a `console.warn`. The admin UI gives no signal the customer was not notified.
- **Impact:** Admins believe the customer was informed when they were not.
- **Fix:** Record email delivery status (e.g. in the activity log detail or an `email_sent` flag on orders) and surface it in the admin order detail.

## Recently fixed (for reference)

- Admin order-search count query was missing the `LEFT JOIN users` needed by the email/name filter — searching by a non-UUID term threw a SQL error. Fixed in `lib/adminOrders.ts`.
- Storefront order badge palette used statuses (`paid`, `shipped`, `delivered`) that don't exist in the schema. Fixed in `app/(store)/account/orders/page.tsx`.
