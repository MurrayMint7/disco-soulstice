# Turborepo Refactor Plan

Migrating `disco-soulstice` from its create-t3-app single-package layout onto the
layered monorepo structure from [`MurrayMint7/turborepo-starter`](https://github.com/MurrayMint7/turborepo-starter),
with **identical functionality** — auth, billing, email, uploads, admin, all of it.

- **Branch:** `refactor/turborepo-monorepo` (already created, off `origin/main` @ `369c535`)
- **Merge path:** single PR into `main` when the refactor is complete
- **Starter baseline:** `turborepo-starter` `main` @ `ab12a85` (merge of `starter-infra-layers`)
- **Status:** planning not yet started — see [Start here](#start-here)

> This file is scaffolding for the refactor. Delete it before merging the PR, or fold
> it into `docs/`. It is *not* the same document as [`plan.md`](plan.md), which is the
> original 1,119-line ticketing-system implementation plan and stays as-is.

---

## Start here

The workflow below uses skills that are **user-invocation only** (`disable-model-invocation: true`).
Claude cannot launch them for you — type them yourself, from this directory.

```bash
cd ~/Projects/disco-soulstice
git switch refactor/turborepo-monorepo   # should already be checked out
claude
```

Then, in order:

| # | Command | Purpose | Done |
|---|---------|---------|------|
| 0 | `/setup-matt-pocock-skills` | Writes `CLAUDE.md` + `docs/agents/` so the later skills know where the tracker is. **Prerequisite.** | ☐ |
| 1 | `/wayfinder` | Chart the decision map. Resolve the open questions below, one ticket at a time. | ☐ |
| 2 | `/to-spec` | Synthesise the resolved map into a spec on GitHub Issues. | ☐ |
| 3 | `/to-tickets` | Break the spec into tracer-bullet tickets with blocking edges. | ☐ |
| 4 | `/implement` | Execute the tickets, TDD at agreed seams. | ☐ |
| 5 | `/code-review` | Review the branch before the PR merges. | ☐ |

**Answers for step 0** (already decided, so you can accept them in a word):
GitHub tracker (`MurrayMint7/disco-soulstice`) · default triage labels · single-context domain docs · create `CLAUDE.md`.

**Opening prompt for step 1:**

> Refactor disco-soulstice onto the turborepo-starter layered monorepo (`main@ab12a85`),
> preserving identical functionality — Clerk auth, Stripe billing + webhook, tRPC,
> Drizzle/Postgres, Resend, Vercel Blob. Destination: a spec ready to ticket.
> Work lands on `refactor/turborepo-monorepo`, merged via PR.
> Read `REFACTOR-PLAN.md` first.

---

## The single most important fact

**The starter is a skeleton, not working infrastructure.**

Its entire `packages/` tree is **214 lines of source**. Every foundation package is a
zero-dependency abstraction with placeholder logic and a passing unit test:

| Package | Deps | Source | What's actually in it |
|---|---|---|---|
| `@starter/auth` | *none* | 18 lines | `isSignedIn()`, `canAccessAdmin()` over a plain `AuthenticatedUser` type. **No Clerk.** |
| `@starter/billing` | *none* | 35 lines | Pure pricing/subscription helpers. **No Stripe.** |
| `@starter/db` | *none* | 16 lines | Placeholder. **No Drizzle, no schema, no connection.** |
| `@starter/trpc` | `@starter/auth` | 9 lines | Context type only. **No tRPC server.** |
| `@starter/validators` | `zod` | 11 lines | Two sample schemas. |
| `@starter/env-schema` | `zod` | 17 lines | Sample env shape. |
| `@starter/query-client` | *none* | 11 lines | Placeholder. |
| `@starter/ui` | *none* | 1 line | Empty barrel + `primitives/`. |

So this refactor is **not** "move disco-soulstice's files into ready-made packages."
It is: *adopt the starter's structure, tooling and boundary rules, then build the real
foundations by porting disco-soulstice's 7,480 lines of working code into that shape.*

The starter contributes the **shape and the guardrails**. This repo contributes **all the behaviour**.

Corollary: `packages/services/chat`, `packages/features/conversations`, and
`packages/compositions/admin` are template leftovers from an unrelated chat app.
Delete them — don't try to bend disco-soulstice into them.

---

## What has to move

### tRPC routers — 847 lines

| Router | LOC | Notes |
|---|---|---|
| `merch.ts` | 379 | Largest. Items, sizes, orders, Stripe checkout. |
| `event.ts` | 159 | Events + ticket purchase. |
| `order.ts` | 138 | Ticket orders, confirmation. |
| `gallery.ts` | 84 | Albums + images. |
| `admin.ts` | 57 | Admin dashboard queries. |
| `post.ts` | 30 | **create-t3-app scaffold — verify it's unused and delete.** |

Plus `src/server/api/trpc.ts` (125 lines — context, `protectedProcedure`, admin guard)
and `src/server/api/root.ts`.

### Database — 315 lines

Drizzle schema, 9 tables, all under the `disco-soulstice_` table prefix (see `drizzle.config.ts`):
`posts`, `events`, `orders`, `tickets`, `merchItems`, `merchSizes`, `merchOrders`,
`galleryAlbums`, `galleryImages`.

Also `src/server/db/seed.ts` and the one-off `migrate-images-to-blob.ts`.

> **The table prefix must not change.** It's a live Neon database. Renaming tables is a
> data migration, not a refactor — keep the prefix identical and this stays a pure code move.

### Integrations

- **Clerk** — `src/middleware.ts` protects `/checkout(.*)`, `/orders(.*)`, `/admin(.*)`.
  Sign-in/up catch-all routes. Middleware **must stay at the app root** (`apps/*/src/middleware.ts`);
  Next.js won't find it in a package.
- **Stripe** — `src/server/stripe.ts` (lazily instantiated, deliberately — see `e130d5d`),
  `/api/webhooks/stripe` handling `payment_intent.succeeded` / `payment_intent.payment_failed`,
  `@stripe/react-stripe-js` on the checkout pages.
- **Resend** — `src/server/resend.ts` (also lazy — `233c125`), plus
  `send-ticket-confirmation.ts` and `send-merch-confirmation.ts`. QR codes via `qrcode`.
- **Vercel Blob** — `src/lib/upload-image.ts`, `/api/blob/upload`, `admin/_components/image-upload.tsx`.
  Migrated off UploadThing recently (`0d145fe`) — don't regress it.

> Keep the lazy instantiation of Stripe and Resend. Both were deliberate fixes for
> build-time env access; eager module-level clients break `next build`.

### App Router — 31 route files

`/` · `/events` · `/events/[slug]` · `/events/history` · `/merch` · `/merch/[slug]` ·
`/gallery` · `/contact` · `/checkout/[eventSlug]` · `/checkout/merch/[slug]` ·
`/orders` · `/orders/[orderId]` · `/orders/merch/[orderId]` · `/orders/confirm` ·
`/sign-in` · `/sign-up` · 7 × `/admin/*` · 3 API routes.

Shared components in `src/app/_components/` (header, footer, hero, events, interactive-vinyl, post).

### Environment — 14 variables

`src/env.js` uses `@t3-oss/env-nextjs`. Server: `DATABASE_URL`, `NODE_ENV`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLERK_SECRET_KEY`, `RESEND_API_KEY`,
`BLOB_READ_WRITE_TOKEN`. Client: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, four `NEXT_PUBLIC_CLERK_*` URL vars, `NEXT_PUBLIC_APP_URL`.

---

## Open questions for `/wayfinder`

These are **decisions**, not tasks — which is exactly what wayfinder tickets are for.
Don't start `/implement` until they're resolved.

1. **Where does each router land?** The starter's layers run
   `foundations → services → features → compositions → apps`, enforced by
   `scripts/check-layer-boundaries.mjs`. Is `merch` a *feature* over a `db` foundation?
   Does Stripe checkout logic live in a `billing` service? This is the core design
   question and everything else follows from it.

2. **How thick is the auth boundary?** The starter's `@starter/auth` is deliberately
   Clerk-free. Do we keep that abstraction and write a Clerk adapter behind it, or admit
   Clerk into the foundation? The pure version is more testable; the adapter is more code.

3. **Does the Drizzle schema stay one package or split by domain?** One `@repo/db` with
   all 9 tables is simplest and matches the current shape. Splitting per-feature fights
   Drizzle's relations.

4. **npm → pnpm.** The starter is `pnpm@11.9.0` with a workspace; this repo is
   `npm@11.6.2` with `package-lock.json` and an `esbuild` override. Committing to pnpm
   means regenerating the lockfile, updating CI, and **changing Vercel's install command** —
   easy to forget until the first deploy fails.

5. **Package naming.** Starter uses `@starter/*`. Rename to `@disco/*` (or keep)?
   Cheap to decide now, tedious to change after 20 packages exist.

6. **What's the test seam?** The starter ships Vitest and the foundations have unit tests;
   this repo currently has **no tests at all**. `/implement` wants TDD at pre-agreed seams —
   agree them during wayfinding. A refactor with identical behaviour is the ideal place for
   characterisation tests, and there's currently nothing to catch a regression.

7. **Is `post.ts` dead?** 30 lines of create-t3-app scaffold plus a `posts` table and
   `_components/post.tsx`. Confirm and delete rather than porting.

---

## Risks

| Risk | Why it bites |
|---|---|
| **Vercel deploy config** | Install command, build command, and root directory all change when the app moves to `apps/*`. The `.vercel` directory here is already linked to a project. |
| **CI rewrite** | `.github/workflows/ci.yml` is npm + single-package (`npm ci`, `npm run lint/typecheck/build`, `SKIP_ENV_VALIDATION=1`). Becomes pnpm + `turbo run`. The starter's `tooling/github` has conventions to copy. |
| **No test safety net** | 7,480 lines moving with zero tests. The only regression check today is `pnpm build` passing and clicking through by hand. |
| **Stripe webhook path** | `/api/webhooks/stripe` is registered in the live Stripe dashboard. If the route path changes, production payments silently stop confirming. |
| **Live database** | Neon-hosted with real orders. The `disco-soulstice_` prefix and all column names must survive untouched. |
| **Big-bang PR** | The whole app moves at once, so the PR is unavoidably large. Tracer-bullet tickets that keep `main` deployable at each step are worth the extra planning. |

---

## Reference

**Current stack:** Next.js 15.2.3 (App Router), React 19, TypeScript 5.8, tRPC 11,
Drizzle 0.41 / Postgres (Neon), Tailwind 4, Clerk 7, Stripe 20, Resend 6, Vercel Blob 2.
Path alias `~/*` → `./src/*`.

**Starter layout:**

```txt
apps/nextjs/
packages/foundations/   auth billing db trpc ui validators env-schema query-client
packages/services/      chat            <- leftover, delete
packages/features/      conversations   <- leftover, delete
packages/compositions/  admin           <- leftover, delete
tooling/                eslint prettier tailwind typescript vitest github
scripts/check-layer-boundaries.mjs
```

**Starter scripts:** `pnpm dev` · `build` · `lint` · `test` · `typecheck` · `boundaries` ·
`verify` (= lint + boundaries + test + typecheck + build, the local CI gate).

**Local paths:** this repo `~/Projects/disco-soulstice` · starter `~/Projects/turborepo-starter`.
