# AGENTS.md

Guidance for AI coding agents working on this repository. Read this fully before making changes.

## Project Overview

A full-stack e-commerce storefront. Customers browse products, manage a cart, sign in with Google, check out, and receive an order confirmation email.

**Stack**

| Concern       | Choice                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| Framework     | Next.js 16.3.8 (App Router), TypeScript, React Server Components                                                   |
| Mutations     | Server Actions (no separate backend API)                                                                           |
| Database      | PostgreSQL on Neon (serverless), accessed with `@neondatabase/serverless`                                          |
| Auth          | Auth.js (`next-auth@5`) with the Google provider, using OAuth credentials from Google Cloud Console. JWT sessions. |
| Email         | Mailgun HTTPS API (called from server code only)                                                                   |
| Image uploads | Cloudinary (signed direct uploads from the browser)                                                                |
| Admin charts  | Recharts                                                                                                           |
| Styling       | Tailwind CSS                                                                                                       |

**Explicitly not used:** Supabase (database, auth, or client SDK), Row-Level Security, `auth.users`. Do not add them. All database access happens server-side, and authorization is enforced in application code.

## Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server at http://localhost:3000
npm run build        # production build
npm run lint         # lint
npx tsc --noEmit     # type check
```

Run `npm run lint` and `npx tsc --noEmit` before finishing any task.

## Project Structure

```
app/
  layout.tsx                        # minimal root layout (fonts, providers only)
  (store)/                          # storefront route group (not part of the URL)
    layout.tsx                      # storefront navbar/footer
    page.tsx                        # home
    products/  cart/  checkout/     # storefront pages
  admin/                            # admin section (see "Admin Section")
    layout.tsx                      # admin shell + navigation, calls requireAdmin()
    page.tsx                        # dashboard
    products/                       # list, new, [id]/edit
    orders/                         # list, [id] detail
    users/                          # list
  api/auth/[...nextauth]/route.ts   # Auth.js route handler
  actions/
    checkout.ts                     # checkout Server Action
    admin/                          # admin Server Actions: products.ts, orders.ts, users.ts, uploads.ts
components/
  ui/                               # generic building blocks (buttons, inputs, tables, dialogs)
  store/                            # storefront components (product card, cart, etc.)
  admin/                            # admin components (data tables, forms, charts)
  GoogleAuthButton.tsx              # sign-in button (client component)
lib/
  auth.ts                           # Auth.js config (Google provider, callbacks, requireAdmin())
  db.ts                             # Neon pool + query helpers
  mailgun.ts                        # transactional email
  cloudinary.ts                     # signed upload helper (server-only)
  validations/                      # shared Zod schemas (checkout, product, user)
db/
  schema.sql                        # database schema (source of truth)
public/                             # static assets
middleware.ts                       # redirects non-admins away from /admin/* (convenience only)
```

Structure rules:

- Keep `app/layout.tsx` minimal. Storefront chrome lives in `app/(store)/layout.tsx` and admin chrome in `app/admin/layout.tsx`, so neither inherits the other's navbar.
- Define Zod schemas once in `lib/validations/` and reuse them in forms and Server Actions.
- Put new Server Actions in `app/actions/` (admin ones in `app/actions/admin/`). Do not scatter actions across feature folders.
- Do not create new top-level folders without a reason.

## Environment Variables

Create `.env.local` (never commit it). Provide a `.env.example` with the same keys and empty values.

```env
# Neon
DATABASE_URL=postgresql://user:password@ep-xxxx.pooler.region.neon.tech/neondb?sslmode=require

# Auth.js
AUTH_SECRET=             # generate with: npx auth secret
AUTH_URL=http://localhost:3000
AUTH_GOOGLE_ID=          # Google Cloud Console OAuth client ID
AUTH_GOOGLE_SECRET=      # Google Cloud Console OAuth client secret

# Admin
ADMIN_EMAILS=            # comma-separated Google emails granted the admin role on sign-in

# Cloudinary (product images)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Mailgun
MAILGUN_API_KEY=
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_FROM_EMAIL="Shop <noreply@yourdomain.com>"
MAILGUN_API_BASE=https://api.mailgun.net   # use https://api.eu.mailgun.net for EU-region domains
```

Rules:

- Only variables prefixed `NEXT_PUBLIC_` may reach the browser. Nothing above should be prefixed that way.
- Never log secrets, and never hardcode them.

## Database Schema

Source of truth is `db/schema.sql`. Run it in the Neon SQL Editor.

```sql
create extension if not exists "pgcrypto";

create table users (
    id uuid primary key default gen_random_uuid(),
    google_id text not null unique,
    email text not null unique,
    full_name text,
    avatar_url text,
    role text not null default 'customer' check (role in ('customer', 'admin')),
    is_blocked boolean not null default false,
    created_at timestamptz not null default now()
);

create table products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    price numeric(10, 2) not null check (price >= 0),
    inventory_count integer not null default 0 check (inventory_count >= 0),
    image_url text,
    category text,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

create table orders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete set null,
    total_amount numeric(10, 2) not null check (total_amount >= 0),
    shipping_address text not null,
    customer_email text not null,
    status text not null default 'pending'
        check (status in ('pending', 'processing', 'completed', 'cancelled')),
    created_at timestamptz not null default now()
);

create table order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references orders(id) on delete cascade,
    product_id uuid not null references products(id) on delete restrict,
    quantity integer not null check (quantity > 0),
    price_at_purchase numeric(10, 2) not null check (price_at_purchase >= 0)
);

create index on orders (user_id);
create index on order_items (order_id);
```

Schema rules:

- Schema changes go in `db/schema.sql` (or a new numbered migration file), never applied ad hoc.
- Always store `price_at_purchase` on order items. Never recompute historical totals from current product prices.

## Authentication (Google OAuth via Google Cloud Console)

Setup, done once in the [Google Cloud Console](https://console.cloud.google.com/):

1. Create a project, then go to **APIs & Services > OAuth consent screen**. Choose **External** and fill in the app name and support email.
2. Go to **Credentials > Create Credentials > OAuth client ID** and choose **Web application**.
3. Add **Authorized JavaScript origins**: `http://localhost:3000` and your production origin.
4. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<your-production-domain>/api/auth/callback/google`
5. Copy the Client ID and Client Secret into `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

Implementation notes:

- Configure Auth.js in `lib/auth.ts` with the `Google` provider and `session: { strategy: "jwt" }`.
- In the `signIn` (or `jwt`) callback, upsert the user into the `users` table keyed by `google_id`, and put the internal `users.id` on the token and session.
- Get the current user in server code with `auth()` from `lib/auth.ts`. Never trust a user id sent from the client.
- The sign-in button calls `signIn("google")` from `next-auth/react` (or a Server Action using `signIn` from `lib/auth.ts`).
- Guest checkout is allowed: if there is no session, `orders.user_id` is `null`.

## Code Conventions

- TypeScript strict mode. No `any` unless unavoidable and commented.
- Default to Server Components. Add `'use client'` only for interactivity (cart, forms, buttons).
- Mutations use Server Actions with `'use server'`. Validate all input with Zod before touching the database.
- All SQL uses parameterized queries. Never build SQL with string interpolation.
- Database and Mailgun code is server-only. Import `server-only` at the top of `lib/db.ts` and `lib/mailgun.ts`.
- Escape or sanitize any user-supplied value interpolated into email HTML.
- Keep components small and colocated. Use Tailwind utility classes; avoid inline styles in app UI (emails excepted).

## Checkout Rules (critical)

The checkout Server Action in `app/actions/checkout.ts` must:

1. **Never trust client prices or totals.** The client sends only `{ productId, quantity }[]`. Prices come from the database.
2. **Validate input** (Zod): email format, non-empty name and address, quantities are positive integers, cart is non-empty and bounded in size.
3. **Run everything in one database transaction**: create the order, create order items, and decrement stock.
4. **Decrement stock atomically** and fail if stock is insufficient, using a conditional update:
   ```sql
   update products
   set inventory_count = inventory_count - $1
   where id = $2 and inventory_count >= $1
   returning id;
   ```
   If no row is returned, roll back and report insufficient stock. Do not read stock, compare in JS, then write.
5. **Send the confirmation email after the transaction commits.** If the email fails, log the error and still return success. Never fail an order because of email.
6. Return `{ success: true, orderId }` or `{ success: false, message }`. Never leak raw database errors to the client.

Payments are not implemented yet. When added, orders should stay `pending` until the payment provider confirms via a webhook route handler, and only then move to `processing`.

## Admin Section

A simple admin area at `/admin` for managing products, orders, and users, and for monitoring sales.

### Access control

- Users have `role` (`customer` | `admin`). Emails listed in `ADMIN_EMAILS` get `role = 'admin'` when upserted on sign-in. There is no other way to become admin except an existing admin promoting a user.
- **`requireAdmin()`** (in `lib/auth.ts`) must be the first call in every admin page, layout, and Server Action. It re-reads the role from the database (not just the JWT) and throws or redirects if the user is not an admin.
- `middleware.ts` also redirects non-admins away from `/admin/*`, but that is a convenience only. Never rely on middleware as the sole protection, because Server Actions can be invoked directly.
- Blocked users (`is_blocked = true`) are rejected at sign-in and at checkout.
- An admin cannot block or demote themselves.

### Routes

| Route             | Purpose                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `/admin`          | Dashboard: revenue, order count, customer count, low-stock count, recent orders, 30-day sales chart |
| `/admin/products` | List with search; create, edit, deactivate/reactivate, update stock                                 |
| `/admin/orders`   | List with status/date filters; detail view; change status                                           |
| `/admin/users`    | List with order count and total spent; block/unblock; promote/demote                                |

All admin tables use server-side pagination (`limit`/`offset`). Include loading, empty, and error states.

### Products

- **Soft delete only.** `order_items.product_id` is `on delete restrict`, so "delete" sets `is_active = false`. The storefront must filter on `is_active = true`. Hard delete is allowed only when the product has no order items.
- Validate with Zod on the server: name required, price >= 0, stock a non-negative integer, `image_url` must be on the Cloudinary domain.
- **Image upload flow:** a Server Action (admin-only) returns a signed Cloudinary upload signature; the browser uploads directly to Cloudinary; the returned URL is saved in `products.image_url`. The Cloudinary API secret never reaches the client.

### Orders

- Status moves forward only: `pending` -> `processing` -> `completed`, or to `cancelled` from `pending`/`processing`.
- Cancelling an order **restores stock** for its items, in the same transaction as the status change.
- Optionally email the customer via Mailgun on status change (failures are logged, never block the update).

### Users

- Admins can view customers, block/unblock them, and promote/demote roles. Never expose other users' data outside `/admin`.

### Dashboard metrics

Compute with plain SQL aggregates in server code: revenue and order count (exclude `cancelled`), daily sales for the last 30 days (`date_trunc('day', created_at)`), top products by quantity sold, low stock (`inventory_count <= 5` and `is_active`), and new customers in the last 7/30 days.

## Email (Mailgun)

- Sent via `POST {MAILGUN_API_BASE}/v3/{MAILGUN_DOMAIN}/messages` with Basic auth (`api:<MAILGUN_API_KEY>`), form-encoded body.
- Order confirmation includes: customer name, order id, item summary, and total.
- Use a Mailgun sandbox domain for local development (sandbox domains only deliver to authorized recipients). Use a verified custom domain with DNS records set (TXT, MX, CNAME) in production.
- Keep HTML email markup inline-styled and simple.

## Security Checklist

- No secrets in client bundles, logs, or commits.
- Authorization checks live in server code; every Server Action that reads or writes user data calls `auth()` first.
- Order lookups for a signed-in user must filter by `user_id = session.user.id`.
- Every admin action calls `requireAdmin()` first (see "Admin Section").
- Cloudinary signing and admin mutations are server-side only.
- Rate-limit or otherwise protect checkout and any public Server Action if abuse becomes a concern.

## Definition of Done

- Lint and type check pass.
- `npm run build` succeeds.
- New env vars are added to `.env.example` and documented here.
- Schema changes are reflected in `db/schema.sql`.
- No Supabase imports or references have been introduced.
- Any new admin page or action calls `requireAdmin()`.
