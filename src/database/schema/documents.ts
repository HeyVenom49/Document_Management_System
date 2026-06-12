import {
  bigint,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users.ts";
import { folders } from "./folders.ts";

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  folderId: uuid("folder_id").references((): any => folders.id, {
    onDelete: "cascade",
  }),
  cloudinaryPublicId: text("cloudinary_public_id").notNull(),
  cloudinaryResourceType: text("cloudinary_resource_type"),
  fileUrl: text("file_url").notNull(),
  currentVersion: integer("current_version").default(1).notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: bigint("file_size", {
    mode: "number",
  }).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
