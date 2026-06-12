import { and, count, desc, eq, ilike, isNotNull, isNull } from "drizzle-orm";
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
      .where(and(eq(documents.id, id), isNull(documents.deletedAt)));

    return document ?? null;
  }

  async findByOwnerId(ownerId: string) {
    return await db
      .select()
      .from(documents)
      .where(and(eq(documents.ownerId, ownerId), isNull(documents.deletedAt)));
  }

  async deleteById(id: string) {
    const [document] = await db
      .update(documents)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();

    return document ?? null;
  }

  async findByFolderId(folderId: string) {
    return await db
      .select()
      .from(documents)
      .where(
        and(eq(documents.folderId, folderId), isNull(documents.deletedAt)),
      );
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

  async findDocuments(ownerId: string, search?: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const filters = [
      eq(documents.ownerId, ownerId),
      isNull(documents.deletedAt),
    ];

    if (search) {
      filters.push(ilike(documents.name, `%${search}%`));
    }

    return await db
      .select()
      .from(documents)
      .where(and(...filters))
      .orderBy(desc(documents.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async countDocuments(ownerId: string, search?: string) {
    const filters = [
      eq(documents.ownerId, ownerId),
      isNull(documents.deletedAt),
    ];

    if (search) {
      filters.push(ilike(documents.name, `%${search}%`));
    }
    const [result] = await db
      .select({
        total: count(),
      })
      .from(documents)
      .where(and(...filters));

    return result?.total ?? 0;
  }

  async softDelete(documentId: string) {
    const [document] = await db
      .update(documents)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(documents.id, documentId))
      .returning();

    return document;
  }

  async restore(documentId: string) {
    const [document] = await db
      .update(documents)
      .set({
        deletedAt: null,
      })
      .where(eq(documents.id, documentId))
      .returning();

    return document;
  }

  async findTrashByOwnerId(ownerId: string) {
    return await db
      .select()
      .from(documents)
      .where(
        and(eq(documents.ownerId, ownerId), isNotNull(documents.deletedAt)),
      );
  }

  async findDocumentsIncludingDeleted(documentId: string) {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId));
    return document ?? null;
  }
}

export const documentRepository = new DocumentRepository();
