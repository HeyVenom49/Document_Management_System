import { beforeEach, describe, expect, it, mock } from "bun:test";
import { NotFound } from "../../src/common/errors/not-found.error.ts";
import { AuditAction } from "../../src/common/constants/audit-action.ts";

const documentId = "11111111-1111-4111-8111-111111111111";
const userId = "user-1";

const auditLog = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  userId,
  documentId,
  action: AuditAction.DOCUMENT_UPLOADED,
  metadata: { fileName: "contract.pdf" },
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

const createLog = mock(async () => auditLog);
const getDocumentLogs = mock(async () => [auditLog]);
const findById = mock(async () => ({
  id: documentId,
  ownerId: userId,
}));
const findShare = mock(async () => null);

mock.module("../../src/modules/audit/audit.repository.ts", () => ({
  auditRepository: { createLog, getDocumentLogs },
}));

mock.module("../../src/modules/documents/document.repository.ts", () => ({
  documentRepository: { findById },
}));

mock.module("../../src/modules/share/document-share.repository.ts", () => ({
  documentShareRepository: { findShare },
}));

const { auditService } = await import(
  "../../src/modules/audit/audit.services.ts"
);

describe("audit service", () => {
  beforeEach(() => {
    createLog.mockClear();
    getDocumentLogs.mockClear();
    findById.mockClear();
    findShare.mockClear();

    findById.mockImplementation(async () => ({
      id: documentId,
      ownerId: userId,
    }));
    findShare.mockImplementation(async () => null);
  });

  it("log creates an audit entry", async () => {
    const log = await auditService.log({
      userId,
      documentId,
      action: AuditAction.DOCUMENT_UPLOADED,
      metadata: { fileName: "contract.pdf" },
    });

    expect(createLog).toHaveBeenCalledWith({
      userId,
      documentId,
      action: AuditAction.DOCUMENT_UPLOADED,
      metadata: { fileName: "contract.pdf" },
    });
    expect(log).toEqual(auditLog);
  });

  it("getDocumentActivity returns logs for the document owner", async () => {
    const logs = await auditService.getDocumentActivity(documentId, userId);

    expect(findById).toHaveBeenCalledWith(documentId);
    expect(getDocumentLogs).toHaveBeenCalledWith(documentId);
    expect(logs).toEqual([auditLog]);
  });

  it("getDocumentActivity throws NotFound when the user is not the owner", async () => {
    findById.mockImplementation(async () => ({
      id: documentId,
      ownerId: "other-user",
    }));

    await expect(
      auditService.getDocumentActivity(documentId, userId),
    ).rejects.toThrow(NotFound);
    expect(getDocumentLogs).not.toHaveBeenCalled();
  });
});
