import {
  bigint,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { documents } from "./documents.ts";

export const documentVersions = pgTable("document_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, {
      onDelete: "cascade",
    }),
  versionNumber: integer("version_number").notNull(),
  cloudinaryPublicId: text("cloudinary_public_id").notNull(),
  fileUrl: text("file_url").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: bigint("file_size", {
    mode: "number",
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
