# Turborepo Refactor Plan

Migrating `disco-soulstice` from its create-t3-app single-package layout onto the
layered monorepo structure from [`MurrayMint7/turborepo-starter`](https://github.com/MurrayMint7/turborepo-starter),
with **identical functionality** — auth, billing, email, uploads, admin, all of it.

- **Branch:** `refactor/turborepo-monorepo` (off `origin/main` @ `369c535`)
- **Merge path:** single PR into `main` when the refactor is complete
- **Starter baseline:** `turborepo-starter` `main` @ `ab12a85`
- **Status:** Phases 0–6 complete (`pnpm verify` green). **Phase 7 — review, preview
  deploy and merge — is yours to drive.** Three manual gates are outstanding; they are
  listed under [Before merging](#before-merging).
  One manual gate is outstanding — see [Phase 4](#phase-4--services-tests-first-).
  See [Implementation log](#implementation-log).

> Delete this file before merging the PR, or fold it into `docs/`. It is *not*
> [`plan.md`](plan.md), which is the original ticketing-system implementation plan
> and stays as-is.

---

## The single most important fact

**The starter is a skeleton, not working infrastructure.** Its entire `packages/` tree
is 214 lines of source — every foundation is a zero-dependency placeholder with a
passing unit test. `@starter/auth` has no Clerk. `@starter/billing` has no Stripe.
`@starter/db` has no Drizzle.

So this refactor is **not** "move disco-soulstice's files into ready-made packages."
It is: *adopt the starter's structure, tooling and boundary rules, then build the real
foundations by porting this repo's 7,546 lines of working code into that shape.*

The starter contributes the **shape and the guardrails**. This repo contributes **all
the behaviour**.

`packages/services/chat`, `packages/features/conversations` and
`packages/compositions/admin` are template leftovers from an unrelated chat app.
Delete them — don't bend disco-soulstice into them.

---

## Resolved decisions

| # | Question | Decision |
|---|---|---|
| 1 | Where does each router land? | **Full layering.** Vendor clients → foundations. Payment-fulfilment logic → services. Routers → features. `appRouter` → composition. Routes/middleware/pages → app. |
| 2 | How thick is the auth boundary? | **Clerk lives inside `@disco/auth`.** One vendor seam. Nothing else imports `@clerk/nextjs` except `apps/nextjs/src/middleware.ts`, which Next.js requires at the app root. |
| 3 | One db package or split? | **One `@disco/db`.** All 9 tables, one `pgTableCreator`, relations intact. Splitting fights Drizzle's relations for no gain. |
| 4 | npm → pnpm? | **pnpm `11.9.0`**, matching the starter. Delete `package-lock.json`, regenerate `pnpm-lock.yaml`, update CI and Vercel's install command. The `esbuild` override becomes `allowBuilds.esbuild` in `pnpm-workspace.yaml` (already present in the starter). |
| 5 | Package naming? | **`@disco/*`.** Requires a one-line change to the `@starter/` regex in `scripts/check-layer-boundaries.mjs`. |
| 6 | Test seam? | **Pure-logic characterisation tests**, Vitest, no DB or network. Written *before* each service moves. Seams listed under [Test seams](#test-seams). |
| 7 | Is `post.ts` dead? | **Yes — confirmed.** `LatestPost` in `src/app/_components/post.tsx` is imported nowhere. Delete the router and the component. **Keep the `posts` table in the schema** (see [Dead code](#dead-code)). |
| 8 | Tailwind version? | **Upgrade to `4.3.3`** (npm `latest`) from this repo's `4.0.15` and the starter's `4.1.11`. **Tailwind v5 is not released** — the registry has no 5.x at all. Done in Phase 0 so any visual regression surfaces before code moves. |

### Corrections to earlier assumptions

- **The database is Vercel Postgres, not Neon.** `DATABASE_URL` is provided by Vercel.
  The "don't touch the `disco-soulstice_` prefix" rule stands regardless.
- **There is no `drizzle/` migrations directory.** The schema has only ever been
  `db:push`ed. No migration history to carry across — the DB move is cleaner than assumed.
- **`.vercel/repo.json` pins `"directory": "."`.** That is the concrete artefact that
  must change when the app moves to `apps/nextjs`.
- **`drizzle.config.ts` imports `~/env`**, so the env package must be resolvable from
  repo-root tooling, not only from the app.
- **The app directory keeps the starter's name, `apps/nextjs`** (package `@disco/nextjs`),
  to minimise gratuitous divergence from the starter.

---

## Target layout

```txt
apps/nextjs/                     @disco/nextjs
  src/app/                       31 route files, _components/, api routes
  src/middleware.ts              clerkMiddleware — must stay at app root
  src/trpc/react.tsx             TRPCReactProvider (Next-specific)
  src/trpc/server.ts             RSC hydration helpers (server-only, next/headers)
  src/styles/globals.css         Tailwind 4.3 entry + @source directives

packages/foundations/
  env                @disco/env                @t3-oss/env-nextjs, zod
  db                 @disco/db                 drizzle, postgres, schema, seed
  auth               @disco/auth               @clerk/nextjs — the only importer
  payments           @disco/payments           stripe (lazy), webhook verification
  email              @disco/email              resend (lazy), qrcode, confirmations
  storage            @disco/storage            @vercel/blob — upload + delete
  validators         @disco/validators         zod schemas shared router↔form
  trpc               @disco/trpc               initTRPC, context, procedures
  query-client       @disco/query-client       tanstack + superjson factory
  ui                 @disco/ui                 genuinely shared primitives only

packages/services/
  ticketing          @disco/ticketing-service  ticket fulfilment, codes, capacity
  merch              @disco/merch-service      merch fulfilment, stock, totals

packages/features/
  events             @disco/events-feature     eventRouter
  orders             @disco/orders-feature     orderRouter
  merch              @disco/merch-feature      merchRouter
  gallery            @disco/gallery-feature    galleryRouter
  admin              @disco/admin-feature      adminRouter

packages/compositions/
  api                @disco/api                appRouter, createCaller, AppRouter

tooling/             eslint prettier tailwind typescript vitest github
scripts/check-layer-boundaries.mjs
```

**Where app chrome stays:** `header`, `footer`, `hero`, `events`, `interactive-vinyl`
are app-specific chrome, not reusable primitives. They stay in
`apps/nextjs/src/app/_components/`. `@disco/ui` starts thin — the starter's `Button`
plus anything the admin screens genuinely share (`image-upload` is the candidate).
Promote into `@disco/ui` later, when a second consumer exists.

**Where the layers actually bind:**

```txt
apps/nextjs
  ├─ @disco/api ──────── @disco/*-feature ──┬─ @disco/trpc ──┬─ @disco/auth
  │                                          │                └─ @disco/db
  │                                          ├─ @disco/*-service
  │                                          ├─ @disco/validators
  │                                          ├─ @disco/payments
  │                                          └─ @disco/storage
  ├─ @disco/*-service (webhook route calls these directly)
  ├─ @disco/auth (middleware only)
  ├─ @disco/query-client, @disco/ui, @disco/env
  └─ every foundation transitively
```

---

## Phases

Each phase ends with `pnpm verify` green and the branch deployable. Do not start
the next phase until the current one is committed.

### Phase 0 — Scaffold and tooling (no app code moves)

Graft the starter's skeleton onto this repo. Nothing in `src/` moves yet.

1. Copy from `~/Projects/turborepo-starter`: `turbo.json`, `pnpm-workspace.yaml`,
   `.npmrc`, `prettier.config.mjs`, `scripts/`, `tooling/`. **Do not copy `.next/`,
   `node_modules/`, `.turbo/`, or `pnpm-lock.yaml`.**
2. Rename `@starter/*` → `@disco/*` throughout the copied files, including the
   `@starter\/` regex in `scripts/check-layer-boundaries.mjs`.
3. Replace root `package.json` with the starter's, renamed, `packageManager: "pnpm@11.9.0"`.
4. Port this repo's ESLint rules into `tooling/eslint/eslint/base.mjs`:
   `recommendedTypeChecked`, `stylisticTypeChecked`, `consistent-type-imports`,
   `no-misused-promises`, and the `drizzle/enforce-{delete,update}-with-where` rules.
   Type-checked linting needs `parserOptions.projectService` — verify it resolves
   per-package before moving on.
5. Add `verbatimModuleSyntax: true` to `tooling/typescript/tsconfig/base.json`
   (the starter omits it; this repo relies on it).
6. Bump `tailwindcss` and `@tailwindcss/postcss` to `^4.3.3` (npm `latest`; there is
   no v5). Nothing else changes in this step, so any visual diff is attributable.
7. `rm package-lock.json`, `pnpm install`, commit `pnpm-lock.yaml`.
8. Delete `packages/services/chat`, `packages/features/conversations`,
   `packages/compositions/admin` if the graft brought them.

**Gate:** `pnpm boundaries` passes on an empty workspace. The old app still builds
via its own scripts.

### Phase 1 — Move the app wholesale (still monolithic)

The whole of `src/` becomes `apps/nextjs/src/` in one `git mv`, with zero
restructuring inside it. This is the highest-risk-of-tedium, lowest-risk-of-logic-bug
step, and it gets the deploy config verified early.

1. `git mv src apps/nextjs/src`, plus `public/`, `next.config.js` → `next.config.ts`,
   `postcss.config.js`, `next-env.d.ts`, `drizzle.config.ts`, `start-database.sh`.
2. Write `apps/nextjs/package.json` (`@disco/nextjs`) with every current dependency,
   `apps/nextjs/tsconfig.json` extending `@disco/typescript-config/next.json` and
   keeping the `~/*` → `./src/*` path alias, `eslint.config.mjs`, `vitest.config.ts`.
3. Rewrite `.github/workflows/ci.yml`: pnpm + `pnpm install --frozen-lockfile` +
   `pnpm verify`. Copy the conventions from `tooling/github/index.ts`.
4. **Update Vercel:** set Root Directory to `apps/nextjs`, install command to
   `pnpm install --frozen-lockfile`, build command to `pnpm build`. Update
   `.vercel/repo.json`'s `"directory"` to `apps/nextjs`.
5. **Confirm `/api/webhooks/stripe` still resolves at the same URL.** The path is
   registered in the live Stripe dashboard; it must not change.

**Gate:** `pnpm verify` green, **and a Vercel preview deploy succeeds and serves the
site**. Do not proceed on a red preview — everything after this compounds on it.

### Phase 2 — Foundations: env and db

The two everything else depends on.

1. `@disco/env` — port `src/env.js` to `src/index.ts` (TypeScript, not JS; `checkJs`
   goes away). All 14 variables unchanged. Keep `skipValidation` on `SKIP_ENV_VALIDATION`.
2. `@disco/db` — `schema.ts` verbatim (prefix `disco-soulstice_` **untouched**),
   `index.ts` connection with the dev-HMR global cache, `seed.ts`,
   `migrate-images-to-blob.ts`. Owns `drizzle.config.ts` and the `db:*` scripts;
   the root `package.json` proxies them.
3. Add `@source` directives to `apps/nextjs/src/styles/globals.css` for any package
   that will contain Tailwind classes — Tailwind does not scan workspace
   dependencies automatically.
4. **Keep a `db:push` script in `apps/nextjs`**, delegating to the new package
   (`pnpm --filter @disco/db db:push`). Vercel's build command calls it on every
   deploy; moving it without leaving a delegation breaks production deploys.

**Gate:** `pnpm verify` green. `pnpm db:studio` connects. Styles unchanged in dev.

### Phase 3 — Remaining foundations

Ported behaviour-for-behaviour; no logic changes.

- `@disco/auth` — `getCurrentUserId()`, `requireAdmin(userId)`,
  `getUserProfile(userId) → { email, name }`. Absorbs the `clerkClient()` calls
  currently duplicated in `trpc.ts`, `merch.ts`, `order.ts` and the blob route.
- `@disco/payments` — the lazy Stripe `Proxy` **exactly as-is** (`e130d5d` fixed a
  real build-time env-access bug; an eager module-level client breaks `next build`),
  plus `constructWebhookEvent(body, signature)` and a `createPaymentIntent` helper.
- `@disco/email` — the lazy Resend `Proxy` (same reasoning, `233c125`),
  `sendTicketConfirmation`, `sendMerchConfirmation`, `qrcode`.
- `@disco/storage` — `del` wrapper for server deletes, `uploadImageFile` and
  `detectImageAspect` for the client, and the `handleUpload` token policy from
  `/api/blob/upload` (the route becomes a thin handler). Vercel Blob only — do not
  regress to UploadThing (`0d145fe`).
- `@disco/validators` — zod schemas currently inline in the routers, so admin forms
  and procedures share one definition.
- `@disco/query-client` — `createQueryClient` from `src/trpc/query-client.ts`.
- `@disco/trpc` — `initTRPC`, superjson, the Zod error formatter, `createTRPCContext`,
  `publicProcedure` / `authedProcedure` / `adminProcedure`, `timingMiddleware`.
  Depends on `@disco/auth` and `@disco/db`.

**Gate:** `pnpm verify` green. `grep -rn "@clerk/nextjs" apps packages` returns only
`@disco/auth` and `apps/nextjs/src/middleware.ts`.

### Phase 4 — Services (tests first)

The only phase where logic is genuinely restructured rather than relocated. Write the
characterisation test, watch it pass against the current inline code, then move the code.

- `@disco/ticketing-service` — `fulfilTicketPayment(metadata, deps)`: the ticket half
  of the Stripe webhook, including the idempotency check, the `events.ticketsSold`
  increment, `uuid` ticket-code generation, and the confirmation-email payload.
  Also the capacity guard from `event.ts`.
- `@disco/merch-service` — `fulfilMerchPayment(metadata, deps)`: the merch half,
  including idempotency, the `merchSizes.sold` increment, and the confirmation payload.
  Also the stock / `maxPerOrder` / total-price guards from `merch.ts`.

Both take their DB transaction and email sender as injected `deps`, so the tests need
no database and no network. `/api/webhooks/stripe` becomes: verify signature via
`@disco/payments`, branch on `metadata.type`, delegate.

**Gate:** `pnpm verify` green, all characterisation tests pass, **and a Stripe CLI
`stripe trigger payment_intent.succeeded` against the local webhook produces an
identical row + email to before.**

### Phase 5 — Features

One package per router, moved with no logic change now that the services exist.
`events` · `orders` · `merch` · `gallery` · `admin`. Each depends on `@disco/trpc`,
`@disco/validators` and whichever services/foundations it needs.

Delete `post.ts` and `src/app/_components/post.tsx` here.

**Gate:** `pnpm verify` green. Every admin screen and checkout flow clicked through by hand.

### Phase 6 — Composition and cleanup

1. `@disco/api` — `appRouter`, `createCaller`, the `AppRouter` type.
2. `apps/nextjs/src/trpc/{react.tsx,server.ts}` import `@disco/api`.
3. `next.config.ts` `transpilePackages` lists every `@disco/*` package.
4. Remove the now-unused `~/*` alias targets; keep the alias for app-internal imports.
5. Delete `tsconfig.tsbuildinfo`, stale `.next/`, and `README.md` references to the
   old single-package scripts. Update `README.md` for the pnpm/turbo workflow.

**Gate:** `pnpm verify` green. `pnpm boundaries` green. Preview deploy green.

### Phase 7 — Merge

1. `/code-review` on the branch.
2. Delete or relocate this file.
3. Squash-free merge PR into `main`. Watch the first production deploy and the first
   real Stripe webhook.

---

## Implementation log

### Phase 0 — Scaffold and tooling ✅

Starter tooling grafted, `@starter/*` → `@disco/*`, npm → pnpm 11.9.0, Tailwind 4.3.3.
`pnpm boundaries` green.

**Deviation:** the plan's gate said "the old app still builds via its own scripts."
That was wrong — the root `package.json` can only be one thing, and Phase 0 replaces it
with the workspace root. The app is unbuildable between Phase 0 and Phase 1 by
construction. The two phases must land together.

### Phase 1 — App moved to `apps/nextjs` ✅

All 64 source files moved via `git mv` (recorded as renames, history preserved).
`pnpm verify` green across all five gates. Build output confirms all 31 routes,
middleware, and — critically — `/api/webhooks/stripe`, `/api/trpc/[trpc]` and
`/api/blob/upload` at **identical paths**.

**Four incompatibilities in the starter's tooling, found and fixed:**

1. **`declaration: true` in the shared TS base breaks the app under pnpm.** It forces
   TypeScript to name inferred types portably, which pnpm's nested `node_modules`
   layout cannot satisfy — `createTRPCReact<AppRouter>()` failed to compile. The app
   emits nothing (`noEmit: true`), so `tooling/typescript/tsconfig/next.json` now sets
   `declaration: false`. Library packages keep it. **This will resurface in Phase 5**
   if any feature package re-exports a tRPC router type.
2. **The starter's `eslint/next.mjs` has no `react-hooks` plugin.** It wires only
   `@next/eslint-plugin-next`, so `react-hooks/exhaustive-deps` — which this app's code
   references — resolved to "rule not found". Added `eslint-plugin-react` and
   `eslint-plugin-react-hooks`.
3. **`js.configs.recommended` with no globals declared.** 15 `no-undef` errors on
   `process` in `env.js`. Added `globals.node`/`browser`/`es2022` and turned `no-undef`
   off for TypeScript, where the compiler already resolves identifiers.
4. **Flat-config ordering.** The `disableTypeChecked` override for config files was
   placed *before* the block setting `projectService: true`, so the later block
   re-enabled type-aware parsing and every `.mjs` config failed to parse. The global
   `languageOptions` block now comes first and the config-file override last.

Also ported into the shared tooling so behaviour is unchanged from `main`:
`recommendedTypeChecked` + `stylisticTypeChecked`, `consistent-type-imports`,
`no-misused-promises`, the `drizzle/enforce-{delete,update}-with-where` rules
(now also covering `tx`), `verbatimModuleSyntax`, and `prettier-plugin-tailwindcss`.

**Done in the Vercel dashboard (2026-08-19) — could not be scripted:**

- Root Directory → `apps/nextjs`
- Install Command → `pnpm install --frozen-lockfile`
- Build Command → `pnpm db:push && pnpm build`
- Production deploy of `main` green on redeploy with the build cache cleared.

Until Root Directory was changed, every build failed with `No Next.js version detected` —
Vercel read the root `package.json`, which has no `next`. Changing the setting does **not**
trigger a rebuild on its own; a manual redeploy is required.

`.vercel/repo.json` and `.github/workflows/ci.yml` are already updated in the repo.

### The build command runs `db:push` — this constrains the refactor

The previous build command was `npm run db:push && npm run build`, so **every deploy
applies the Drizzle schema directly to the live database**. Verified working from the new
location: `drizzle-kit` resolves the `~/env` alias, loads `apps/nextjs/.env`, and reads
all 9 tables. So `pnpm db:push && pnpm build` is a like-for-like replacement.

`pnpm build` here is `next build`, not `turbo run build`. That is correct — with Root
Directory set to `apps/nextjs`, Vercel installs at the workspace root, and the `@disco/*`
packages are consumed as TypeScript source via `transpilePackages`, so there is nothing
to pre-build. Turbo is not needed in the deploy path.

**Three consequences:**

1. **`apps/nextjs` must keep a `db:push` script at every phase**, so the dashboard build
   command never has to change again. In Phase 2, when `drizzle.config.ts` and the schema
   move to `@disco/db`, the app's script becomes a delegation:
   `"db:push": "pnpm --filter @disco/db db:push"`. **Do not simply move the script.**

2. **Dropping `posts` from `schema.ts` would drop the live table on the next deploy.**
   `drizzle-kit push` diffs and applies DDL with no migration file and no review step.
   `disco-soulstice_post` is a real table in the schema drizzle tracks. The [Dead code](#dead-code)
   rule — delete the router and component, keep the table — is therefore **load-bearing,
   not cautious**. The same applies to any column rename during the port.

3. **Check whether preview deploys share `DATABASE_URL` with production.** If the variable
   is set at project scope rather than per-environment, every preview deploy of this branch
   runs `db:push` against production. Phases 0–6 keep the schema byte-identical, so a push
   is a no-op — but verify before the first preview deploy rather than after.

**Worth a follow-up PR after the refactor merges:** replace `db:push`-on-deploy with real
migrations. There are no migrations today, and a trial `drizzle-kit generate` produced a
clean baseline of all 9 tables in one file — so the switch is cheap, and it replaces
unreviewed DDL-on-deploy with SQL that lands in git and gets read. Out of scope here;
this refactor preserves existing behaviour.

---

### Phase 2 — Foundations: `@disco/env` and `@disco/db` ✅

`src/env.js` → `packages/foundations/env/src/index.ts` (TypeScript; all 14 variables and
`skipValidation` unchanged). `schema.ts`, the connection and `seed.ts` → `@disco/db`,
all via `git mv`. `schema.ts` is **byte-identical** to `HEAD` — verified by diff, not by
eye. 21 import sites rewritten to `@disco/env` / `@disco/db` / `@disco/db/schema`.
`pnpm verify` green across all five gates.

**Three deviations from the plan, each with a reason:**

1. **`drizzle.config.ts` and the `db:*` scripts stay in `apps/nextjs`.** The plan had
   `@disco/db` owning them, with the app delegating via `pnpm --filter`. But `drizzle-kit`
   auto-loads `.env` from its working directory, and `.env` lives in `apps/nextjs`
   because that is the only place Next.js will read it from. Moving the config would have
   meant either an explicit `--env-file=../../../apps/nextjs/.env` (a foundation reaching
   back into an app) or a root `.env` plus a symlink. Keeping the config in the app is
   simpler, leaves the Vercel build command untouched, and removes an entire class of
   env-loading risk from the one command that writes to the live database. The config now
   points at `../../packages/foundations/db/src/schema.ts`.

   **Verified without touching the database:** `drizzle-kit export --sql` emits all 9
   tables with the `disco-soulstice_` prefix intact, including `post`. If the schema path
   had been wrong, `db:push` would have seen an empty schema and proposed dropping every
   live table.

2. **`migrate-images-to-blob.ts` does not move to `@disco/db`.** It imports
   `~/app/gallery/gallery-data` — app-level data — so a foundation cannot own it without
   inverting the layer graph. It stays in `apps/nextjs/src/server/db/`, now importing
   `@disco/db`. It is a spent one-off (the Blob migration shipped in `369c535`); consider
   deleting it and `gallery-data.ts`, its only consumer, in a later phase.

3. **No `@source` directives added to `globals.css` yet.** Plan item 3 anticipated them,
   but neither `@disco/env` nor `@disco/db` contains a Tailwind class. This becomes real
   in Phase 3 with `@disco/ui`.

**Also changed:** `next.config.mjs` → `next.config.ts`, because the build-time env import
is now a TypeScript workspace package that Node cannot load from a `.mjs` config. It
declares `transpilePackages: ["@disco/db", "@disco/env"]` — the `@disco/*` packages are
consumed as TypeScript source, so Next.js compiles them itself. Build confirmed green.

**Also:** `@t3-oss/env-nextjs` and `postgres` dropped from the app's `package.json` — the
app no longer imports either directly; they belong to `@disco/env` and `@disco/db` now.


### Phase 3 — Remaining foundations ✅

Seven packages: `@disco/auth`, `@disco/payments`, `@disco/email`, `@disco/storage`,
`@disco/validators`, `@disco/query-client`, `@disco/trpc`. Every file that had an
existing home moved by `git mv` (recorded as renames): `server/stripe.ts` → payments,
`server/resend.ts` + `server/email/*` → email, `lib/upload-image.ts` → storage,
`trpc/query-client.ts` → query-client, `server/api/trpc.ts` → trpc. `pnpm verify` green
across all five gates; the build emits the same 31 routes, and `/api/webhooks/stripe`,
`/api/trpc/[trpc]` and `/api/blob/upload` are unmoved.

**Gate met:** `grep -rn "@clerk/nextjs" apps packages` returns only `@disco/auth` and
`apps/nextjs/src/middleware.ts`.

**Four things the plan did not anticipate:**

1. **Clerk's *React* surface had to move too, or the gate was unmeetable.**
   `ClerkProvider`, `SignIn`, `SignUp`, `useAuth`, `SignInButton` and `UserButton` are
   imported by four app files, and the plan's gate allows `@clerk/nextjs` in exactly one
   app file. So `@disco/auth` gained a second entry point, `@disco/auth/react`, that
   re-exports them. Clerk's own modules carry their `"use client"` directives, so the
   client boundary stays inside Clerk and the re-export needs no directive of its own —
   confirmed by a green build with the sign-in/sign-up routes still rendering.

2. **`requireAdmin` cannot throw a `TRPCError` without inverting the seam.** The plan
   specified `requireAdmin(userId)` and a test seam asserting `FORBIDDEN` / `UNAUTHORIZED`,
   but a foundation that owns Clerk should not also own tRPC's error type — and the blob
   upload route, the other caller, is not a tRPC procedure at all. `@disco/auth` therefore
   exports an `AuthorizationError` carrying `code: "UNAUTHORIZED" | "FORBIDDEN"`, and each
   caller maps it: `@disco/trpc` to `new TRPCError({ code })`, the blob route to its
   existing 400 + `error.message` response. **Client-visible behaviour is unchanged** —
   the route already threw `new Error("Unauthorized")` / `new Error("Forbidden")` with
   those exact messages, and the tRPC mapping deliberately drops the message so the code
   stays the message, as before.

3. **The shared TS base has no DOM lib, and two foundations need one.**
   `@disco/typescript-config/package.json` sets `lib: ["ES2022"]`, so `upload-image.ts`'s
   `new window.Image()` failed to compile the moment it left the app. Added
   `tooling/typescript/tsconfig/browser.json` (DOM + DOM.Iterable + `jsx: react-jsx`) and
   pointed `@disco/storage`, `@disco/query-client` and `@disco/auth` at it. **This is the
   config `@disco/ui` will want** when it arrives. Note `@disco/typescript-config`'s
   `exports` map is explicit — a new tsconfig is invisible until it is listed there.

4. **A "pure vendor seam" package cannot own an auth check.** The `/api/blob/upload`
   token policy is half vendor config (content types, size cap) and half authorization.
   `handleImageUpload` therefore takes an injected `authorize` callback, so `@disco/storage`
   never imports `@disco/auth`. Same dependency-injection shape the services get in Phase 4.

**Also worth recording:**

- **Both lazy `Proxy` clients moved verbatim**, with the commit that introduced each
  (`e130d5d`, `233c125`) named in a comment above them, so the next reader does not
  "clean up" the indirection and rebreak `next build`.
- **`@disco/payments` exposes `createPaymentIntent({ amountInPence, metadata })`.** Every
  payment this app takes is GBP, so the currency stopped being a parameter; the two
  routers that create intents no longer name it.
- **`getUserProfile(userId)` absorbed three duplicated `clerkClient()` blocks** — in
  `trpc.ts`, `order.ts` and `merch.ts` — that each built `buyerEmail` / `buyerName` the
  same way.
- **`@disco/validators` now owns every router input schema**, so `z` has left every
  router except `post.ts`, which is deleted in Phase 5. Schemas are grouped by domain
  (`event` · `order` · `merch` · `gallery` · `admin`) and re-exported flat.
- **`GalleryAspect` is now declared twice** — as a literal union in `@disco/storage/client`
  (the return type of `detectImageAspect`) and as a zod enum in `@disco/validators`. They
  are structurally identical. Left alone rather than making a vendor seam depend on a
  validator package; worth collapsing if a third declaration ever appears.
- **Three unit tests landed early**, in `@disco/auth`, covering the `hasAdminRole`
  predicate and `AuthorizationError`. The plan puts tests in Phase 4, but the predicate
  was extracted here specifically to make the rule testable without a network, so the
  test came with it.
- **`stripe`, `resend`, `qrcode` and `@types/qrcode` are gone from `apps/nextjs`.**
  `@vercel/blob` stays, for one reason only: `migrate-images-to-blob.ts` still calls `put`.
  That script is spent (the Blob migration shipped in `369c535`) and its only import,
  `gallery-data.ts`, has no other consumer — **delete both in Phase 6**, and the app's last
  direct blob import goes with them.
- **No `@source` directives yet.** Still nothing in `packages/` that contains a Tailwind
  class. This becomes real only if `@disco/ui` is created.


### Phase 4 — Services ✅ (one manual gate outstanding)

`@disco/ticketing-service` and `@disco/merch-service`. **27 tests, no database, no
network.** `pnpm verify` green; the build emits the same routes.

The webhook route went from 140 lines of inline transaction work to 50 lines that
verify a signature, branch on `metadata.type`, and delegate:

```ts
await db.transaction(async (tx) => {
  await fulfilTicketPayment(payment, {
    store: createDrizzleTicketStore(tx),
    sendConfirmation: sendTicketConfirmation,
  });
});
```

**The deps shape changed, and it is the reason the tests are cheap.** The plan said
both services "take their DB transaction and email sender as injected `deps`". Injecting
a raw Drizzle transaction would have meant faking Drizzle's fluent builder in every test —
`select().from().where().for("update")` — which tests the mock, not the fulfilment. So
each service declares a **narrow store port** instead: five methods for tickets, four for
merch, each named for the thing it does (`findOrderIdByPaymentIntent`, `lockEvent`,
`incrementTicketsSold`). `createDrizzleTicketStore(tx)` / `createDrizzleMerchStore(tx)`
are the only implementations that ship, and they still run inside the caller's
transaction, so the atomicity is unchanged. The email sender is injected as the plan said.

**Three further deviations:**

1. **The guards return a problem; they do not throw.** A service that throws `TRPCError`
   drags tRPC into the service layer, and every call site then needs a try/catch. Each
   guard returns `{ code, message } | null` — deliberately `TRPCError`'s constructor
   argument — so a router reads `if (problem) throw new TRPCError(problem)`. No error
   classes, no mapping layer, and the messages are pinned by tests.

2. **`checkTicketPurchase` returns the order total on success.** Returning a bare
   problem forced `event.priceInPence!` at the call site, re-introducing an assertion the
   original code did not need (it narrowed through the inline `if`). The check now returns
   `{ ok: true, totalInPence }`, computed at the one point where the nullable price has
   been proven present, so the `!` is gone. Merch needs no equivalent — `priceInPence` is
   `notNull` on `merchItems`.

3. **The plan put the capacity guard in `event.ts`. It is in `order.ts`** —
   `orderRouter.createCheckoutSession`, alongside the status, price and per-order checks.
   `event.ts` never had one. All four moved together.

**Also:**

- **`fulfil*Payment` returns a result** (`already-fulfilled` / `event-missing` /
  `fulfilled`) where the inline code used bare `return`. The webhook ignores it; the tests
  assert on it. No behavioural change.
- **The `!` assertions on Stripe metadata moved verbatim** into
  `parse*PaymentMetadata`. They are load-bearing under `noUncheckedIndexedAccess`, and
  every field is written by our own `createCheckoutSession`. Softening them to `?? ""`
  would insert empty strings where the original would have failed loudly.
- **`uuid` and `@types/uuid` left `apps/nextjs`** for `@disco/ticketing-service`.
  `generateTicketCodes(quantity, generate = uuidv4)` takes the generator as an optional
  argument so the fulfilment tests get deterministic codes; production never passes it.
- **`formatEventDate` is pinned with and without `event.day`** — `"Saturday, 21 June 2026"`
  vs `"21 June 2026"` — which was the fiddliest thing to get right in the confirmation
  email payload.

**Outstanding manual gate — the Stripe CLI replay.** Not run. It writes to the live
database and sends a real confirmation email, so it needs a person's say-so, not an
agent's:

```sh
pnpm --filter @disco/nextjs dev
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

Note that a bare `stripe trigger` sends **no `metadata`**, so it lands in the ticket
branch with `eventId: NaN`, finds no event row, and bails — which exercises the signature
check and the `event-missing` path but not fulfilment. To exercise fulfilment properly,
drive a real test-mode checkout through the UI, or replay a captured event with
`stripe events resend <id>`. The row and email should be identical to `main`'s.


### Phase 5 — Features ✅

Five packages, one router each: `@disco/events-feature`, `@disco/orders-feature`,
`@disco/merch-feature`, `@disco/gallery-feature`, `@disco/admin-feature`. Every router
moved by `git mv` **with no edit to its body** — Phases 3 and 4 had already rewritten
their imports and pulled their logic out, so this phase is pure relocation. `pnpm verify`
green; the build emits the same 31 routes.

`postRouter` and `src/app/_components/post.tsx` deleted. `grep` for `postRouter`,
`LatestPost` and `api.post` across `apps` and `packages` returns nothing. **The `posts`
table stays in `schema.ts`** — `db:push` runs on every deploy, so removing it would drop
a live table. See [Dead code](#dead-code).

**The `declaration: true` hazard flagged in Phase 1 did not materialise.** The concern
was that a feature package re-exporting an inferred tRPC router type would hit the same
"cannot be named portably" error that broke `createTRPCReact<AppRouter>()`. It did not:
`noEmit: true` in `@disco/typescript-config/package.json` means TypeScript never has to
name those types. Left as-is. **If a package ever sets `noEmit: false`, this comes back.**

**The app's server directory is nearly empty now.** All that remains under
`apps/nextjs/src/server/` is `api/root.ts` — which becomes `@disco/api` in Phase 6 — and
`db/migrate-images-to-blob.ts`, the spent one-off queued for deletion.

**Outstanding manual gate:** click through every admin screen and both checkout flows.
Not automatable here; the build and the type-checked router surface are the automated half.


### Phase 6 — Composition and cleanup ✅

`@disco/api` owns `appRouter`, `createCaller` and the `AppRouter` type;
`apps/nextjs/src/trpc/{react.tsx,server.ts}` and `/api/trpc/[trpc]` import it.
`transpilePackages` lists all 17 `@disco/*` packages. `pnpm verify` green, 18 packages,
30 routes, `pnpm boundaries` green.

**`apps/nextjs/src/server/` is gone entirely.** Nothing server-side is left in the app but
the three route handlers under `src/app/api/`, each of which is now a thin adapter.

**Deleted:** `migrate-images-to-blob.ts` and `gallery/gallery-data.ts` (its only import,
106 lines of hard-coded photo metadata). The Blob migration shipped in `369c535` and both
files were reachable only from the `db:migrate-images` script, which is also gone. They
are in git history if the migration ever needs replaying. **This dropped `@vercel/blob`
from the app's dependencies** — the last direct vendor import outside a foundation.

**Plan item 4 turned out to be a no-op.** "Remove the now-unused `~/*` alias targets" —
every surviving `~/` import is app-internal (`~/trpc/react` ×16, `~/app/_components/*`
×19, `~/trpc/server` ×7). There were no stale targets to remove; the alias earns its keep.

**Plan item 5, partially a no-op:** `*.tsbuildinfo` and `.next/` are both gitignored
already, so there was nothing tracked to delete. The stale local `tsconfig.tsbuildinfo`
was removed from disk.

**`transpilePackages` is a hand-maintained list of 17 strings.** Adding an 18th package
and forgetting to list it fails at build time with a confusing parse error, not a clear
one. Deriving it from `pnpm-workspace.yaml` is possible but was judged more machinery than
the risk warrants. Worth revisiting if the package count keeps growing.

`README.md` rewritten for the pnpm/turbo workflow, the layer graph and the vendor seams,
including the warning that `db:push` runs on every deploy.

---

## Before merging

The automated gates are all green — `pnpm verify` covers lint, boundaries, 30 tests,
typecheck and build across 18 packages. Three things need a person:

1. **A green Vercel preview deploy of this branch.** Everything since Phase 1 has only
   been proven locally. Before that first preview, **check whether `DATABASE_URL` is set
   at project scope or per-environment** — if it is project-scoped, the preview's
   `db:push` runs against production. The schema has stayed byte-identical through every
   phase, so a push is a no-op, but verify rather than discover.
2. **The Stripe CLI replay**, described under [Phase 4](#phase-4--services-tests-first-).
   The signature path and the `event-missing` path are cheap to exercise; a real test-mode
   checkout through the UI is what actually proves fulfilment end to end.
3. **A click-through of every admin screen and both checkout flows** — the Phase 5 gate.

Then: `/code-review` on the branch, delete this file, and merge.


## Test seams

Pure logic, Vitest, no DB / Stripe / Resend. **All eight are covered as of Phase 4** — 27
tests in the two services plus 3 in `@disco/auth`. The auth predicates landed early, in
Phase 3, with the code they pin.

| Seam | What it pins |
|---|---|
| `fulfilMerchPayment` | Branching on `metadata.type`; existing order → no-op (idempotency); `merchSizes.sold` increment equals quantity |
| `fulfilTicketPayment` | Idempotency; missing event row → bail; `events.ticketsSold` increment; one ticket row per unit of quantity |
| Ticket codes | `codes.length === quantity`, all unique |
| Stock guard | `size.stock - size.sold < quantity` → `CONFLICT` |
| Order guards | `quantity > item.maxPerOrder` → `BAD_REQUEST`; non-`available` status → `BAD_REQUEST` |
| Totals | `totalInPence === item.priceInPence * quantity` |
| Email payloads | Ticket and merch confirmation argument shape, including the `en-GB` date formatting with and without `event.day` |
| Auth predicates | `requireAdmin` on `publicMetadata.role !== "admin"` → `FORBIDDEN`; missing `userId` → `UNAUTHORIZED` |

---

## Dead code

- **`postRouter`** (`src/server/api/routers/post.ts`, 30 lines) — delete in Phase 5.
- **`LatestPost`** (`src/app/_components/post.tsx`) — imported nowhere. Delete in Phase 5.
- **The `posts` table** — **keep it in `schema.ts` for now.** There are no migrations,
  and **`db:push` runs as part of the Vercel build command on every deploy**, so removing
  the table from the schema would make the next *deploy* drop a live table — no manual
  step required, no confirmation prompt. Mark it deprecated in a comment and drop it in a separate,
  deliberate PR after the refactor merges.

---

## Risks

| Risk | Why it bites | Mitigation |
|---|---|---|
| **Vercel deploy config** | Root directory, install command and build command all change. `.vercel/repo.json` pins `"directory": "."`. | Verified by the Phase 1 gate, before any code restructuring compounds on it. |
| **Stripe webhook path** | `/api/webhooks/stripe` is registered in the live Stripe dashboard. A changed path means production payments silently stop confirming. | Explicit Phase 1 check; Phase 4 gate replays a real event via the Stripe CLI. |
| **Live database** | Real orders. The `disco-soulstice_` prefix and every column name must survive untouched. | Schema moves byte-identical in Phase 2. |
| **`db:push` runs on every deploy** | The Vercel build command is `db:push && build`, so schema changes reach production as unreviewed DDL. Dropping `posts` from the schema would drop a live table. | Schema stays byte-identical through every phase; `posts` stays in `schema.ts`; `apps/nextjs` keeps a delegating `db:push` script so the build command never changes. |
| **`@t3-oss/env-nextjs` in a package** | `NEXT_PUBLIC_*` vars are inlined at build time. Reading them from inside a workspace package only works if the package is in `transpilePackages`. | Every `@disco/*` package goes in `transpilePackages` (Phase 6), but check the client vars resolve as soon as `@disco/env` exists (Phase 2). |
| **Tailwind cross-package content** | Tailwind 4 does not scan workspace dependencies — they resolve through `node_modules`, which it excludes. Classes in `@disco/ui` silently produce no CSS and the build still passes. | `@source` directives added in Phase 2, before any component moves into a package. |
| **Tailwind 4.0 → 4.3 bump** | Three minor versions of a young major. Utility output can shift subtly; this app leans on a hand-rolled `@theme inline` token block in `globals.css`. | Bumped alone in Phase 0, with nothing else changing, so a visual diff is attributable. |
| **Type-checked ESLint across a workspace** | `projectService` behaves differently per-package than in a single-package repo; the drizzle plugin rules need `ctx.db` still recognised. | Proven in Phase 0 on the empty workspace, when nothing else can be blamed. |
| **Lazy Stripe/Resend regression** | Eager module-level clients break `next build`. Easy to "clean up" the `Proxy` while porting. | Called out at the seam. The `Proxy` moves verbatim. |
| **Big-bang PR** | The whole app moves at once. | Phase gates keep every commit deployable, so the PR is large but bisectable. |

---

## Reference

**Current stack:** Next.js 15.2.3 (App Router), React 19, TypeScript 5.8, tRPC 11,
Drizzle 0.41 / Postgres (Vercel), Tailwind 4.3, Clerk 7, Stripe 20, Resend 6,
Vercel Blob 2. Path alias `~/*` → `./src/*`.

**What moves:** 64 files, 7,546 lines. Routers 847 · schema 315 · tRPC infra 125 ·
email 115 · 31 route files · 6 shared components · 3 API routes · 14 env vars.

**Starter scripts:** `pnpm dev` · `build` · `lint` · `test` · `typecheck` ·
`boundaries` · `verify` (= lint + boundaries + test + typecheck + build).

**Local paths:** this repo `~/Projects/disco-soulstice` · starter `~/Projects/turborepo-starter`.

---

## Optional: run this through the planning skills

**`/wayfinder` is skipped.** Its job is to resolve the decision map, and the map is
resolved — see [Resolved decisions](#resolved-decisions). This file *is* the wayfinder
output.

The plan above is implementable as-is. If you'd rather drive it through the rest of the
Matt Pocock skill chain, those skills are user-invocation only — type them yourself:

| # | Command | Purpose |
|---|---------|---------|
| 0 | `/setup-matt-pocock-skills` | Writes `CLAUDE.md` + `docs/agents/`. Answers: GitHub tracker (`MurrayMint7/disco-soulstice`) · default triage labels · single-context domain docs · create `CLAUDE.md`. |
| 1 | `/to-spec` | Synthesise this file into a spec on GitHub Issues. |
| 2 | `/to-tickets` | Break the spec into tickets, one per phase, with blocking edges. |
| 3 | `/implement` | Execute, TDD at the seams listed above. |
| 4 | `/code-review` | Review the branch before the PR merges. |
