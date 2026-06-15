import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.ts";

export const tags = pgTable("tags", {
  id: uuid("tags").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  ownerId: uuid("ownerId")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
