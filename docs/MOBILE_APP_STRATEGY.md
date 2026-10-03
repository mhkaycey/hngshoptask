# Mobile App Strategy — Recommendations (No Code Changed)

**Date:** 2026-10-03
**Status:** Proposal only. Nothing in the codebase has been modified.

---

## 1. Current State Assessment

### What exists today

| Layer | Current implementation | Reusable by a mobile app? |
| --- | --- | --- |
| Mutations | Next.js **Server Actions** (`app/actions/checkout.ts`, `wishlist.ts`, `reviews.ts`, `support.ts`, `admin/*`) | **No** — Server Actions are a React/web-only RPC mechanism. They cannot be called from native iOS/Android. |
| Read paths | React Server Components fetching directly via `lib/db.ts` (Neon pool) | **No** — data fetching is embedded in page components, not exposed over HTTP. |
| Auth | Auth.js (`next-auth@5`) Google OAuth, JWT sessions, cookie-based | **Partially** — the Google OAuth flow can be reused, but the cookie/JWT session strategy does not translate directly to native apps. |
| Validation | Zod schemas in `lib/validations/` | **Yes** — Zod schemas can be shared as-is if the mobile app is JS-based, and they define the contract for the new API. |
| DB / schema | PostgreSQL on Neon, `db/schema.sql` as source of truth, parameterized queries in `lib/db.ts` | **Yes** — the database and query logic are the genuinely shared assets. |
| Email / uploads | Mailgun (server-only), Cloudinary signed uploads | **Yes** — both already work over plain HTTPS APIs. |

### The core problem

**There is no "same API endpoint" to build on yet.** The backend logic exists, but it is locked inside Server Actions and Server Components. A mobile client needs a versioned HTTP JSON API.

---

## 2. Recommended Architecture

### Phase 1 — Extract a REST API inside this same Next.js project

Next.js App Router already supports Route Handlers (`app/api/**/route.ts`). Build the HTTP layer here first; the web app and the mobile app then consume the same endpoints.

```
app/api/v1/
  auth/            # session / me / token exchange
  products/        # GET list (filters, pagination), GET :id
  cart or orders/  # POST checkout, GET orders (same rules as app/actions/checkout.ts)
  reviews/         # GET/POST (port of app/actions/reviews.ts)
  wishlist/        # GET/POST/DELETE (port of app/actions/wishlist.ts)
  support/         # POST (port of app/actions/support.ts)
  admin/...        # admin-only endpoints, guarded by requireAdmin()
```

Rules to carry over (from AGENTS.md):

- Reuse the Zod schemas in `lib/validations/` for request validation.
- Keep all checkout invariants: server-side prices, one transaction, atomic stock decrement, email after commit.
- Every endpoint re-checks auth via `auth()` / `requireAdmin()`; never trust client identity.
- Return `{ success, data | message }` shapes; never leak raw DB errors.
- Add rate limiting on public endpoints (checkout especially) once they are network-exposed.

**Why this approach:** zero new infrastructure, one deployable, one database, and the web app's Server Actions can internally call the same service functions the route handlers call (put shared logic in e.g. `lib/services/` rather than duplicating SQL).

### Phase 2 — Mobile client

Recommended stack, in order of preference for this team (TypeScript/React already in use):

| Option | Stack | Pros | Cons |
| --- | --- | --- | --- |
| **A (recommended)** | **React Native (Expo)** + TypeScript + Tailwind (NativeWind) + TanStack Query | Same language, same Zod schemas, same mental model as the Next.js app; Expo handles builds/OTA updates; one codebase for iOS + Android | Native performance ceiling is fine for e-commerce but not game-level |
| B | Flutter + Dart | Excellent UI consistency | Dart codebase = no schema/logic reuse, second team skillset |
| C | Native (Swift + Kotlin) | Best platform integration | Two codebases, highest cost; not justified for this feature set |

Supporting libraries for Option A:

- **expo-auth-session / `expo-web-browser`** with Google OAuth against the same Google Cloud client (add mobile redirect URIs/schemes).
- **TanStack Query** for data fetching/caching against `/api/v1`.
- **Cloudinary direct uploads** work unchanged from React Native.
- Payments later: Paystack/Flutterwave/Stripe mobile SDKs posting to a webhook that moves orders from `pending` to `processing` (as AGENTS.md already prescribes).

### Auth strategy for mobile

Two viable patterns:

1. **Same cookie session** (simplest): the mobile app uses the Google OAuth flow and stores the session cookie in a secure store (Keychain/Keystore via `expo-secure-store`). Works, but cookies in native apps are fiddly.
2. **Token exchange (recommended)**: mobile app completes Google OAuth, sends the Google ID token to `POST /api/v1/auth/google`, the server verifies it against the same `users` table and returns the Auth.js JWT. Store the token securely; refresh as needed. This reuses the existing user upsert logic keyed by `google_id`.

---

## 3. Repo & Delivery Options

| Option | Description | Verdict |
| --- | --- | --- |
| Monorepo (recommended) | `apps/web` (this Next.js app) + `apps/mobile` (Expo) with a shared `packages/validations` (Zod) — pnpm/bun workspaces | Best sharing; some restructuring cost |
| Same repo, separate folder | Keep Next.js at root, add `mobile/` | Cheapest start; sharing limited to copy-paste |
| Separate repo | New mobile repo hitting the deployed API | Fine if a different team owns mobile; lose schema sharing |

If restructuring the existing repo is risky right now, start with `mobile/` in this repo and move to a monorepo later.

---

## 4. Suggested Roadmap

1. **API layer** — create `lib/services/` with the business logic extracted from Server Actions; add `app/api/v1/**` route handlers on top; keep existing Server Actions as thin wrappers so the web app does not regress.
2. **Auth for mobile** — add `POST /api/v1/auth/google` token-exchange endpoint; add mobile redirect URI to the Google OAuth client.
3. **Hardening** — rate limiting, request logging, API versioning discipline, OpenAPI spec (optional, via `zod-to-openapi`) so the mobile team has a contract.
4. **Mobile scaffold** — Expo app, TanStack Query, secure token storage, product list/detail, cart, checkout against `/api/v1`.
5. **Later** — push notifications (Expo Notifications), deep links, payments webhook, admin stays web-only (optional native later).

---

## 5. Key Risks / Decisions Needed

- **"Same API endpoint" is not possible today** — Phase 1 (extracting route handlers) is a prerequisite, not optional.
- Server Actions must keep working for the web app during migration; wrap shared services rather than rewriting pages.
- CORS configuration will be needed for any non-same-origin web client (native apps don't need CORS, but the policy should be explicit).
- Decide monorepo vs subfolder before scaffolding mobile.
- Blocked-user and admin rules must be enforced in the new API endpoints exactly as in the Server Actions, since mobile clients will hit them directly.
