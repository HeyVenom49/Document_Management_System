import { eq } from "drizzle-orm";
import { db } from "../../database/index.ts";
import { documents } from "../../database/schema/documents.ts";

export class DocumentRepository {
  async create(data: {
    name: string;
    ownerId: string;
    folderId?: string | null;
    cloudinaryPublicId: string;
    fileUrl: string;
    mimeType: string;
    fileSize: number;
  }) {
    const [document] = await db
      .insert(documents)
      .values({
        name: data.name,
        ownerId: data.ownerId,
        folderId: data.folderId ?? null,
        cloudinaryPublicId: data.cloudinaryPublicId,
        fileUrl: data.fileUrl,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
      })
      .returning();

    return document;
  }

  async findById(id: string) {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));

    return document ?? null;
  }

  async findByOwnerId(ownerId: string) {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.ownerId, ownerId));
  }

  async deleteById(id: string) {
    const [document] = await db
      .delete(documents)
      .where(eq(documents.id, id))
      .returning();

    return document ?? null;
  }
}

export const documentRepository = new DocumentRepository();
