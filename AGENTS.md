# AGENTS.md

## Stack

Nuxt 4 + Nuxt UI v4 + Tailwind v4. Drizzle ORM on PostgreSQL (via NuxtHub). Redis-backed NuxtHub KV. Auth via `@onmax/nuxt-better-auth` (Better Auth). Client state via VueUse `useLocalStorage` + per-feature composables under `app/composables/` (cart, wallet bridge). There is **no Pinia** in this repo. See `package.json`, `nuxt.config.ts`, and `DESIGN.md` (visual spec — read before any UI work). The active roadmap lives in `PLAN.md`.

## First-time setup

```bash
docker-compose up -d          # postgres on :5432, redis on :6379 (reads .env)
pnpm install
pnpm dev                      # migrations auto-applied by NuxtHub on dev start
```

Optional seed:

```bash
nuxthub task run db:seed      # idempotent — creates demo users + 50+ games
```

`db:seed` is in `server/tasks/db/seed.ts` and skips re-insert if `games` already has rows. To re-seed, `pnpm exec nuxt db sql "TRUNCATE games CASCADE"` first.

## Verify before committing

Run all three — they catch different things:

```bash
pnpm lint                     # oxlint
pnpm fmt:check                # oxfmt (read-only)
pnpm typecheck                # nuxt typecheck → vue-tsc; regenerates .nuxt types
```

If `fmt:check` fails: `pnpm fmt`. Conventional commits (`feat(scope):`, `refactor:`, `docs:`, `chore:`) — match existing style in `git log --oneline`.

## Repo layout

```
app/
  pages/          routes (file-based) — including /cart, /checkout, /checkout/return
  components/     auto-imported (AppHeader, AppFooter, GameCard, LibraryCard, BrandMark, PixelAccent, PriceTag, AnswerBlock, TerminalFrame)
  composables/    auto-imported (useCart, useWalletBridge)
  layouts/        default (site chrome) + auth
  utils/          auto-imported helpers (format.ts → formatPrice; bridge.client.ts → WebView bridge)
server/
  api/
    games/        public catalog (GET list + by id)
    library/      user-scoped reads of purchases (incl. /library/stats)
    purchases/    POST create order; GET one; POST [id]/confirm (pay/fail)
  db/schema.ts    custom tables: games, purchases (qty, orderGroupId, idempotencyKey)
  tasks/          Nitro tasks (db:seed)
  utils/          auto-imported on the server (response.ts, pagination.ts)
  auth.config.ts  defineServerAuth — admin plugin, email+password
shared/types/     cross-cutting types — NOT auto-imported, import explicitly
DESIGN.md         visual/UX source of truth — read before any UI work
PLAN.md           implementation roadmap (P0..P3)
```

## API shape (enforced)

All endpoints return HTTP **200**. Discriminate via `ApiResponseCode` in the body:

```ts
// shared/types/response.ts
export enum ApiResponseCode {
  Success = "SUCCESS",
  NotFound = "NOT_FOUND",
  InvalidRequest = "INVALID_REQUEST" /* ... */,
}
export function isSuccessResponse<T>(res?: ApiResponse<T>): res is ApiResponseSuccess<T>;
```

Server side — wrap every response in `createResponse` from `server/utils/response.ts` (auto-imported). Pagination meta (`{ total, limit, offset }`) lives in `response.meta`; `data` holds only the payload.

```ts
// success
return createResponse({ code: ApiResponseCode.Success }, payload, { total, limit, offset });
// error (still HTTP 200)
return createResponse({ code: ApiResponseCode.NotFound, message: "..." });
```

Client side — narrow with `isSuccessResponse`, never inspect `data` directly without the guard:

```ts
const { data } = await useFetch<ApiResponse<MyData>>("/api/...");
const items = computed(() => (isSuccessResponse(data.value) ? data.value.data.items : []));
```

Do not `throw createError` for missing/invalid requests — use the envelope. `createError` is reserved for unexpected server failures only.

## Drizzle + schema

- Custom tables (`games`, `purchases`) live in `server/db/schema.ts`.
- Auth-managed tables (`user`, `session`, `account`, `verification`) come from `hub:db:schema` — use the **colon form**, not `hub:db/schema`. The slash form resolves at runtime but fails typecheck.
- `pnpm exec nuxt db generate` to write new migrations; `nuxt typecheck` regenerates `.nuxt/hub/db/schema.d.mts` types.
- New paginated endpoints must use `clampLimit`/`clampOffset` from `server/utils/pagination.ts` (auto-imported on the server).

## Auth

`requireUserSession(event)` is auto-imported on the server and is the gate for any user-scoped endpoint — it throws if unauthenticated, and the resulting 401 flows through the standard envelope via Better Auth's hooks. Route-level gating (admin role, guest-only pages, etc.) lives in `nuxt.config.ts → routeRules`, not in each page.
