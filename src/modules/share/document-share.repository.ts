import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "../../database/index.ts";
import { documentShare } from "../../database/schema/document-shares.ts";
import { documents } from "../../database/schema/documents.ts";

export class DocumentShareRepository {
  async shareDocument(data: {
    documentId: string;
    sharedWithUserId: string;
    permission: "viewer" | "editor";
  }) {
    const [share] = await db
      .insert(documentShare)
      .values({
        documentId: data.documentId,
        sharedWithUserId: data.sharedWithUserId,
        permission: data.permission,
      })
      .returning();
    return share;
  }

  async findShare(documentId: string, userId: string) {
    const [share] = await db
      .select()
      .from(documentShare)
      .where(
        and(
          eq(documentShare.documentId, documentId),
          eq(documentShare.sharedWithUserId, userId),
        ),
      );

    return share ?? null;
  }

  async getSharesForDocument(documentId: string) {
    return await db
      .select()
      .from(documentShare)
      .where(eq(documentShare.documentId, documentId));
  }

  async findSharedWithUser(userId: string) {
    return await db
      .select({
        document: documents,
        permission: documentShare.permission,
        sharedAt: documentShare.createdAt,
      })
      .from(documentShare)
      .innerJoin(documents, eq(documentShare.documentId, documents.id))
      .where(
        and(
          eq(documentShare.sharedWithUserId, userId),
          isNull(documents.deletedAt),
        ),
      )
      .orderBy(desc(documentShare.createdAt));
  }

  async removeShare(documentId: string, userId: string) {
    const [share] = await db
      .delete(documentShare)
      .where(
        and(
          eq(documentShare.documentId, documentId),
          eq(documentShare.sharedWithUserId, userId),
        ),
      )
      .returning();

    return share ?? null;
  }

  async removeAllSharesForDocument(documentId: string) {
    await db
      .delete(documentShare)
      .where(eq(documentShare.documentId, documentId));
  }
}

export const documentShareRepository = new DocumentShareRepository();
