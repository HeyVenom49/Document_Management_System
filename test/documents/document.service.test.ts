import { beforeEach, describe, expect, it, mock } from "bun:test";
import { BadRequest } from "../../src/common/errors/bad-request.error.ts";
import { NotFound } from "../../src/common/errors/not-found.error.ts";

const documentId = "11111111-1111-4111-8111-111111111111";

type DocumentRow = {
  id: string;
  name: string;
  ownerId: string;
  folderId: string | null;
  cloudinaryPublicId: string;
  cloudinaryResourceType: string | null;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  currentVersion: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const activeDocument: DocumentRow = {
  id: documentId,
  name: "contract.pdf",
  ownerId: "user-1",
  folderId: null,
  cloudinaryPublicId: "dms/contract",
  cloudinaryResourceType: "raw",
  fileUrl: "https://res.cloudinary.com/example/contract.pdf",
  mimeType: "application/pdf",
  fileSize: 100,
  currentVersion: 1,
  deletedAt: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const deletedDocument = {
  ...activeDocument,
  deletedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const findById = mock(async (): Promise<DocumentRow | null> => activeDocument);
const softDelete = mock(async () => ({
  ...activeDocument,
  deletedAt: new Date(),
}));
const restore = mock(async () => activeDocument);
const findDocumentsIncludingDeleted = mock(
  async (): Promise<DocumentRow | null> => deletedDocument,
);
const findTrashByOwnerId = mock(async () => [deletedDocument]);
const hardDelete = mock(async () => deletedDocument);

const findByDocumentId = mock(async () => [
  {
    id: "version-1",
    documentId,
    versionNumber: 1,
    cloudinaryPublicId: "dms/contract-v1",
    fileUrl: "https://res.cloudinary.com/example/v1.pdf",
    mimeType: "application/pdf",
    fileSize: 100,
  },
]);

const findSharedWithUser = mock(async () => [
  {
    document: activeDocument,
    permission: "viewer" as const,
    sharedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
]);

const removeAllSharesForDocument = mock(async () => undefined);

const deleteFromCloudinary = mock(async () => undefined);

mock.module("../../src/modules/documents/document.repository.ts", () => ({
  documentRepository: {
    findById,
    softDelete,
    restore,
    findDocumentsIncludingDeleted,
    findTrashByOwnerId,
    hardDelete,
  },
}));

mock.module("../../src/modules/documents-versions/version.repository.ts", () => ({
  versionRepository: {
    createVersion: mock(async () => ({})),
    findByDocumentId,
  },
}));

mock.module("../../src/modules/share/document-share.repository.ts", () => ({
  documentShareRepository: {
    findSharedWithUser,
    removeAllSharesForDocument,
  },
}));

mock.module("../../src/modules/folders/folder.repository.ts", () => ({
  folderRepository: { findById: mock(async () => null) },
}));

mock.module("../../src/common/utils/cloudinary.ts", () => ({
  uploadToCloudinary: mock(async () => ({})),
  deleteFromCloudinary,
  withSignedFileUrl: <T>(resource: T) => resource,
  withSignedFileUrls: <T>(resources: T[]) => resources,
  toDownloadPayload: (
    resource: { mimeType: string; fileSize: number },
    fileName: string,
  ) => ({
    downloadUrl: `https://res.cloudinary.com/example/download/${fileName}`,
    fileName,
    mimeType: resource.mimeType,
    fileSize: resource.fileSize,
  }),
}));

const auditLog = mock(async () => ({}));

mock.module("../../src/modules/audit/audit.services.ts", () => ({
  auditService: { log: auditLog },
}));

const { documentService } = await import(
  "../../src/modules/documents/document.service.ts"
);

describe("document service soft delete and restore", () => {
  beforeEach(() => {
    findById.mockClear();
    softDelete.mockClear();
    restore.mockClear();
    findDocumentsIncludingDeleted.mockClear();
    findTrashByOwnerId.mockClear();
    hardDelete.mockClear();
    findByDocumentId.mockClear();
    findSharedWithUser.mockClear();
    removeAllSharesForDocument.mockClear();
    deleteFromCloudinary.mockClear();
    auditLog.mockClear();

    findById.mockImplementation(async () => activeDocument);
    softDelete.mockImplementation(async () => ({
      ...activeDocument,
      deletedAt: new Date(),
    }));
    restore.mockImplementation(async () => activeDocument);
    findDocumentsIncludingDeleted.mockImplementation(async () => deletedDocument);
    findTrashByOwnerId.mockImplementation(async () => [deletedDocument]);
  });

  it("downloadDocument returns a signed download payload for the owner", async () => {
    const download = await documentService.downloadDocument(documentId, "user-1");

    expect(findById).toHaveBeenCalledWith(documentId);
    expect(auditLog).toHaveBeenCalled();
    expect(download).toEqual({
      downloadUrl: "https://res.cloudinary.com/example/download/contract.pdf",
      fileName: "contract.pdf",
      mimeType: "application/pdf",
      fileSize: 100,
    });
  });

  it("deleteDocument soft-deletes without removing Cloudinary assets", async () => {
    const result = await documentService.deleteDocument(documentId, "user-1");

    expect(findById).toHaveBeenCalledWith(documentId);
    expect(softDelete).toHaveBeenCalledWith(documentId);
    expect(result).toEqual({ message: "Document deleted successfully" });
  });

  it("deleteDocument throws NotFound when the document does not exist", async () => {
    findById.mockImplementation(async () => null);

    await expect(
      documentService.deleteDocument(documentId, "user-1"),
    ).rejects.toThrow(NotFound);
    expect(softDelete).not.toHaveBeenCalled();
  });

  it("deleteDocument throws NotFound when the user is not the owner", async () => {
    findById.mockImplementation(async () => ({
      ...activeDocument,
      ownerId: "other-user",
    }));

    await expect(
      documentService.deleteDocument(documentId, "user-1"),
    ).rejects.toThrow(NotFound);
    expect(softDelete).not.toHaveBeenCalled();
  });

  it("getTrash returns soft-deleted documents for the owner", async () => {
    const documents = await documentService.getTrash("user-1");

    expect(findTrashByOwnerId).toHaveBeenCalledWith("user-1");
    expect(documents).toEqual([deletedDocument]);
  });

  it("restoreDocument clears deletedAt for the document owner", async () => {
    const document = await documentService.restoreDocument(
      documentId,
      "user-1",
    );

    expect(findDocumentsIncludingDeleted).toHaveBeenCalledWith(documentId);
    expect(restore).toHaveBeenCalledWith(documentId);
    expect(document).toMatchObject({ id: documentId, deletedAt: null });
  });

  it("restoreDocument throws BadRequest when the document is not in trash", async () => {
    findDocumentsIncludingDeleted.mockImplementation(async () => activeDocument);

    await expect(
      documentService.restoreDocument(documentId, "user-1"),
    ).rejects.toThrow(BadRequest);
    expect(restore).not.toHaveBeenCalled();
  });

  it("restoreDocument throws NotFound when the document does not exist", async () => {
    findDocumentsIncludingDeleted.mockImplementation(async () => null);

    await expect(
      documentService.restoreDocument(documentId, "user-1"),
    ).rejects.toThrow(NotFound);
    expect(restore).not.toHaveBeenCalled();
  });

  it("getSharedDocuments returns documents shared with the user", async () => {
    const documents = await documentService.getSharedDocuments("user-1");

    expect(findSharedWithUser).toHaveBeenCalledWith("user-1");
    expect(documents).toEqual([
      {
        ...activeDocument,
        sharePermission: "viewer",
        sharedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]);
  });

  it("permanentlyDeleteDocument removes Cloudinary assets and hard-deletes trashed document", async () => {
    const result = await documentService.permanentlyDeleteDocument(
      documentId,
      "user-1",
    );

    expect(findDocumentsIncludingDeleted).toHaveBeenCalledWith(documentId);
    expect(findByDocumentId).toHaveBeenCalledWith(documentId);
    expect(deleteFromCloudinary).toHaveBeenCalledTimes(2);
    expect(removeAllSharesForDocument).toHaveBeenCalledWith(documentId);
    expect(hardDelete).toHaveBeenCalledWith(documentId);
    expect(auditLog).toHaveBeenCalled();
    expect(result).toEqual({ message: "Document permanently deleted" });
  });

  it("permanentlyDeleteDocument throws BadRequest when document is not in trash", async () => {
    findDocumentsIncludingDeleted.mockImplementation(async () => activeDocument);

    await expect(
      documentService.permanentlyDeleteDocument(documentId, "user-1"),
    ).rejects.toThrow(BadRequest);
    expect(hardDelete).not.toHaveBeenCalled();
  });

  it("restoreDocument throws NotFound when the user is not the owner", async () => {
    findDocumentsIncludingDeleted.mockImplementation(async () => ({
      ...deletedDocument,
      ownerId: "other-user",
    }));

    await expect(
      documentService.restoreDocument(documentId, "user-1"),
    ).rejects.toThrow(NotFound);
    expect(restore).not.toHaveBeenCalled();
  });
});
