import {
  boolean,
  date,
  decimal,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const games = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
    discountPercent: integer("discount_percent").default(0),
    imageUrl: varchar("image_url", { length: 500 }),
    screenshots: text("screenshots"), // JSON array of URLs
    category: varchar("category", { length: 100 }),
    tags: text("tags"), // JSON array of tags
    developer: varchar("developer", { length: 255 }),
    publisher: varchar("publisher", { length: 255 }),
    releaseDate: date("release_date"),
    metacriticScore: integer("metacritic_score"),
    positiveReviews: integer("positive_reviews").default(0),
    negativeReviews: integer("negative_reviews").default(0),
    videoUrl: varchar("video_url", { length: 500 }), // Trailer video
    isDLC: boolean("is_dlc").default(false),
    platforms: text("platforms"), // JSON array: ["windows", "mac", "linux"]
    stock: integer("stock").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_games_category").on(table.category),
    index("idx_games_developer").on(table.developer),
    index("idx_games_release_date").on(table.releaseDate),
  ],
);

export const purchases = pgTable(
  "purchases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameId: uuid("game_id").references(() => games.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull().default(1),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    merchantReference: varchar("merchant_reference", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_purchases_user_id").on(table.userId),
    index("idx_purchases_status").on(table.status),
  ],
);

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    token: varchar("token", { length: 500 }).notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    revokedAt: timestamp("revoked_at"),
  },
  (table) => [
    index("idx_refresh_tokens_user_id").on(table.userId),
    index("idx_refresh_tokens_token").on(table.token),
    index("idx_refresh_tokens_expires_at").on(table.expiresAt),
    index("idx_refresh_tokens_revoked_at").on(table.revokedAt),
  ],
);
