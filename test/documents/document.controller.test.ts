import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createResponse } from "../helpers/http.ts";

const documentId = "11111111-1111-4111-8111-111111111111";
const folderId = "22222222-2222-4222-8222-222222222222";
const userId = "user-1";

const documentRecord = {
  id: documentId,
  name: "contract.pdf",
  ownerId: userId,
  folderId,
  cloudinaryPublicId: "dms/contract",
  cloudinaryResourceType: "raw",
  mimeType: "application/pdf",
  fileSize: 100,
  currentVersion: 1,
};

const create = mock(async () => documentRecord);
const findByOwnerId = mock(async () => [documentRecord]);
const findById = mock(async () => documentRecord);
const softDelete = mock(async () => ({
  ...documentRecord,
  deletedAt: new Date(),
}));
const updateById = mock(async () => ({
  ...documentRecord,
  name: "Updated contract.pdf",
}));
const findByFolderId = mock(async () => [documentRecord]);
const findDocuments = mock(async () => [documentRecord]);
const countDocuments = mock(async () => 1);
const findTrashByOwnerId = mock(async () => [
  { ...documentRecord, deletedAt: new Date("2026-01-01T00:00:00.000Z") },
]);
const findDocumentsIncludingDeleted = mock(async () => ({
  ...documentRecord,
  deletedAt: new Date("2026-01-01T00:00:00.000Z"),
}));
const restore = mock(async () => documentRecord);

const createVersion = mock(async () => ({
  id: "version-1",
  documentId,
  versionNumber: 1,
}));

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

const findFolderById = mock(async () => ({
  id: folderId,
  ownerId: userId,
}));

const findShare = mock(async () => null);

const uploadToCloudinary = mock(async () => ({
  public_id: "dms/contract",
  resource_type: "raw",
  secure_url: "https://res.cloudinary.com/example/contract.pdf",
}));

const deleteFromCloudinary = mock(async () => undefined);

const findSharedWithUser = mock(async () => [
  {
    document: documentRecord,
    permission: "editor" as const,
    sharedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
]);
const removeAllSharesForDocument = mock(async () => undefined);
const hardDelete = mock(async () => ({
  ...documentRecord,
  deletedAt: new Date("2026-01-01T00:00:00.000Z"),
}));

mock.module("../../src/modules/documents/document.repository.ts", () => ({
  documentRepository: {
    create,
    findByOwnerId,
    findById,
    softDelete,
    updateById,
    findByFolderId,
    findDocuments,
    countDocuments,
    findTrashByOwnerId,
    findDocumentsIncludingDeleted,
    restore,
    hardDelete,
  },
}));

mock.module("../../src/modules/documents-versions/version.repository.ts", () => ({
  versionRepository: { createVersion, findByDocumentId },
}));

mock.module("../../src/modules/folders/folder.repository.ts", () => ({
  folderRepository: { findById: findFolderById },
}));

mock.module("../../src/modules/share/document-share.repository.ts", () => ({
  documentShareRepository: {
    findShare,
    findSharedWithUser,
    removeAllSharesForDocument,
  },
}));

mock.module("../../src/common/utils/cloudinary.ts", () => ({
  uploadToCloudinary,
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

mock.module("../../src/common/utils/file-validation.ts", () => ({
  validateUploadFile: mock(() => undefined),
}));

const auditLog = mock(async () => ({}));

mock.module("../../src/modules/audit/audit.services.ts", () => ({
  auditService: { log: auditLog },
}));

const { documentController } = await import(
  "../../src/modules/documents/document.controller.ts"
);

describe("document endpoints", () => {
  beforeEach(() => {
    create.mockClear();
    findByOwnerId.mockClear();
    findById.mockClear();
    softDelete.mockClear();
    updateById.mockClear();
    findByFolderId.mockClear();
    findDocuments.mockClear();
    countDocuments.mockClear();
    findTrashByOwnerId.mockClear();
    findDocumentsIncludingDeleted.mockClear();
    restore.mockClear();
    createVersion.mockClear();
    findByDocumentId.mockClear();
    findFolderById.mockClear();
    uploadToCloudinary.mockClear();
    deleteFromCloudinary.mockClear();
    findShare.mockClear();
    auditLog.mockClear();

    findById.mockImplementation(async () => documentRecord);
    findFolderById.mockImplementation(async () => ({
      id: folderId,
      ownerId: userId,
    }));
  });

  it("POST /documents/upload uploads a document for the authenticated user", async () => {
    const response = createResponse();
    const file = {
      originalname: "contract.pdf",
      mimetype: "application/pdf",
      size: 100,
      buffer: Buffer.from("%PDF-1.4"),
    };

    await documentController.uploadDocument(
      {
        body: { folderId },
        file,
        user: { userId },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.body).toMatchObject({
      success: true,
      data: { id: documentId, name: "contract.pdf" },
    });
    expect(findFolderById).toHaveBeenCalledWith(folderId);
    expect(uploadToCloudinary).toHaveBeenCalledWith(file.buffer, file.mimetype);
    expect(create).toHaveBeenCalled();
    expect(createVersion).toHaveBeenCalled();
  });

  it("GET /documents returns documents for the authenticated user", async () => {
    const response = createResponse();

    await documentController.getDocuments(
      {
        user: { userId },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toMatchObject({
      success: true,
      data: [{ id: documentId, name: "contract.pdf" }],
    });
    expect(findByOwnerId).toHaveBeenCalledWith(userId);
  });

  it("GET /documents/:documentId returns one document", async () => {
    const response = createResponse();

    await documentController.getDocumentById(
      {
        params: { documentId },
        user: { userId },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { id: documentId },
    });
    expect(findById).toHaveBeenCalledWith(documentId);
  });

  it("GET /documents/:documentId/download redirects to the signed download url", async () => {
    const response = createResponse();

    await documentController.downloadDocument(
      {
        params: { documentId },
        user: { userId },
      } as never,
      response as never,
    );

    expect(response.redirect).toHaveBeenCalledWith(
      302,
      "https://res.cloudinary.com/example/download/contract.pdf",
    );
    expect(findById).toHaveBeenCalledWith(documentId);
    expect(auditLog).toHaveBeenCalled();
  });

  it("DELETE /documents/:documentId soft-deletes one document", async () => {
    const response = createResponse();

    await documentController.deleteDocument(
      {
        params: { documentId },
        user: { userId },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toEqual({
      success: true,
      message: "Document deleted successfully",
    });
    expect(findById).toHaveBeenCalledWith(documentId);
    expect(softDelete).toHaveBeenCalledWith(documentId);
    expect(deleteFromCloudinary).not.toHaveBeenCalled();
  });

  it("GET /documents/trash returns soft-deleted documents", async () => {
    const response = createResponse();

    await documentController.getTrash(
      {
        user: { userId },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toMatchObject({
      success: true,
      data: [{ id: documentId, name: "contract.pdf" }],
    });
    expect(findTrashByOwnerId).toHaveBeenCalledWith(userId);
  });

  it("POST /documents/:documentId/restore restores a soft-deleted document", async () => {
    const response = createResponse();

    await documentController.restoreDocument(
      {
        params: { documentId },
        user: { userId },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { id: documentId, name: "contract.pdf" },
    });
    expect(findDocumentsIncludingDeleted).toHaveBeenCalledWith(documentId);
    expect(restore).toHaveBeenCalledWith(documentId);
  });

  it("PATCH /documents/:documentId updates document metadata", async () => {
    const response = createResponse();

    await documentController.updateDocument(
      {
        params: { documentId },
        body: { name: "Updated contract.pdf" },
        user: { userId },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { id: documentId, name: "Updated contract.pdf" },
    });
    expect(updateById).toHaveBeenCalledWith(documentId, {
      name: "Updated contract.pdf",
    });
  });

  it("GET /documents/folder/:folderId returns documents inside a folder", async () => {
    const response = createResponse();

    await documentController.getDocumentsByFolder(
      {
        params: { folderId },
        user: { userId },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toMatchObject({
      success: true,
      data: [{ id: documentId, folderId }],
    });
    expect(findFolderById).toHaveBeenCalledWith(folderId);
    expect(findByFolderId).toHaveBeenCalledWith(folderId);
  });

  it("GET /documents/search returns paginated search results", async () => {
    const response = createResponse();

    await documentController.searchDocuments(
      {
        query: { search: "contract", page: "1", limit: "10" },
        user: { userId },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toMatchObject({
      success: true,
      data: [{ id: documentId, name: "contract.pdf" }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    expect(findDocuments).toHaveBeenCalledWith(userId, "contract", 1, 10);
    expect(countDocuments).toHaveBeenCalledWith(userId, "contract");
  });
});
