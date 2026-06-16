import { assertDocumentAccess } from "../../common/access/document-access.ts";
import type { AuditAction } from "../../common/constants/audit-action.ts";
import { auditRepository } from "./audit.repository.ts";

export type CreateAuditLogInput = {
  userId: string;
  documentId?: string;
  action: AuditAction | string;
  metadata?: Record<string, unknown>;
};

export class AuditService {
  async log(data: CreateAuditLogInput) {
    return await auditRepository.createLog(data);
  }

  async getDocumentActivity(documentId: string, userId: string) {
    await assertDocumentAccess(documentId, userId, "viewer");
    return await auditRepository.getDocumentLogs(documentId);
  }
}

export const auditService = new AuditService();
