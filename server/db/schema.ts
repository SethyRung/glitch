import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { account, session, user } from "#auth/schema";

export const purchaseStatus = pgEnum("purchase_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);

export const games = pgTable("games", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  discountPercent: integer("discount_percent"),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  stock: integer("stock").notNull().default(0),
  developer: text("developer").notNull(),
  publisher: text("publisher").notNull(),
  releaseDate: text("release_date").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  metacriticScore: integer("metacritic_score"),
  positiveReviews: integer("positive_reviews").notNull().default(0),
  negativeReviews: integer("negative_reviews").notNull().default(0),
  platforms: jsonb("platforms").$type<string[]>().notNull().default([]),
  videoUrl: text("video_url"),
  screenshots: jsonb("screenshots").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const purchases = pgTable(
  "purchases",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "restrict" }),
    qty: integer("qty").notNull().default(1),
    pricePaid: numeric("price_paid", { precision: 10, scale: 2 }).notNull(),
    status: purchaseStatus("status").notNull().default("pending"),
    paymentMethod: text("payment_method"),
    paymentReference: text("payment_reference"),
    orderGroupId: text("order_group_id"),
    idempotencyKey: text("idempotency_key"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("purchases_user_id_idx").on(table.userId),
    index("purchases_game_id_idx").on(table.gameId),
    index("purchases_status_idx").on(table.status),
    index("purchases_order_group_id_idx").on(table.orderGroupId),
    uniqueIndex("purchases_user_idempotency_key_uniq")
      .on(table.userId, table.idempotencyKey)
      .where(sql`${table.idempotencyKey} IS NOT NULL`),
  ],
);

/**
 * Extend the auth-managed `user` relations with purchases. The auth plugin's
 * own relations (`sessions`, `accounts`) live in the generated schema, so we
 * redeclare them here to keep both shapes available under `hub:db:schema`.
 */
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  purchases: many(purchases),
}));

export const gameRelations = relations(games, ({ many }) => ({
  purchases: many(purchases),
}));

export const purchaseRelations = relations(purchases, ({ one }) => ({
  user: one(user, {
    fields: [purchases.userId],
    references: [user.id],
  }),
  game: one(games, {
    fields: [purchases.gameId],
    references: [games.id],
  }),
}));
