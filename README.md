# Glitch

Game store web application for the WebBridge demo, featuring video game browsing,
shopping cart, checkout with `WebViewJavascriptBridge` handoff to the EasyPay
Android wallet, and a post-purchase library with receipts.

## Tech Stack

- **Framework**: Nuxt 4 (App Router, file-based)
- **UI**: Nuxt UI v4 + Tailwind CSS v4
- **Database**: PostgreSQL via NuxtHub + Drizzle ORM
- **State**: VueUse `useLocalStorage` (no Pinia — see [State management](#state-management))
- **Auth**: Better Auth via `@onmax/nuxt-better-auth` (email + password, admin plugin)

## Prerequisites

- Node.js 24+ and pnpm
- Docker (for local PostgreSQL + Redis)

## Quickstart

```bash
docker-compose up -d              # postgres + redis
pnpm install
pnpm dev                          # migrations auto-applied by NuxtHub

# Optional: 50+ games + demo users
nuxthub task run db:seed
```

Open <http://localhost:3000>. Sign in with `demo@easyshop.com` / `password123`
(or the admin variant) advertised on `/login`.

## State management

There is no Pinia in this repo. Cart state lives in `app/composables/useCart.ts`
and persists to `localStorage` via VueUse `useLocalStorage("glitch.cart.v1")`.
Auth state is exposed by `useUserSession()` from `@onmax/nuxt-better-auth`; that
module handles cookie-based sessions and the admin role check.

## Database commands

```bash
pnpm exec nuxt db generate        # diff schema vs migrations; write a new SQL file
pnpm exec nuxt db migrate         # apply pending migrations
pnpm exec nuxt db sql "<QUERY>"   # run a one-off query
```

Schemas live in `server/db/schema.ts` for custom tables (`games`,
`purchases`). Auth-managed tables (`user`, `session`, `account`, `verification`)
come from Better Auth and are imported via `hub:db:schema` (the colon form — see
`AGENTS.md`).

## Project structure

```
app/
  pages/          file-based routes (cart, library, checkout, …)
  components/     auto-imported (AppHeader, AppFooter, GameCard, LibraryCard, BrandMark, PixelAccent, PriceTag, AnswerBlock, TerminalFrame)
  composables/    auto-imported (useCart, useWalletBridge)
  layouts/        default (site chrome) + auth
  utils/          auto-imported helpers (format.ts → formatPrice; bridge.client.ts → WebView bridge)
server/
  api/            Nitro routes — always wrap in createResponse
  db/schema.ts    custom tables (games, purchases)
  tasks/          db:seed (Nitro task, idempotent)
  utils/          auto-imported server helpers (response, pagination)
shared/types/     cross-cutting types — imported via #shared/types
DESIGN.md         visual/UX source of truth — read before any UI work
AGENTS.md         repo conventions — read before any contribution
PLAN.md           implementation roadmap
```

## API surface

All endpoints return **HTTP 200**. Success and error are discriminated by
`status.code` in the response envelope. See `shared/types/response.ts` for
`ApiResponseCode` and the full envelope shape.

| Method | Path                          | Auth   | Purpose                                                                 |
| ------ | ----------------------------- | ------ | ----------------------------------------------------------------------- |
| GET    | `/api/games`                  | Public | Paginated catalog with `search`/`category`                              |
| GET    | `/api/games/[id]`             | Public | Single game detail                                                      |
| POST   | `/api/purchases`              | User   | Submit cart → create pending `purchases` rows; supports Idempotency-Key |
| GET    | `/api/purchases/[id]`         | User   | One purchase, ownership-checked                                         |
| POST   | `/api/purchases/[id]/confirm` | User   | Flip `pending` → `completed` / `failed` for the whole order group       |
| GET    | `/api/library`                | User   | Same shape as before; reads `purchases`                                 |
| GET    | `/api/library/[id]`           | User   | Single receipt, ownership-checked                                       |
| GET    | `/api/library/stats`          | User   | Counts + `totalSpent` for header rollup                                 |

Auth endpoints (`/api/auth/*`) are mounted by `@onmax/nuxt-better-auth`; the
client composables are `useSignIn`, `useSignUp`, `useUserSession`,
`useRequestPasswordReset`, `useResetPassword`.

### Bridge handoff

The user flow is:

1. Cart → checkout → client POSTs `/api/purchases` (lines created `pending`).
2. Client calls `useWalletBridge().pay({ orderGroupId, purchaseId, total, items, … })`.
3. In an Android WebView running EasyPay, `pay()` invokes
   `bridge.callHandler('wallet.requestPayment', payload, cb)`. In a desktop
   browser the composable falls back to flipping the rows to `completed`
   directly via `/api/purchases/[id]/confirm` so the demo works without a device.
4. Client navigates to `/checkout/return?purchaseId=…&status=…`; the page
   polls `/api/purchases/[id]` until the row leaves `pending`.

Shared types for the bridge wire format live in `shared/types/bridge.ts`
(`BridgePayPayload`, `BridgePayResult`).

## Routes

| Path                                  | Auth   | Notes                                                 |
| ------------------------------------- | ------ | ----------------------------------------------------- |
| `/`                                   | Public | Hero + featured grid + how-it-works                   |
| `/catalog`                            | Public | Search + category filter + pagination                 |
| `/games/[id]`                         | Public | Detail page; add to cart                              |
| `/cart`                               | User   | Lines + sticky summary                                |
| `/checkout`                           | User   | Order summary + pay CTA (hand off to wallet)          |
| `/checkout/return`                    | User   | Polls status; shows completed / failed / cancelled UI |
| `/library`                            | User   | Owned + pending + failed + refunded                   |
| `/library/[id]`                       | User   | Single receipt                                        |
| `/account`                            | User   | Profile + admin shortcut                              |
| `/login`                              | Guest  | Sign in                                               |
| `/register`                           | Guest  | Sign up                                               |
| `/forgot-password`, `/reset-password` | Guest  | Better Auth flow                                      |

## License

MIT — see `LICENSE`.
