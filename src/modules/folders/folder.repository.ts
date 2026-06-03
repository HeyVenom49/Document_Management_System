import { eq } from "drizzle-orm";
import { db } from "../../database/index.ts";
import { folders } from "../../database/schema/folders.ts";

export class FolderRepository {
  async create(data: {
    name: string;
    ownerId: string;
    parentId: string | null;
  }) {
    const [folder] = await db
      .insert(folders)
      .values({
        name: data.name,
        ownerId: data.ownerId,
        parentId: data.parentId ?? null,
      })
      .returning();
    return folder;
  }
  async findByOwnerId(ownerId: string) {
    return await db.select().from(folders).where(eq(folders.ownerId, ownerId));
  }

  async findById(id: string) {
    const [folder] = await db.select().from(folders).where(eq(folders.id, id));
    return folder ?? null;
  }
}

export const folderRepository = new FolderRepository();
