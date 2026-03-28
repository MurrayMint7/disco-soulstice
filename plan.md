# Disco Soulstice — Ticket Purchasing System: Implementation Plan

## Overview

Add a full ticket purchasing system to the existing Next.js 15 + TypeScript + tRPC + Drizzle ORM + PostgreSQL site. Users can browse events without an account, but must sign in via Clerk to purchase tickets. Payments are handled by Stripe. A QR code confirmation email is sent via Resend after successful payment. Admins can manage events and view orders via a dashboard at `/admin`.

---

## Current Stack (Do Not Change)

- **Next.js 15.2.3** (App Router), React 19, TypeScript
- **tRPC 11** for API layer — all new API procedures go in tRPC routers
- **Drizzle ORM 0.41.0** with PostgreSQL (Neon-hosted, `DATABASE_URL` in `.env`)
- **Tailwind CSS 4** for styling
- Path alias: `~/*` → `./src/*`
- Table prefix convention: `disco-soulstice_` (see `drizzle.config.ts`)

### Reference Pattern for tRPC Routers
All new routers must follow the pattern in `src/server/api/routers/post.ts`.

---

## External Service Setup

### 1. Stripe Setup

1. Go to [stripe.com](https://stripe.com) and create an account
2. In the Stripe dashboard, go to **Developers → API keys**
3. Copy your **Publishable key** (`pk_test_...`) and **Secret key** (`sk_test_...`)
4. To get the webhook secret for local development:
   - Install the Stripe CLI: `brew install stripe/stripe-cli/stripe-cli` (or download from stripe.com/docs/stripe-cli)
   - Run `stripe login`
   - Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - The CLI will print a **webhook signing secret** (`whsec_...`) — copy it
5. For production (Vercel deployment):
   - In the Stripe dashboard, go to **Developers → Webhooks → Add endpoint**
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events to listen for: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the **Signing secret** from the webhook details

### 2. Resend Setup

1. Go to [resend.com](https://resend.com) and create an account
2. Go to **API Keys → Create API Key** — copy it
3. Go to **Domains → Add Domain** — add and verify your domain (required for production)
   - For development/testing, you can send from `onboarding@resend.dev` to your own email
4. Copy the API key

### 3. Clerk Setup

1. Go to your existing Clerk dashboard and create a new application for this project
2. Go to **API Keys** — copy the **Publishable key** and **Secret key**
3. Under **User & Authentication → Email, Phone, Username** — enable email/password as sign-in method
4. To set a user as admin:
   - Go to **Users** in the Clerk dashboard
   - Click on the admin user
   - Under **Metadata → Public metadata**, set: `{ "role": "admin" }`

---

## Step 1: Install Packages

```bash
npm install stripe @stripe/stripe-js @clerk/nextjs resend qrcode uuid
npm install -D @types/qrcode @types/uuid
```

---

## Step 2: Environment Variables

### Add to `.env`

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Clerk
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/events
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/events

# Resend
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Update `src/env.js`

Add to the `server` object:
```js
STRIPE_SECRET_KEY: z.string(),
STRIPE_WEBHOOK_SECRET: z.string(),
CLERK_SECRET_KEY: z.string(),
RESEND_API_KEY: z.string(),
```

Add to the `client` object:
```js
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/sign-in"),
NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/sign-up"),
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default("/events"),
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default("/events"),
NEXT_PUBLIC_APP_URL: z.string().url(),
```

Add corresponding `runtimeEnv` entries mapping each to `process.env.XXX`.

---

## Step 3: Database Schema

### Update `src/server/db/schema.ts`

Add the following to the existing schema file (keep the existing `posts` table).

#### Enums

```ts
import { pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const eventStatusEnum = pgEnum("disco-soulstice_event_status", [
  "on-sale",
  "coming-soon",
  "sold-out",
  "free-event",
]);

export const orderStatusEnum = pgEnum("disco-soulstice_order_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);
```

#### Events Table

```ts
export const events = createTable(
  "event",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    title: d.varchar({ length: 256 }).notNull(),
    slug: d.varchar({ length: 256 }).notNull().unique(),
    date: d.timestamp({ withTimezone: true }).notNull(),
    day: d.varchar({ length: 64 }),             // e.g. "Good Friday"
    time: d.varchar({ length: 128 }).notNull(), // e.g. "4:00 PM — 10:00 PM"
    venue: d.varchar({ length: 256 }).notNull(),
    location: d.varchar({ length: 256 }).notNull(),
    description: d.text().default(""),
    image: d.varchar({ length: 1024 }).notNull(),
    status: eventStatusEnum().notNull().default("coming-soon"),
    priceInPence: d.integer(),    // null for free events; price stored in pence (e.g. 1000 = £10.00)
    totalTickets: d.integer(),    // null for free events; max capacity
    ticketsSold: d.integer().notNull().default(0),
    maxPerOrder: d.integer().notNull().default(4),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("event_slug_idx").on(t.slug),
    index("event_status_idx").on(t.status),
    index("event_date_idx").on(t.date),
  ],
);
```

#### Orders Table

```ts
export const orders = createTable(
  "order",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    clerkUserId: d.varchar({ length: 256 }).notNull(),
    eventId: d.integer().notNull().references(() => events.id),
    quantity: d.integer().notNull(),
    totalInPence: d.integer().notNull(),
    status: orderStatusEnum().notNull().default("pending"),
    stripePaymentIntentId: d.varchar({ length: 256 }).unique(),
    buyerEmail: d.varchar({ length: 256 }).notNull(),
    buyerName: d.varchar({ length: 256 }).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("order_clerk_user_idx").on(t.clerkUserId),
    index("order_event_idx").on(t.eventId),
    index("order_stripe_pi_idx").on(t.stripePaymentIntentId),
  ],
);
```

#### Tickets Table

```ts
export const tickets = createTable(
  "ticket",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    orderId: d.integer().notNull().references(() => orders.id),
    eventId: d.integer().notNull().references(() => events.id),
    ticketCode: d.uuid().notNull().unique(), // UUID used as QR code payload
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("ticket_order_idx").on(t.orderId),
    index("ticket_event_idx").on(t.eventId),
    index("ticket_code_idx").on(t.ticketCode),
  ],
);
```

#### Relations

```ts
export const eventsRelations = relations(events, ({ many }) => ({
  orders: many(orders),
  tickets: many(tickets),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  event: one(events, { fields: [orders.eventId], references: [events.id] }),
  tickets: many(tickets),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  order: one(orders, { fields: [tickets.orderId], references: [orders.id] }),
  event: one(events, { fields: [tickets.eventId], references: [events.id] }),
}));
```

### Run Migrations

```bash
npm run db:generate
npm run db:migrate
```

---

## Step 4: Seed Existing Events

### Create `src/server/db/seed.ts`

This migrates the hardcoded event data into the database. Read the current `src/app/events/page.tsx` to get the exact existing event data, then insert it:

```ts
import { db } from "~/server/db";
import { events } from "~/server/db/schema";

async function main() {
  await db.insert(events).values([
    {
      title: "The Groove Assembly",
      slug: "the-groove-assembly",
      date: new Date("2026-04-03T16:00:00Z"),
      day: "Good Friday",
      time: "4:00 PM — 10:00 PM",
      venue: "Wakefield Exchange",
      location: "Union Street, WF1 3AD",
      description: "A crew of crate-diggers...", // use the full description from the page
      image: "https://dnm1fy55wi.ufs.sh/f/nVG6HkSaVLokTAI2x7QJuA96T2DW1tbyHYd0lfKx8znBs7cI",
      status: "free-event",
      priceInPence: null,
      totalTickets: null,
      maxPerOrder: 4,
    },
    // Add the commented-out second event here too with status: "coming-soon"
  ]);
  console.log("Seeded events successfully");
}

main().catch(console.error);
```

### Add to `package.json` scripts

```json
"db:seed": "tsx src/server/db/seed.ts"
```

Run: `npm run db:seed`

---

## Step 5: Clerk Authentication

### Create `src/middleware.ts`

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/checkout(.*)",
  "/orders(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### Update `src/app/layout.tsx`

Wrap the existing providers with `<ClerkProvider>`:

```tsx
import { ClerkProvider } from "@clerk/nextjs";

// Wrap children:
<ClerkProvider>
  <TRPCReactProvider>
    {children}
  </TRPCReactProvider>
</ClerkProvider>
```

### Create Auth Pages

**`src/app/sign-in/[[...sign-in]]/page.tsx`**
```tsx
import { SignIn } from "@clerk/nextjs";
export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignIn />
    </main>
  );
}
```

**`src/app/sign-up/[[...sign-up]]/page.tsx`**
```tsx
import { SignUp } from "@clerk/nextjs";
export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignUp />
    </main>
  );
}
```

### Update `src/server/api/trpc.ts`

Add Clerk auth to the tRPC context and create new procedure types:

```ts
import { auth, clerkClient } from "@clerk/nextjs/server";

// In createTRPCContext, add:
const { userId } = await auth();
return { db, userId };

// New authedProcedure — requires signed-in user
export const authedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

// New adminProcedure — requires admin role in Clerk publicMetadata
export const adminProcedure = authedProcedure.use(async ({ ctx, next }) => {
  const client = await clerkClient();
  const user = await client.users.getUser(ctx.userId);
  if (user.publicMetadata?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});
```

### Update Header (`src/app/_components/header.tsx`)

Add sign-in/out UI. Import `SignedIn`, `SignedOut`, `UserButton`, `SignInButton` from `@clerk/nextjs` and add them to the header navigation.

---

## Step 6: Stripe Server Client

### Create `src/server/stripe.ts`

```ts
import Stripe from "stripe";
import { env } from "~/env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});
```

---

## Step 7: tRPC Routers

### Create `src/server/api/routers/event.ts`

```ts
import { createTRPCRouter, publicProcedure, adminProcedure } from "~/server/api/trpc";
import { events } from "~/server/db/schema";
import { z } from "zod";
import { eq, asc } from "drizzle-orm";

export const eventRouter = createTRPCRouter({
  // Public: list all events ordered by date
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(events).orderBy(asc(events.date));
  }),

  // Public: get single event by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db
        .select()
        .from(events)
        .where(eq(events.slug, input.slug))
        .limit(1);
      if (!event[0]) throw new TRPCError({ code: "NOT_FOUND" });
      return event[0];
    }),

  // Admin: create event
  create: adminProcedure
    .input(z.object({
      title: z.string(),
      slug: z.string(),
      date: z.date(),
      day: z.string().optional(),
      time: z.string(),
      venue: z.string(),
      location: z.string(),
      description: z.string().optional(),
      image: z.string().url(),
      status: z.enum(["on-sale", "coming-soon", "sold-out", "free-event"]),
      priceInPence: z.number().int().positive().optional(),
      totalTickets: z.number().int().positive().optional(),
      maxPerOrder: z.number().int().positive().default(4),
    }))
    .mutation(async ({ ctx, input }) => {
      const [event] = await ctx.db.insert(events).values(input).returning();
      return event;
    }),

  // Admin: update event
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      // same fields as create but all optional
      title: z.string().optional(),
      slug: z.string().optional(),
      date: z.date().optional(),
      day: z.string().optional(),
      time: z.string().optional(),
      venue: z.string().optional(),
      location: z.string().optional(),
      description: z.string().optional(),
      image: z.string().url().optional(),
      status: z.enum(["on-sale", "coming-soon", "sold-out", "free-event"]).optional(),
      priceInPence: z.number().int().positive().nullable().optional(),
      totalTickets: z.number().int().positive().nullable().optional(),
      maxPerOrder: z.number().int().positive().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [event] = await ctx.db
        .update(events)
        .set(data)
        .where(eq(events.id, id))
        .returning();
      return event;
    }),

  // Admin: delete event
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(events).where(eq(events.id, input.id));
    }),
});
```

### Create `src/server/api/routers/order.ts`

```ts
import { createTRPCRouter, authedProcedure } from "~/server/api/trpc";
import { orders, events, tickets } from "~/server/db/schema";
import { stripe } from "~/server/stripe";
import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";

export const orderRouter = createTRPCRouter({
  // Creates a Stripe PaymentIntent and a pending order row
  createCheckoutSession: authedProcedure
    .input(z.object({
      eventId: z.number(),
      quantity: z.number().int().min(1).max(4),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get buyer details from Clerk
      const client = await clerkClient();
      const user = await client.users.getUser(ctx.userId);
      const buyerEmail = user.emailAddresses[0]?.emailAddress ?? "";
      const buyerName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

      return ctx.db.transaction(async (tx) => {
        // Lock the event row to prevent race conditions
        const [event] = await tx
          .select()
          .from(events)
          .where(eq(events.id, input.eventId))
          .for("update");

        if (!event) throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
        if (event.status !== "on-sale") throw new TRPCError({ code: "BAD_REQUEST", message: "Event is not on sale" });
        if (!event.priceInPence || !event.totalTickets) throw new TRPCError({ code: "BAD_REQUEST", message: "Event has no ticket price" });
        if (input.quantity > event.maxPerOrder) throw new TRPCError({ code: "BAD_REQUEST", message: `Maximum ${event.maxPerOrder} tickets per order` });

        const remaining = event.totalTickets - event.ticketsSold;
        if (remaining < input.quantity) throw new TRPCError({ code: "CONFLICT", message: "Not enough tickets available" });

        const totalInPence = event.priceInPence * input.quantity;

        // Create Stripe PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: totalInPence,
          currency: "gbp",
          metadata: {
            eventId: event.id.toString(),
            quantity: input.quantity.toString(),
            clerkUserId: ctx.userId,
          },
        });

        // Insert pending order
        const [order] = await tx.insert(orders).values({
          clerkUserId: ctx.userId,
          eventId: event.id,
          quantity: input.quantity,
          totalInPence,
          status: "pending",
          stripePaymentIntentId: paymentIntent.id,
          buyerEmail,
          buyerName,
        }).returning();

        return {
          clientSecret: paymentIntent.client_secret,
          orderId: order!.id,
        };
      });
    }),

  // Get current user's orders
  getMyOrders: authedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(orders)
      .where(eq(orders.clerkUserId, ctx.userId))
      .leftJoin(events, eq(orders.eventId, events.id))
      .orderBy(sql`${orders.createdAt} desc`);
  }),

  // Get a single order (must belong to current user)
  getById: authedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ ctx, input }) => {
      const [order] = await ctx.db
        .select()
        .from(orders)
        .where(and(eq(orders.id, input.orderId), eq(orders.clerkUserId, ctx.userId)))
        .leftJoin(events, eq(orders.eventId, events.id));

      if (!order) throw new TRPCError({ code: "NOT_FOUND" });

      const orderTickets = await ctx.db
        .select()
        .from(tickets)
        .where(eq(tickets.orderId, input.orderId));

      return { ...order, tickets: orderTickets };
    }),
});
```

### Create `src/server/api/routers/admin.ts`

```ts
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { orders, events, tickets } from "~/server/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { z } from "zod";

export const adminRouter = createTRPCRouter({
  // Dashboard stats
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [revenueResult] = await ctx.db
      .select({ total: sql<number>`sum(${orders.totalInPence})` })
      .from(orders)
      .where(eq(orders.status, "completed"));

    const [ordersResult] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.status, "completed"));

    const [ticketsResult] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(tickets);

    return {
      totalRevenueInPence: revenueResult?.total ?? 0,
      totalOrders: ordersResult?.count ?? 0,
      totalTicketsSold: ticketsResult?.count ?? 0,
    };
  }),

  // All orders with event info
  getOrders: adminProcedure
    .input(z.object({ eventId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(orders)
        .leftJoin(events, eq(orders.eventId, events.id))
        .where(input.eventId ? eq(orders.eventId, input.eventId) : undefined)
        .orderBy(desc(orders.createdAt));
    }),

  // Sales breakdown per event
  getEventSales: adminProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      const [event] = await ctx.db
        .select()
        .from(events)
        .where(eq(events.id, input.eventId));

      const eventOrders = await ctx.db
        .select()
        .from(orders)
        .where(eq(orders.eventId, input.eventId))
        .orderBy(desc(orders.createdAt));

      return { event, orders: eventOrders };
    }),
});
```

### Update `src/server/api/root.ts`

```ts
import { eventRouter } from "~/server/api/routers/event";
import { orderRouter } from "~/server/api/routers/order";
import { adminRouter } from "~/server/api/routers/admin";

export const appRouter = createTRPCRouter({
  post: postRouter,
  event: eventRouter,
  order: orderRouter,
  admin: adminRouter,
});
```

---

## Step 8: Resend Email Client

### Create `src/server/resend.ts`

```ts
import { Resend } from "resend";
import { env } from "~/env";

export const resend = new Resend(env.RESEND_API_KEY);
```

### Create `src/server/email/send-ticket-confirmation.ts`

This function is called after a successful payment. It:
1. Generates a QR code image (as a PNG Buffer) for each ticket using `qrcode.toBuffer(ticket.ticketCode)`
2. Attaches the QR code images to the email
3. Sends an HTML email via Resend with event details, order summary, and one QR code per ticket

```ts
import QRCode from "qrcode";
import { resend } from "~/server/resend";

interface SendTicketConfirmationParams {
  buyerEmail: string;
  buyerName: string;
  eventTitle: string;
  eventDate: string;        // human-readable, e.g. "Good Friday, 3 April 2026"
  eventTime: string;
  eventVenue: string;
  eventLocation: string;
  orderId: number;
  quantity: number;
  totalInPence: number;
  ticketCodes: string[];    // array of UUIDs, one per ticket
}

export async function sendTicketConfirmation(params: SendTicketConfirmationParams) {
  const attachments = await Promise.all(
    params.ticketCodes.map(async (code, i) => {
      const buffer = await QRCode.toBuffer(code, { width: 300, margin: 2 });
      return {
        filename: `ticket-${i + 1}.png`,
        content: buffer,
        cid: `ticket-qr-${i}`,
      };
    }),
  );

  const ticketsHtml = params.ticketCodes
    .map(
      (code, i) => `
        <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center;">
          <p style="font-weight: bold; margin-bottom: 8px;">Ticket ${i + 1} of ${params.quantity}</p>
          <img src="cid:ticket-qr-${i}" alt="QR Code" width="200" height="200" />
          <p style="font-family: monospace; font-size: 12px; color: #6b7280; margin-top: 8px;">${code}</p>
        </div>
      `,
    )
    .join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h1 style="font-size: 24px; font-weight: bold;">Your Tickets — ${params.eventTitle}</h1>
      <p>Hi ${params.buyerName},</p>
      <p>Your tickets are confirmed. See you on the dancefloor!</p>

      <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <h2 style="font-size: 18px; margin-bottom: 8px;">Event Details</h2>
        <p><strong>${params.eventTitle}</strong></p>
        <p>${params.eventDate} · ${params.eventTime}</p>
        <p>${params.eventVenue}, ${params.eventLocation}</p>
      </div>

      <div style="margin: 24px 0;">
        <p>Order #${params.orderId} · ${params.quantity} ticket${params.quantity > 1 ? "s" : ""} · £${(params.totalInPence / 100).toFixed(2)}</p>
      </div>

      <h2 style="font-size: 18px;">Your Tickets</h2>
      <p>Present each QR code at the door.</p>
      ${ticketsHtml}
    </div>
  `;

  await resend.emails.send({
    from: "Disco Soulstice <tickets@yourdomain.com>", // update with verified domain
    to: params.buyerEmail,
    subject: `Your tickets for ${params.eventTitle}`,
    html,
    attachments,
  });
}
```

---

## Step 9: Stripe Webhook Handler

### Create `src/app/api/webhooks/stripe/route.ts`

This is a Next.js Route Handler (NOT a tRPC procedure). It receives events from Stripe.

```ts
import { headers } from "next/headers";
import { stripe } from "~/server/stripe";
import { db } from "~/server/db";
import { orders, events, tickets } from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendTicketConfirmation } from "~/server/email/send-ticket-confirmation";
import { v4 as uuidv4 } from "uuid";
import { env } from "~/env";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) return new Response("No signature", { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    await db.transaction(async (tx) => {
      // Find the order
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.stripePaymentIntentId, paymentIntent.id))
        .for("update");

      if (!order || order.status !== "pending") return;

      // Lock the event row
      const [eventRow] = await tx
        .select()
        .from(events)
        .where(eq(events.id, order.eventId))
        .for("update");

      if (!eventRow) return;

      // Update order status
      await tx
        .update(orders)
        .set({ status: "completed" })
        .where(eq(orders.id, order.id));

      // Increment ticketsSold
      await tx
        .update(events)
        .set({ ticketsSold: sql`${events.ticketsSold} + ${order.quantity}` })
        .where(eq(events.id, order.eventId));

      // Insert one ticket per quantity
      const ticketCodes = Array.from({ length: order.quantity }, () => uuidv4());
      await tx.insert(tickets).values(
        ticketCodes.map((code) => ({
          orderId: order.id,
          eventId: order.eventId,
          ticketCode: code,
        })),
      );

      // Send confirmation email
      await sendTicketConfirmation({
        buyerEmail: order.buyerEmail,
        buyerName: order.buyerName,
        eventTitle: eventRow.title,
        eventDate: eventRow.day
          ? `${eventRow.day}, ${new Date(eventRow.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
          : new Date(eventRow.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
        eventTime: eventRow.time,
        eventVenue: eventRow.venue,
        eventLocation: eventRow.location,
        orderId: order.id,
        quantity: order.quantity,
        totalInPence: order.totalInPence,
        ticketCodes,
      });
    });
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    await db
      .update(orders)
      .set({ status: "failed" })
      .where(eq(orders.stripePaymentIntentId, paymentIntent.id));
  }

  return new Response("OK", { status: 200 });
}
```

---

## Step 10: Frontend Pages

### Refactor `src/app/events/page.tsx`

Replace hardcoded event data with a server-side tRPC call. Use `api` from `~/trpc/server`:

```tsx
import { api, HydrateClient } from "~/trpc/server";

export default async function EventsPage() {
  const events = await api.event.list();
  // Render events list — keep all existing styling/layout, just replace the data source
  // The status badge and "Get Tickets" / "Free Entry" logic stays the same
  // "Get Tickets" buttons link to /events/[slug] instead of being non-functional
}
```

Remove the hardcoded `events` array from the file entirely.

### Create `src/app/events/[slug]/page.tsx`

Event detail page. Server component:
- Fetch event via `api.event.getBySlug({ slug: params.slug })`
- Show full event info (image, title, date, venue, description)
- If `status === "free-event"`: show "Free Entry" badge, no purchase option
- If `status === "on-sale"`: show quantity selector (1–maxPerOrder, can't exceed remaining tickets) and a "Get Tickets" button linking to `/checkout/[slug]`
- If `status === "coming-soon"` or `"sold-out"`: show appropriate badge only
- Show remaining ticket count if applicable

### Create `src/app/checkout/[eventSlug]/page.tsx`

Client component (`"use client"`). Protected by middleware. Contains:

1. Fetch event data
2. Quantity selector state (1 to min(maxPerOrder, remaining))
3. Order total display (`quantity × priceInPence / 100`)
4. On "Proceed to Pay":
   - Call `api.order.createCheckoutSession.mutate({ eventId, quantity })`
   - Receive `clientSecret` back
   - Initialize Stripe Elements with the `clientSecret`
   - Render `<PaymentElement />` from `@stripe/react-stripe-js`
5. On payment form submit:
   - Call `stripe.confirmPayment({ return_url: env.NEXT_PUBLIC_APP_URL + "/orders/" + orderId })`
   - Stripe redirects to the return URL on success

```tsx
"use client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { env } from "~/env";

const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Two-step flow:
// Step 1: quantity selector + "Proceed to Pay" → creates PaymentIntent → shows Stripe Elements
// Step 2: Stripe Elements form → confirm payment → redirect to /orders/[orderId]
```

### Create `src/app/orders/[orderId]/page.tsx`

Order confirmation page. Server component. Protected by middleware:
- Fetch order via `api.order.getById({ orderId })`
- Show order status
- If completed: show "Payment successful" message and note that tickets were emailed
- Show event details, order number, quantity, total paid
- Do NOT re-render QR codes here (they're in the email) — just confirm the order

### Create `src/app/orders/page.tsx`

My Orders page. Client component. Protected by middleware:
- Fetch `api.order.getMyOrders()`
- List orders with event name, date, status, quantity, total
- Each order links to `/orders/[orderId]`

---

## Step 11: Admin Dashboard

All admin pages are protected by both the Clerk middleware (`/admin(.*)` route) and the `adminProcedure` in tRPC (which checks `publicMetadata.role === "admin"`).

### Create `src/app/admin/layout.tsx`

Admin layout with sidebar navigation. Client component. Include `<Protect>` from `@clerk/nextjs` as a UI-layer guard (note: the real enforcement is in `adminProcedure`):

```tsx
import { Protect } from "@clerk/nextjs";

export default function AdminLayout({ children }) {
  return (
    <Protect
      condition={(has) => has({ permission: "org:admin" }) || /* check publicMetadata */ true}
      fallback={<p>Access denied.</p>}
    >
      <div className="flex min-h-screen">
        {/* Sidebar with links to /admin, /admin/events, /admin/orders */}
        <aside>...</aside>
        <main>{children}</main>
      </div>
    </Protect>
  );
}
```

Actually, since admin role is via `publicMetadata` not Clerk org permissions, the simpler approach is: render the layout normally; the tRPC procedures will reject non-admin requests, so unauthorized users see empty pages. Keep the middleware as the primary access gate.

### Create `src/app/admin/page.tsx`

Dashboard overview:
- Call `api.admin.getStats()`
- Display: Total Revenue (formatted as £), Total Orders, Total Tickets Sold
- List upcoming events with their individual ticket sales (ticketsSold / totalTickets)

### Create `src/app/admin/events/page.tsx`

Events management:
- Call `api.event.list()`
- Table of events with columns: Title, Date, Status, Tickets Sold, Price, Actions
- Actions: Edit (links to `/admin/events/[id]/edit`) and Delete (calls `api.event.delete`)
- "Add Event" button linking to `/admin/events/new`

### Create `src/app/admin/events/new/page.tsx`

Create event form:
- All event fields (title, slug, date, day, time, venue, location, description, image URL, status, price, total tickets, max per order)
- Auto-generate slug from title as user types
- Submit calls `api.event.create`
- On success, redirect to `/admin/events`

### Create `src/app/admin/events/[id]/edit/page.tsx`

Edit event form:
- Pre-populate from `api.event.getBySlug` or add a `getById` admin procedure
- Same fields as create form
- Submit calls `api.event.update`

### Create `src/app/admin/orders/page.tsx`

Orders management:
- Call `api.admin.getOrders()`
- Filter by event (dropdown)
- Table: Order ID, Buyer Name, Buyer Email, Event, Quantity, Total, Status, Date
- Highlight failed/pending orders

---

## Step 12: Header Updates

Update `src/app/_components/header.tsx` to add:
- `<SignedOut>`: Show "Sign In" link
- `<SignedIn>`: Show `<UserButton />` (Clerk's user avatar dropdown) and "My Orders" link

---

## Architecture Notes

### Price Storage
All prices are stored as integers in pence (GBP). Example: £12.50 = `1250`. Format for display: `(priceInPence / 100).toFixed(2)`.

### Overselling Prevention
The `createCheckoutSession` and webhook both use `SELECT ... FOR UPDATE` inside a Drizzle transaction to lock the event row. This prevents two simultaneous purchases from overselling the last remaining tickets.

### Payment Flow
```
User → quantity selector → createCheckoutSession (tRPC) →
  [creates pending order + Stripe PaymentIntent] →
  Stripe Elements UI → confirm payment →
  Stripe redirects to /orders/[orderId] →
  Stripe webhook fires payment_intent.succeeded →
    [order → completed, ticketsSold++, tickets created, email sent]
```

### Ticket Code
Each ticket has a UUID (`ticketCode`). This is what gets encoded in the QR code. It's unique, non-guessable, and future-proof for door scanning.

### Admin Auth
- **Middleware layer**: `/admin(.*)` routes require any signed-in user
- **tRPC layer**: `adminProcedure` checks `publicMetadata.role === "admin"` via Clerk API
- Set admin role in Clerk dashboard: User → Public Metadata → `{ "role": "admin" }`

---

## File Creation Checklist

- [ ] `.env` — add all new environment variables
- [ ] `src/env.js` — register new env vars
- [ ] `src/server/db/schema.ts` — add events, orders, tickets tables + enums + relations
- [ ] `src/server/db/seed.ts` — seed existing events
- [ ] `src/middleware.ts` — Clerk middleware
- [ ] `src/server/stripe.ts` — Stripe client
- [ ] `src/server/resend.ts` — Resend client
- [ ] `src/server/email/send-ticket-confirmation.ts` — email + QR function
- [ ] `src/server/api/routers/event.ts` — event tRPC router
- [ ] `src/server/api/routers/order.ts` — order tRPC router
- [ ] `src/server/api/routers/admin.ts` — admin tRPC router
- [ ] `src/server/api/trpc.ts` — add Clerk auth context + authedProcedure + adminProcedure
- [ ] `src/server/api/root.ts` — register new routers
- [ ] `src/app/layout.tsx` — wrap with ClerkProvider
- [ ] `src/app/_components/header.tsx` — add sign in/out UI
- [ ] `src/app/sign-in/[[...sign-in]]/page.tsx`
- [ ] `src/app/sign-up/[[...sign-up]]/page.tsx`
- [ ] `src/app/events/page.tsx` — refactor to use DB
- [ ] `src/app/events/[slug]/page.tsx` — event detail page
- [ ] `src/app/checkout/[eventSlug]/page.tsx` — Stripe checkout
- [ ] `src/app/orders/page.tsx` — my orders
- [ ] `src/app/orders/[orderId]/page.tsx` — order confirmation
- [ ] `src/app/api/webhooks/stripe/route.ts` — Stripe webhook
- [ ] `src/app/admin/layout.tsx` — admin layout
- [ ] `src/app/admin/page.tsx` — dashboard stats
- [ ] `src/app/admin/events/page.tsx` — events list
- [ ] `src/app/admin/events/new/page.tsx` — create event
- [ ] `src/app/admin/events/[id]/edit/page.tsx` — edit event
- [ ] `src/app/admin/orders/page.tsx` — orders list
- [ ] `package.json` — add `db:seed` script
