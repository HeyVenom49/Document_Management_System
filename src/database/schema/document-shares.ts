import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { documents } from "./documents.ts";
import { users } from "./users.ts";

export const documentShare = pgTable(
  "document_shares",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, {
        onDelete: "cascade",
      }),
    sharedWithUserId: uuid("shared_with_user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    permission: text("permission")
      .$type<"viewer" | "editor">()
      .notNull()
      .default("viewer"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.documentId, table.sharedWithUserId)],
);
