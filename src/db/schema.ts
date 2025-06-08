import {
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const ipLocationsTable = pgTable("ip_locations", {
  ipAddress: text("ip_address").primaryKey(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  countryFlag: varchar("country_flag"),
  country: text("country"),
  rawData: jsonb("raw_data"),
  emailCount: integer("email_count").default(1).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export type InsertIpLocation = typeof ipLocationsTable.$inferInsert;
export type SelectIpLocation = typeof ipLocationsTable.$inferSelect;
