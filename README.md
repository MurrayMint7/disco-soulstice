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

## Features

- Event listings with ticket purchasing via Stripe
- QR code ticket confirmation emails via Resend
- Merch store with order management
- Admin dashboard (events, orders, merch, merch orders)
- Clerk-protected sign in / sign up

## Getting Started

```bash
npm install
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` — PostgreSQL connection string
- `CLERK_SECRET_KEY` / `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`

### Database

```bash
npm run db:push    # push schema to DB
npm run db:seed    # seed initial data
npm run db:studio  # open Drizzle Studio
```
