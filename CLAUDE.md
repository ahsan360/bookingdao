# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**BookEase** — multi-tenant appointment booking SaaS (branded "BookEase" in the UI; package names use `booking-*`). Tenants are identified by **subdomain** (e.g. `salon.bookease.com`); customers book via the tenant's subdomain page, business owners manage from the root domain dashboard. Payments run through **SSLCommerz** (Bangladeshi gateway, BDT currency).

## Stack

- **Backend** ([backend/](backend/)): Node 18+, Express, TypeScript, Prisma + PostgreSQL, JWT auth, `sslcommerz-lts`, AES-256-GCM encryption for stored gateway credentials. Dev server uses `tsx watch`.
- **Frontend** ([frontend/](frontend/)): Next.js 14 App Router, React 18, TailwindCSS, Axios. No state library — auth/i18n live in React context (`localStorage`-hydrated).
- **Deploy** ([deploy/](deploy/)): single VPS + Neon Postgres, Nginx reverse proxy with wildcard subdomain TLS, PM2 ([deploy/ecosystem.config.js](deploy/ecosystem.config.js)). See [deploy/VPS_DEPLOYMENT_GUIDE.md](deploy/VPS_DEPLOYMENT_GUIDE.md).

## Commands

All commands assume you're inside `backend/` or `frontend/` (no root-level workspace).

**Backend** ([backend/package.json](backend/package.json)):
```
npm run dev               # tsx watch src/server.ts → http://localhost:5000
npm run build             # tsc → dist/
npm start                 # node dist/server.js (production)
npm run prisma:migrate    # prisma migrate dev
npm run prisma:generate   # prisma generate
npm run prisma:seed       # tsx prisma/seed.ts
node generate-encryption-key.js   # produce ENCRYPTION_KEY for .env
```

Local Postgres via `docker compose up -d` from [backend/docker-compose.yml](backend/docker-compose.yml) (port 5432, user `booking_user`, db `booking_db`).

**Frontend** ([frontend/package.json](frontend/package.json)):
```
npm run dev               # next dev → http://localhost:3000
npm run build && npm start
npm run lint              # next lint (eslint-config-next)
```

There is **no test runner configured** in either package — don't claim tests pass without adding one. Don't run `npm install` in PowerShell if execution policy is restricted; use `cmd` (see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)).

## Required environment

Backend `.env` (consumed by [backend/src/server.ts](backend/src/server.ts) and services):
- `DATABASE_URL` — Postgres connection string
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `ENCRYPTION_KEY` — 64-hex-char key from `generate-encryption-key.js`; used by [backend/src/utils/encryption.util.ts](backend/src/utils/encryption.util.ts) to encrypt SSLCommerz `storeId`/`storePassword` at rest
- `FRONTEND_URL` — used to build per-tenant URLs (`subdomain` is prepended to the hostname in [backend/src/services/payment.service.ts](backend/src/services/payment.service.ts))
- `PORT`, `NODE_ENV`

Frontend `.env.local`:
- `NEXT_PUBLIC_API_URL` (default `http://localhost:5000/api`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (legacy — README references Stripe but the code uses SSLCommerz)

## Architecture

### Tenant isolation — read this before touching any query

Every domain model except `Plan`/`OtpVerification` has a `tenantId` FK with `onDelete: Cascade` ([backend/prisma/schema.prisma](backend/prisma/schema.prisma)). Tenant context is established in **two different ways** depending on the request:

1. **Authenticated routes (dashboard/admin):** `tenantId` comes from the JWT payload. [backend/src/middleware/auth.middleware.ts](backend/src/middleware/auth.middleware.ts) decodes the token onto `req.user.{userId, tenantId, role}`; [backend/src/middleware/tenant.middleware.ts](backend/src/middleware/tenant.middleware.ts) (`ensureTenantContext` / `getTenantId`) enforces it.
2. **Public booking routes:** `tenantId` is resolved from the **subdomain** by [backend/src/middleware/subdomain.ts](backend/src/middleware/subdomain.ts) (`extractSubdomain`), which runs globally before all routes and sets `req.tenantId` / `req.tenant` if the host's first label matches a `Tenant.subdomain`. It tolerates `localhost` by reading the `Origin`/`Referer` header so frontend dev calls still resolve a tenant. Reserved subdomains (`www`, `api`, `admin`, `app`, `staging`, `dev`, …) are listed in [backend/src/utils/constants.ts](backend/src/utils/constants.ts) — keep that list in sync with the matching one in [frontend/src/middleware.ts](frontend/src/middleware.ts).

When adding queries, **always filter by `tenantId`** — there is no row-level security in the DB, isolation is application-enforced.

### Roles

Two roles: `owner` and `admin` (see [backend/src/middleware/role.middleware.ts](backend/src/middleware/role.middleware.ts)). `requireOwner` gates destructive/billing actions; `requireAdmin` accepts either. The frontend dashboard sidebar mirrors this with `ownerOnly` flags ([frontend/src/app/dashboard/layout.tsx](frontend/src/app/dashboard/layout.tsx)).

### Appointment lifecycle

States are `pending → confirmed → completed`, plus `cancelled` / `expired`. Defined as a `const` enum in [backend/src/utils/constants.ts](backend/src/utils/constants.ts) (`APPOINTMENT_STATUSES`, `BOOKABLE_STATUSES`).

- A booking creates a `pending` appointment with `lockedUntil = now + 10min` (`LOCK_TTL_SECONDS`).
- Slot generation in [backend/src/utils/time-slot.util.ts](backend/src/utils/time-slot.util.ts) (driven by `Schedule` + `ScheduleBreak`) treats `pending` and `confirmed` as **booked** (`BOOKABLE_STATUSES`) so a holding pending booking blocks the slot.
- A cleanup job in [backend/src/server.ts:99-140](backend/src/server.ts#L99-L140) runs every 2 minutes, finds `pending` appointments whose `lockedUntil` has passed, and marks them + their `Payment` rows as `expired` in a single transaction. **There is no Redis or distributed lock** despite older docs referencing `ioredis` — the slot lock is purely the `lockedUntil` timestamp + cleanup loop. Do not reintroduce a Redis dependency without removing the cleanup loop first.

### Payment flow (SSLCommerz)

Each tenant stores their own gateway credentials in `PaymentGatewayConfig`, **encrypted with AES-256-GCM** ([backend/src/utils/encryption.util.ts](backend/src/utils/encryption.util.ts), keyed by `ENCRYPTION_KEY`). [backend/src/services/payment.service.ts](backend/src/services/payment.service.ts) decrypts them per-request via `getTenantGatewayConfig`.

`Tenant.bookingMode` controls the flow:
- `payment_required` — must go through SSLCommerz
- `manual_only` — auto-confirm without gateway (cash/offline)
- `both` — booker chooses; if `manualPayment === true`, skip the gateway

`amount === 0` always short-circuits to manual confirmation. When initializing a real payment, `payment.service.ts` builds `success_url`/`fail_url`/`cancel_url`/`ipn_url` against the **tenant's subdomain frontend** (not the API host) — `getTenantFrontendUrl` rewrites `FRONTEND_URL`'s hostname to `${subdomain}.${hostname}`. The webhook routes (`/api/payments/ipn` raw, `/api/payments/success|fail|cancel` urlencoded) have **dedicated body parsers registered before `express.json()`** in [backend/src/server.ts:50-53](backend/src/server.ts#L50-L53) — preserve that ordering.

### Errors

Throw the typed errors from [backend/src/utils/errors.ts](backend/src/utils/errors.ts) (`NotFoundError`, `ValidationError`, `ConflictError`, `ForbiddenError`, …) inside services/routes; the centralized handler in [backend/src/middleware/error.middleware.ts](backend/src/middleware/error.middleware.ts) translates them and Prisma `P2002`/`P2025` codes into JSON responses. Don't write ad-hoc `res.status(400).json(...)` for the same cases — keep error shape consistent.

### Frontend routing & subdomain rewriting

[frontend/src/middleware.ts](frontend/src/middleware.ts) intercepts every request:
- `bookease.com` / `localhost` / reserved subdomains → pass through (landing, login, dashboard).
- Tenant subdomain (`salon.bookease.com`) → **rewrites internally** to `/book/[subdomain]` ([frontend/src/app/book/[tenantId]/](frontend/src/app/book/%5BtenantId%5D/)). The `[tenantId]` param actually holds the **subdomain string**, not the UUID — backend resolves it via `extractSubdomain`.
- A tenant subdomain hitting `/dashboard|/login|/register|/onboarding|/forgot-password` is **redirected** back to `bookease.com` so auth/management always live on the root domain.

For local subdomain testing, use `*.lvh.me` or `*.localhost` (both resolve to 127.0.0.1) — the middleware's reserved-subdomain check handles `localhost` itself.

### Frontend data layer

[frontend/src/lib/api.ts](frontend/src/lib/api.ts) is a singleton axios instance that auto-attaches the JWT from `localStorage` and globally clears auth + redirects to `/login` on 401. Don't construct ad-hoc `fetch` calls for authenticated API requests — use this client so the 401 handler stays consistent.

Auth state lives in the React context at [frontend/src/lib/auth.tsx](frontend/src/lib/auth.tsx) (provided in [frontend/src/app/providers.tsx](frontend/src/app/providers.tsx)). It hydrates `user`/`tenant`/`token` from `localStorage` on mount; `hasCompletedOnboarding` gates the dashboard against `/onboarding`. i18n (`en`/`bn`) is in [frontend/src/lib/i18n.tsx](frontend/src/lib/i18n.tsx) with locale files in [frontend/src/locales/](frontend/src/locales/).

### Admin surface

Admin routes are split under [backend/src/routes/admin/](backend/src/routes/admin/) (payment-config, page-config, team, audit-log, campaigns, customers, settings) and mirrored under [frontend/src/app/dashboard/](frontend/src/app/dashboard/). Owner-only actions log to `AuditLog` via [backend/src/utils/audit.util.ts](backend/src/utils/audit.util.ts) — when adding owner-only mutations, write an audit entry with `{action, resourceType, resourceId, details}`.

## Conventions

- **Currency is BDT, not USD.** `DEFAULT_CURRENCY = 'BDT'` and SSLCommerz expects BDT. The README's Stripe section is outdated.
- Prices are stored as `Int` (whole BDT units), not decimals.
- Times in `Schedule`/`ScheduleBreak`/`Appointment` are `String` in `HH:mm` 24h format; `appointmentDate` is the date-only `DateTime`. Slot math uses `timeToMinutes`/`minutesToTime` helpers in [backend/src/utils/time-slot.util.ts](backend/src/utils/time-slot.util.ts).
- `dayOfWeek` is `0..6` with `0 = Sunday` (matches JS `Date.getDay()`).
- Rate limits ([backend/src/server.ts:31-46](backend/src/server.ts#L31-L46)): general 100/min, auth 10/15min — auth limiter is mounted only on `/api/auth`.

## Reuse rules — use these helpers, don't reinvent

Before writing new code, check whether one of these abstractions already covers it. Duplicating any of these is a review-blocker.

**Backend:**
- **Errors** — throw `NotFoundError` / `ValidationError` / `ConflictError` / `ForbiddenError` / `UnauthorizedError` / `RateLimitError` from [backend/src/utils/errors.ts](backend/src/utils/errors.ts). Don't write `res.status(4xx).json({error})` in routes — the central handler ([backend/src/middleware/error.middleware.ts](backend/src/middleware/error.middleware.ts)) already formats those + Prisma `P2002`/`P2025`.
- **Tenant ID** — read with `getTenantId(req)` from [backend/src/middleware/tenant.middleware.ts](backend/src/middleware/tenant.middleware.ts), never `req.user!.tenantId`. Gate authenticated tenant routes with `ensureTenantContext`.
- **Roles** — gate with `requireOwner` / `requireAdmin` from [backend/src/middleware/role.middleware.ts](backend/src/middleware/role.middleware.ts); don't inline `if (req.user.role !== 'owner')`.
- **Constants** — status strings, role names, booking modes, lock TTL, currency, defaults all live in [backend/src/utils/constants.ts](backend/src/utils/constants.ts). Don't string-literal `'pending'`, `'owner'`, `'BDT'` — import the const.
- **Slot math** — `generateTimeSlots`, `generateAvailableSlots`, `calculateEndTime`, `deduplicateSlots` in [backend/src/utils/time-slot.util.ts](backend/src/utils/time-slot.util.ts) own all `HH:mm` arithmetic. Don't write `time.split(':')` in a route.
- **Pagination** — `parsePagination` + `buildPaginationMeta` in [backend/src/utils/pagination.util.ts](backend/src/utils/pagination.util.ts). Caps limit at 100, defaults to 20 — keep that contract.
- **Audit** — call `createAuditLog` from [backend/src/utils/audit.util.ts](backend/src/utils/audit.util.ts) for every owner-only mutation (it swallows its own errors so it can never break the main flow — that's intentional, don't "fix" it).
- **Encryption** — `encrypt` / `decrypt` from [backend/src/utils/encryption.util.ts](backend/src/utils/encryption.util.ts) for any new at-rest secret. All ciphertext shares one `ENCRYPTION_KEY` — never roll a per-feature key.
- **Phone** — `normalizePhone`, `isValidBDPhone`, `normalizePhoneOrNull` in [backend/src/utils/phone.util.ts](backend/src/utils/phone.util.ts). Phones are stored normalized (`01XXXXXXXXX`); always normalize before persisting or querying by phone.
- **Prisma client** — import the singleton from [backend/src/lib/prisma.ts](backend/src/lib/prisma.ts); never `new PrismaClient()` in a service.

**Frontend:**
- **HTTP** — use the `api` axios singleton from [frontend/src/lib/api.ts](frontend/src/lib/api.ts) for all authenticated calls. Don't `fetch()` from pages — you'd lose the JWT auto-attach and the global 401 → logout handler.
- **Auth state** — `useAuth()` from [frontend/src/lib/auth.tsx](frontend/src/lib/auth.tsx); don't read `localStorage.token` directly in components.
- **i18n** — `useI18n()` / `t.*` from [frontend/src/lib/i18n.tsx](frontend/src/lib/i18n.tsx); add new strings to both [frontend/src/locales/en.ts](frontend/src/locales/en.ts) and [frontend/src/locales/bn.ts](frontend/src/locales/bn.ts).
- **UI primitives** — [frontend/src/components/Toast.tsx](frontend/src/components/Toast.tsx), [frontend/src/components/ConfirmDialog.tsx](frontend/src/components/ConfirmDialog.tsx), and `ui/{ErrorAlert,LoadingSpinner,Pagination,StatusBadge}` cover the common cases. No `window.alert` / `window.confirm`.

When you find yourself reaching for one of these patterns and the helper doesn't quite fit, **extend the helper** rather than copy-pasting an inline variant. Three near-duplicate inline versions across routes is the failure mode to avoid.

## API security — project-specific risks

Watch these in addition to the obvious OWASP basics. They're the failure modes that actually matter here:

- **Tenant ID must come from a trusted source.** Trusted sources: JWT (`req.user.tenantId` via `getTenantId`) on authenticated routes, subdomain middleware (`req.tenantId`) on public booking routes. **Never** accept `tenantId` from request body, query string, or URL params — that's a cross-tenant takeover. If a route legitimately needs to identify a tenant from the client (e.g. public booking page lookups), accept `subdomain` and resolve via `prisma.tenant.findUnique({ where: { subdomain } })`, never trust a UUID from the wire.
- **Every Prisma query touches `tenantId`.** There is no DB-level row-level security; isolation is entirely application-enforced. A missing `where: { tenantId }` on a `findMany`/`updateMany`/`deleteMany` is a tenant data leak. Treat any new query without `tenantId` in the filter as suspect.
- **Webhook callbacks are untrusted input.** SSLCommerz POSTs to `/api/payments/{ipn,success,fail,cancel}` are reachable by anyone. Don't mutate appointment/payment state from the callback body alone — re-validate via SSLCommerz's validation API (`val_id` lookup) before flipping a payment to `confirmed`. The body parser ordering at [backend/src/server.ts:50-57](backend/src/server.ts#L50-L57) (raw for IPN, urlencoded for success/fail/cancel, JSON last) must stay intact — moving it breaks signature verification.
- **`tran_id` must be unguessable.** Use `uuidv4()` (already the pattern in [backend/src/services/payment.service.ts](backend/src/services/payment.service.ts)); never derive it from `appointmentId` alone. The `idempotencyKey` field on `Payment` exists to dedupe webhook retries — preserve that uniqueness when adding new payment paths.
- **Encrypt new at-rest secrets.** Anything that looks like a credential, API key, or PII you wouldn't want leaked in a DB dump goes through `encrypt()`. Don't add new plaintext columns for sensitive data. The current encrypted fields are `PaymentGatewayConfig.storeId` and `storePassword` — follow that pattern.
- **Don't log decrypted secrets.** No `console.log(config)` after `getTenantGatewayConfig`. No logging JWT tokens, OTP codes, full card numbers, or password hashes. The dev-mode error response at [backend/src/middleware/error.middleware.ts:38-40](backend/src/middleware/error.middleware.ts#L38-L40) leaks `err.message` — that's intentional in `NODE_ENV=development` only; never widen it.
- **CORS is currently `cors()` with defaults (allow all).** Before production, restrict origins to the root domain + `*.bookease.com` regex. The current setting at [backend/src/server.ts:28](backend/src/server.ts#L28) is dev-friendly but unsafe for prod.
- **Rate-limit any new sensitive endpoint.** Auth has its own limiter (10/15min). When you add OTP-send, password-reset, or payment-init endpoints, mount a tight `express-rate-limit` instance — don't rely on the general 100/min limiter alone. OTP rate config lives in `OTP_CONFIG` ([backend/src/utils/constants.ts](backend/src/utils/constants.ts)).
- **Reserved subdomains must be enforced on tenant creation.** A tenant registering `api.bookease.com` or `admin.bookease.com` would shadow real routes. Validate against `RESERVED_SUBDOMAINS` from [backend/src/utils/constants.ts](backend/src/utils/constants.ts) in the registration path, and keep that list in sync with [frontend/src/middleware.ts](frontend/src/middleware.ts).
- **Never return the `password` field.** Prisma returns full rows by default. Use `select` to allow-list, or `omit` the password column on every User read.
- **No raw SQL without parameterization.** Prisma protects against injection automatically; `$queryRaw` / `$executeRaw` does not unless you use the tagged-template form. If you need raw SQL, prefer `Prisma.sql\`...${value}...\`` over string interpolation.
- **JWT scope.** Tokens are stateless and last 7d (`JWT_EXPIRES_IN`) — there's no revocation list. A leaked token is valid until it expires. When introducing a "log out everywhere" / "rotate after password change" feature, you'll need to add a `tokenVersion` column on User and check it in `authenticate`. Don't add token blacklisting in-memory — see scaling note below.
- **File uploads.** The `multer` dep + [backend/uploads/](backend/uploads/) static mount means uploads are user-controllable filenames on disk. Validate MIME + size, generate server-side filenames (UUID), reject path traversal, and **never** serve the upload directory above the size limit defined in `PAGE_CONFIG_DEFAULTS.maxFileSizeMB`.

## Scaling beyond a single instance

The current design assumes **one Node process per service**. The deployment guide ([deploy/VPS_DEPLOYMENT_GUIDE.md](deploy/VPS_DEPLOYMENT_GUIDE.md)) reflects this — single VPS, single PM2 fork. Several pieces will misbehave the moment you run a second backend instance, so when you cross that threshold, fix these before scaling:

- **Appointment cleanup loop** ([backend/src/server.ts:99-140](backend/src/server.ts#L99-L140)) runs in every process. With N instances you get N concurrent `updateMany` calls racing on the same expired rows — Prisma's atomic update keeps it correct, but it's wasteful and noisy. Move to one of:
  1. A dedicated `cleanup` PM2 app (single instance, calls the same function on a timer), or
  2. A Postgres advisory lock (`pg_try_advisory_lock`) wrapping the cleanup so only one instance per tick wins, or
  3. A real job queue (BullMQ + Redis) with a single worker.
- **`express-rate-limit`** uses an in-memory store by default. With N instances, a user gets N× the real rate budget. Switch to `rate-limit-redis` (or the Postgres store) when going multi-instance.
- **File uploads in [backend/uploads/](backend/uploads/)** are local disk. They won't survive a redeploy on a different host and aren't visible to other instances. Move to S3-compatible object storage (or a shared volume) before scaling out — the deploy guide already calls this out as the next step.
- **Subdomain → tenant lookup** in [backend/src/middleware/subdomain.ts](backend/src/middleware/subdomain.ts) hits Postgres on every request. Fine at low traffic; becomes the hot query at scale. When you see it in slow-query logs, cache `subdomain → {id, businessName}` in Redis with a short TTL and bust on tenant update.
- **Slot locking via `lockedUntil`** is **already multi-instance-safe** — it's a DB-level timestamp, not in-memory state. Keep it that way. Don't reintroduce a Redis SETNX lock; the DB transaction is the source of truth.
- **JWT auth** is stateless and scales horizontally as-is. Don't add server-side session storage unless you need revocation (then prefer `tokenVersion` on User over an external blacklist).
- **Prisma connection pooling.** Default pool size is `num_cpus * 2 + 1` per process. With Neon's free-tier connection limit, multi-instance will exhaust the pool before you exhaust traffic — set `?connection_limit=N` in `DATABASE_URL` per instance and consider Neon's PgBouncer endpoint.
- **Cron / scheduled work.** Anything you add as `setInterval` in `server.ts` (notifications, reports, campaign sends, …) will have the same multi-instance problem as the cleanup loop. Default to advisory-lock-guarded or a dedicated worker process from the start.

The rule of thumb: **anything that holds state in-process or runs on a timer is a future scaling bug.** When adding either, leave a `// TODO(multi-instance): …` comment with the migration path so the next person doesn't have to re-derive it.

## Known repo quirks

- Top-level [README.md](README.md) and [TROUBLESHOOTING.md](TROUBLESHOOTING.md) reference **Stripe** and **Redis/ioredis**; both are stale. Current code uses SSLCommerz and the in-process cleanup loop. Trust the code, not the docs.
- The two `package-lock.json` files at the repo root and `backend/`/`frontend/` are independent — there is no monorepo tooling (no workspaces, no Turborepo).
- Backend has loose top-level helper scripts (`check-tenants.ts`, `create-schedule.ts`, `test-schedule.js`, `setup.bat`) that are dev-only utilities, not part of the build.
- Several legacy `.md` files in `backend/` (`FIX_UUID_ERROR.md`, `INSTALL_PACKAGES_NOW.md`, `POWERSHELL_FIX.md`, `QUICK_START.md`) document one-time setup hiccups; don't treat them as current architecture docs.
