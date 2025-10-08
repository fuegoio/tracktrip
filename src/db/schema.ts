import { CategoryTypes } from "@/data/categories";
import {
  boolean,
  pgTable,
  timestamp,
  varchar,
  text,
  uuid,
  integer,
  jsonb,
  date,
  pgEnum,
  real,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const travelsTable = pgTable("travels", {
  id: uuid().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  emoji: varchar({ length: 255 }).notNull(),
  currency: varchar({ length: 255 }).notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const travelsUsersTable = pgTable("travels_users", {
  id: uuid().primaryKey(),
  user: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  travel: uuid()
    .notNull()
    .references(() => travelsTable.id, { onDelete: "cascade" }),
});

export const placesTable = pgTable("places", {
  id: uuid().primaryKey(),
  travel: uuid()
    .notNull()
    .references(() => travelsTable.id, { onDelete: "cascade" }),
  name: text().notNull(),
});

export const categoryTypesEnum = pgEnum("category_types", CategoryTypes);

export const categoriesTable = pgTable("categories", {
  id: uuid().primaryKey(),
  travel: uuid()
    .notNull()
    .references(() => travelsTable.id, { onDelete: "cascade" }),
  name: text().notNull(),
  type: categoryTypesEnum().notNull(),
  emoji: varchar({ length: 255 }).notNull(),
  color: varchar({ length: 255 }).notNull(),
});

export const transactionsTable = pgTable("transactions", {
  id: uuid().primaryKey(),
  travel: uuid()
    .notNull()
    .references(() => travelsTable.id, { onDelete: "cascade" }),
  user: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  date: date({ mode: "date" }).notNull(),
  amount: real().notNull(),
  currency: varchar({ length: 255 }).notNull(),
  title: text().notNull(),
  description: text(),
  type: categoryTypesEnum().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  users: text().array(),

  /*
   * Optional fields
   */
  category: uuid().references(() => categoriesTable.id, {
    onDelete: "set null",
  }),
  place: uuid().references(() => placesTable.id, { onDelete: "set null" }),
  days: integer(),
  meals: integer(),
});

export const budgetsTable = pgTable("budgets", {
  id: uuid().primaryKey(),
  travel: uuid()
    .notNull()
    .references(() => travelsTable.id, { onDelete: "cascade" }),
  categoryType: categoryTypesEnum("category_type"),
  category: uuid().references(() => categoriesTable.id, {
    onDelete: "cascade",
  }),
  amount: real().notNull(),
});

export const eventsTable = pgTable(`events`, {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull(),
  router: varchar({ length: 255 }).notNull(),
  action: varchar({ length: 255 })
    .notNull()
    .$type<"insert" | "update" | "delete">(),
  data: jsonb().notNull(),
});
