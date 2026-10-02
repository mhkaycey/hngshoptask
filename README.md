# hngshop

A full-stack e-commerce storefront and admin panel built with Next.js 16 (App Router), Postgres (Neon), Auth.js v5, Cloudinary, and Mailgun — no ORM, just parameterized SQL.

## Features

### Storefront
- Home page with hero and featured products
- Product listing with name search, category filter, and pagination (server-rendered)
- Product detail pages with stock status and quantity selector
- Cart (React context + localStorage, stock-capped quantities, hydration-safe)
- Checkout with Zod-validated input, guest checkout supported
  - prices are **always re-read from the database** at order time
  - order + items + stock decrement happen in a single transaction
  - stock decrements use atomic conditional updates (`WHERE stock >= qty`)
  - confirmation email is sent after commit; email failure never fails the order
- Order history at `/account/orders` (scoped by session user id — one user can never open another's order)
- Google sign-in; blocked users are rejected at sign-in, checkout, and admin

### Admin (`/admin`, admin role only)
- Dashboard: revenue/orders/customers/low-stock stat cards, 30-day sales chart (Recharts, zero-filled days), top products, recent orders, low-stock list
- Products: search + pagination, create/edit with direct-to-Cloudinary signed image uploads, activate/deactivate (soft delete), stock updates, hard delete only when no order history
- Orders: filter by status/date range, detail view with price-at-purchase, status transitions (`pending → processing → completed`, cancel from pending/processing with stock restored in the same transaction)
- Users: search, order count and total spent (excl. cancelled), block/unblock and role changes — admins cannot block or demote themselves
- Every admin page and Server Action calls `requireAdmin()`, which re-reads `role`/`is_blocked` from the database; `proxy.ts` adds a convenience-only redirect on top

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions, Proxy) + React 19 + Tailwind CSS 4
- [Auth.js v5](https://authjs.dev) with Google provider + JWT sessions
- [Neon](https://neon.tech) Postgres via `@neondatabase/serverless` (no ORM)
- [Zod](https://zod.dev) for input validation
- [Cloudinary](https://cloudinary.com) for image uploads (signed server-side, uploaded browser-side)
- [Mailgun](https://mailgun.com) for transactional email
- [Recharts](https://recharts.org) for the sales chart

## Local setup

### 1. Clone and install

```bash
git clone <your-repo-url> hngshop && cd hngshop
npm install
```

### 2. Create a Neon database

1. Sign up at [neon.tech](https://neon.tech) and create a project
2. Copy the connection string from the dashboard (**Connect → Connection string**)

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local` (never commit it):

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Neon connection string (`...?sslmode=require`) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | `true` for local dev |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth client (below) |
| `ADMIN_EMAILS` | Comma-separated emails promoted to admin |
| `MAILGUN_*` | Mailgun sandbox (below) |
| `CLOUDINARY_*` | Cloudinary (below) |

### 4. Create the schema and seed data

```bash
npm run db:migrate   # db/schema.sql only
npm run db:seed      # schema + 10 sample products
```

### 5. Configure Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials → Create credentials → OAuth client ID** (Web application)
2. **Authorized JavaScript origins:** `http://localhost:3000`
3. **Authorized redirect URIs:** `http://localhost:3000/api/auth/callback/google`
   (add the same path with your port if Next starts on 3001, and `http://127.0.0.1:3000/...` if you browse that way)
4. Copy the client ID/secret into `.env.local`

### 6. Configure Mailgun (sandbox for local testing)

1. Sign up at [mailgun.com](https://app.mailgun.com) → your sandbox domain (`sandbox-xxxx.mailgun.org`)
2. Copy the API key and set `MAILGUN_DOMAIN` / `MAILGUN_API_KEY` / `MAILGUN_FROM`
3. Under **Authorized Recipients**, add and verify your own email — sandbox domains **only deliver to verified recipients**
4. EU accounts: `MAILGUN_API_BASE=https://api.eu.mailgun.net/v3`

### 7. Configure Cloudinary

1. Cloudinary dashboard → **Settings → Access Keys**: copy `Cloud name`, `API key`, `API secret`
2. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (`CLOUDINARY_FOLDER` defaults to `hngshop`)

No upload preset is needed — admin uploads are signed server-side and sent directly from the browser.

### 8. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Making yourself an admin

Put your Google account email in `ADMIN_EMAILS`:

```
ADMIN_EMAILS=you@gmail.com,someone.else@gmail.com
```

Then sign in with Google — matching users are promoted to `admin` on every sign-in (case-insensitive). Note: a demoted admin whose email stays in this list will be re-promoted on their next sign-in, so remove the email to make a demotion stick.

## Project structure

```
app/
  (store)/            # storefront: home, products, cart, checkout, account
    layout.tsx        # CartProvider + navbar (storefront chrome only)
  (auth)/
    admin/login/      # credentials login for admins
  admin/              # admin panel (requireAdmin in layout + every action)
    orders/ products/ users/
  actions/
    checkout.ts       # processCheckout: one transaction, DB prices, mail after commit
    admin/            # products, orders, users, uploads — all requireAdmin
  api/auth/[...nextauth]/
components/
  ui/                 # Button, Input
  store/ cart/ admin/ # storefront & admin building blocks
db/
  schema.sql          # users, products, orders, order_items + indexes
  seed.sql            # 10 sample products
lib/
  db.ts               # Neon pool, query(), withTransaction()
  auth.ts             # Auth.js config, handlers, requireAdmin()
  products.ts orders.ts admin*.ts   # parameterized SQL queries
  cloudinary.ts       # signed upload signatures
  mailgun.ts          # confirmation/status emails (failures logged, never thrown)
  validations/        # Zod schemas (checkout, product, ids)
scripts/
  migrate.ts          # db:migrate / db:seed
proxy.ts              # optimistic /admin/* redirect (convenience only)
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply `db/schema.sql` |
| `npm run db:seed` | Apply schema + seed products |

## Security notes

- All SQL is parameterized; no user input is ever interpolated into queries
- Prices/totals/user ids/roles are never trusted from the client — checkout re-reads prices with `SELECT … FOR UPDATE` and computes totals server-side
- Every admin Server Action calls `requireAdmin()` (DB-verified role + not blocked)
- Product image URLs must belong to the app's own Cloudinary account
- Raw errors are never leaked to clients; Server Actions return friendly messages and log details server-side
