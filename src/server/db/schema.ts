// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { index, pgTableCreator, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `disco-soulstice_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("name_idx").on(t.name)],
);

// ── Enums ──────────────────────────────────────────────────────────────

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

// ── Events ─────────────────────────────────────────────────────────────

export const events = createTable(
  "event",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    title: d.varchar({ length: 256 }).notNull(),
    slug: d.varchar({ length: 256 }).notNull().unique(),
    date: d.timestamp({ withTimezone: true }).notNull(),
    day: d.varchar({ length: 64 }),
    time: d.varchar({ length: 128 }).notNull(),
    venue: d.varchar({ length: 256 }).notNull(),
    location: d.varchar({ length: 256 }).notNull(),
    description: d.text().default(""),
    image: d.varchar({ length: 1024 }).notNull(),
    status: eventStatusEnum().notNull().default("coming-soon"),
    priceInPence: d.integer(),
    totalTickets: d.integer(),
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

// ── Orders ─────────────────────────────────────────────────────────────

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

// ── Tickets ────────────────────────────────────────────────────────────

export const tickets = createTable(
  "ticket",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    orderId: d.integer().notNull().references(() => orders.id),
    eventId: d.integer().notNull().references(() => events.id),
    ticketCode: d.uuid().notNull().unique(),
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

// ── Relations ──────────────────────────────────────────────────────────

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

// ── Merch Enums ──────────────────────────────────────────────────────

export const merchStatusEnum = pgEnum("disco-soulstice_merch_status", [
  "available",
  "coming-soon",
  "sold-out",
  "discontinued",
]);

// ── Merch Items ──────────────────────────────────────────────────────

export const merchItems = createTable(
  "merch_item",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    title: d.varchar({ length: 256 }).notNull(),
    slug: d.varchar({ length: 256 }).notNull().unique(),
    description: d.text().default(""),
    image: d.varchar({ length: 1024 }).notNull(),
    priceInPence: d.integer().notNull(),
    status: merchStatusEnum().notNull().default("coming-soon"),
    maxPerOrder: d.integer().notNull().default(4),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("merch_slug_idx").on(t.slug),
    index("merch_status_idx").on(t.status),
  ],
);

// ── Merch Sizes ──────────────────────────────────────────────────────

export const merchSizes = createTable(
  "merch_size",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    merchItemId: d
      .integer()
      .notNull()
      .references(() => merchItems.id),
    size: d.varchar({ length: 16 }).notNull(),
    stock: d.integer().notNull().default(0),
    sold: d.integer().notNull().default(0),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("merch_size_item_idx").on(t.merchItemId)],
);

// ── Merch Orders ─────────────────────────────────────────────────────

export const merchOrders = createTable(
  "merch_order",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    clerkUserId: d.varchar({ length: 256 }).notNull(),
    merchItemId: d
      .integer()
      .notNull()
      .references(() => merchItems.id),
    merchSizeId: d
      .integer()
      .notNull()
      .references(() => merchSizes.id),
    size: d.varchar({ length: 16 }).notNull(),
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
  }),
  (t) => [
    index("merch_order_user_idx").on(t.clerkUserId),
    index("merch_order_item_idx").on(t.merchItemId),
    index("merch_order_stripe_idx").on(t.stripePaymentIntentId),
  ],
);

// ── Merch Relations ──────────────────────────────────────────────────

export const merchItemsRelations = relations(merchItems, ({ many }) => ({
  sizes: many(merchSizes),
  orders: many(merchOrders),
}));

export const merchSizesRelations = relations(merchSizes, ({ one, many }) => ({
  item: one(merchItems, {
    fields: [merchSizes.merchItemId],
    references: [merchItems.id],
  }),
  orders: many(merchOrders),
}));

export const merchOrdersRelations = relations(merchOrders, ({ one }) => ({
  item: one(merchItems, {
    fields: [merchOrders.merchItemId],
    references: [merchItems.id],
  }),
  sizeRef: one(merchSizes, {
    fields: [merchOrders.merchSizeId],
    references: [merchSizes.id],
  }),
}));

