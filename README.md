# Disco Soulstice

Event ticketing and merch platform for Disco Soulstice.

## Stack

- **Framework** — Next.js 15 (App Router)
- **Auth** — Clerk
- **Database** — PostgreSQL via Drizzle ORM
- **API** — tRPC
- **Payments** — Stripe
- **Email** — Resend
- **Analytics** — Vercel Analytics
- **Deployment** — Vercel
- **Monorepo** — pnpm workspaces + Turborepo

## Features

- Event listings with ticket purchasing via Stripe
- QR code ticket confirmation emails via Resend
- Merch store with order management
- Admin dashboard (events, orders, merch, merch orders)
- Clerk-protected sign in / sign up

## Layout

Packages depend downwards only — an app may import anything, a foundation may
import nothing but tooling. `pnpm boundaries` enforces it.

```txt
apps/nextjs                  the Next.js app: routes, pages, middleware
packages/compositions/api    appRouter — the one place routers are composed
packages/features/*          one tRPC router each: events orders merch gallery admin
packages/services/*          ticketing and merch fulfilment, guards, email payloads
packages/foundations/*       env db auth payments email storage validators trpc query-client
tooling/*                    shared eslint, prettier, tailwind, typescript, vitest config
```

Each vendor lives behind exactly one foundation: Clerk in `@disco/auth`, Stripe in
`@disco/payments`, Resend in `@disco/email`, Vercel Blob in `@disco/storage`, Drizzle in
`@disco/db`.

## Getting Started

```bash
pnpm install
pnpm dev
```

### Environment Variables

Copy `apps/nextjs/.env.example` to `apps/nextjs/.env` and fill in:

- `DATABASE_URL` — PostgreSQL connection string
- `CLERK_SECRET_KEY` / `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`

`@disco/env` validates them at boot; set `SKIP_ENV_VALIDATION=1` to bypass, as CI does.

### Scripts

Run from the repo root; Turborepo fans them out across the workspace.

```bash
pnpm dev          # next dev
pnpm build        # next build
pnpm lint         # eslint, every package
pnpm test         # vitest, every package
pnpm typecheck    # tsc --noEmit, every package
pnpm boundaries   # enforce the layer graph
pnpm verify       # all five, in that order — what CI runs
```

### Database

The schema lives in `@disco/db`; `drizzle.config.ts` stays in `apps/nextjs` because
that is where `.env` is.

```bash
pnpm --filter @disco/nextjs db:push    # push schema to DB — also runs on every deploy
pnpm --filter @disco/nextjs db:seed    # seed initial data
pnpm --filter @disco/nextjs db:studio  # open Drizzle Studio
```

> `db:push` applies DDL directly, with no migration file and no review step. It runs as
> part of Vercel's build command, so a schema change reaches production the moment a
> deploy does.
