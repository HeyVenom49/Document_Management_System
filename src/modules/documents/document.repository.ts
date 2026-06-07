import { eq } from "drizzle-orm";
import { db } from "../../database/index.ts";
import { documents } from "../../database/schema/documents.ts";

export class DocumentRepository {
  async create(data: {
    name: string;
    ownerId: string;
    folderId?: string | null;
    cloudinaryPublicId: string;
    cloudinaryResourceType: string;
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
        cloudinaryResourceType: data.cloudinaryResourceType,
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

  async findByFolderId(folderId: string) {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.folderId, folderId));
  }

  async updateById(
    id: string,
    data: {
      name?: string;
      folderId?: string | null;
    },
  ) {
    const [document] = await db
      .update(documents)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();

    return document ?? null;
  }

  async updateCurrentVersion(documentId: string, versionNumber: number) {
    const [document] = await db
      .update(documents)
      .set({ currentVersion: versionNumber, updatedAt: new Date() })
      .where(eq(documents.id, documentId))
      .returning();

    return document ?? null;
  }

  async updateVersionMetaData(
    documentId: string,
    data: {
      currentVersion: number;
      fileUrl: string;
      cloudinaryPublicId: string;
      mimeType: string;
      fileSize: number;
    },
  ) {
    const [document] = await db
      .update(documents)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId))
      .returning();

    return document;
  }
}

export const documentRepository = new DocumentRepository();
