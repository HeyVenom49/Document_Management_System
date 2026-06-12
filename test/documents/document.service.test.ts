import { beforeEach, describe, expect, it, mock } from "bun:test";
import { BadRequest } from "../../src/common/errors/bad-request.error.ts";
import { Forbidden } from "../../src/common/errors/forbidden.error.ts";
import { NotFound } from "../../src/common/errors/not-found.error.ts";

const documentId = "11111111-1111-4111-8111-111111111111";

const activeDocument = {
  id: documentId,
  name: "contract.pdf",
  ownerId: "user-1",
  cloudinaryPublicId: "dms/contract",
  cloudinaryResourceType: "raw",
  deletedAt: null,
};

const deletedDocument = {
  ...activeDocument,
  deletedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const findById = mock(async () => activeDocument);
const softDelete = mock(async () => ({
  ...activeDocument,
  deletedAt: new Date(),
}));
const restore = mock(async () => activeDocument);
const findDocumentsIncludingDeleted = mock(async () => deletedDocument);
const findTrashByOwnerId = mock(async () => [deletedDocument]);

mock.module("../../src/modules/documents/document.repository.ts", () => ({
  documentRepository: {
    findById,
    softDelete,
    restore,
    findDocumentsIncludingDeleted,
    findTrashByOwnerId,
  },
}));

mock.module("../../src/modules/documents-versions/version.repository.ts", () => ({
  versionRepository: { createVersion: mock(async () => ({})) },
}));

mock.module("../../src/modules/folders/folder.repository.ts", () => ({
  folderRepository: { findById: mock(async () => null) },
}));

mock.module("../../src/common/utils/cloudinary.ts", () => ({
  uploadToCloudinary: mock(async () => ({})),
  deleteFromCloudinary: mock(async () => undefined),
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

    findById.mockImplementation(async () => activeDocument);
    softDelete.mockImplementation(async () => ({
      ...activeDocument,
      deletedAt: new Date(),
    }));
    restore.mockImplementation(async () => activeDocument);
    findDocumentsIncludingDeleted.mockImplementation(async () => deletedDocument);
    findTrashByOwnerId.mockImplementation(async () => [deletedDocument]);
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

  it("deleteDocument throws Forbidden when the user is not the owner", async () => {
    findById.mockImplementation(async () => ({
      ...activeDocument,
      ownerId: "other-user",
    }));

    await expect(
      documentService.deleteDocument(documentId, "user-1"),
    ).rejects.toThrow(Forbidden);
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

  it("restoreDocument throws Forbidden when the user is not the owner", async () => {
    findDocumentsIncludingDeleted.mockImplementation(async () => ({
      ...deletedDocument,
      ownerId: "other-user",
    }));

    await expect(
      documentService.restoreDocument(documentId, "user-1"),
    ).rejects.toThrow(Forbidden);
    expect(restore).not.toHaveBeenCalled();
  });
});
