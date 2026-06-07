import { desc, eq } from "drizzle-orm";
import { db } from "../../database/index.ts";
import { documentVersions } from "../../database/schema/documentVersions.ts";

export class VersionRepository {
  async createVersion(data: {
    documentId: string;
    versionNumber: number;
    cloudinaryPublicId: string;
    fileUrl: string;
    mimeType: string;
    fileSize: number;
  }) {
    const [version] = await db
      .insert(documentVersions)
      .values(data)
      .returning();

    return version;
  }

  async findByDocumentId(documentId: string) {
    return await db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.documentId, documentId))
      .orderBy(desc(documentVersions.versionNumber));
  }

  async findLatestVersion(documentId: string) {
    const [version] = await db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.documentId, documentId))
      .orderBy(desc(documentVersions.versionNumber))
      .limit(1);
    return version ?? null;
  }

  async findVersionById(versionId: string) {
    const [version] = await db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.id, versionId));

    return version ?? null;
  }
}

export const versionRepository = new VersionRepository();
