import { desc, eq } from "drizzle-orm";
import { db } from "../../database/index.ts";
import { audit } from "../../database/schema/audit.ts";

type CreateAuditLogInput = {
  userId: string;
  documentId?: string;
  action: string;
  metadata?: Record<string, unknown>;
};

export class AuditRepository {
  async createLog(data: CreateAuditLogInput) {
    const [log] = await db
      .insert(audit)
      .values({
        userId: data.userId,
        documentId: data.documentId ?? null,
        action: data.action,
        metadata: data.metadata ?? null,
      })
      .returning();

    return log;
  }

  async getDocumentLogs(documentId: string) {
    return await db
      .select()
      .from(audit)
      .where(eq(audit.documentId, documentId))
      .orderBy(desc(audit.createdAt));
  }
}

export const auditRepository = new AuditRepository();
