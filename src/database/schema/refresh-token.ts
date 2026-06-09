import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.ts";

export const refreshToken = pgTable("refresh_token", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: uuid("token").defaultRandom().notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expireAt: timestamp("expire_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
