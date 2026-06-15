import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { documents } from "./documents.ts";
import { tags } from "./tags.ts";

export const documentTags = pgTable(
  "document_tag",
  {
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({
      columns: [table.documentId, table.tagId],
    }),
  ],
);
