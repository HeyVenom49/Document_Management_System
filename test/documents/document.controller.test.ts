import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createResponse } from "../helpers/http.ts";

const documentId = "11111111-1111-4111-8111-111111111111";
const folderId = "22222222-2222-4222-8222-222222222222";

const uploadDocument = mock(async () => ({
  id: documentId,
  name: "contract.pdf",
  ownerId: "user-1",
}));

const getDocuments = mock(async () => [
  {
    id: documentId,
    name: "contract.pdf",
    ownerId: "user-1",
  },
]);

const getDocumentById = mock(async () => ({
  id: documentId,
  name: "contract.pdf",
  ownerId: "user-1",
}));

const deleteDocument = mock(async () => ({
  message: "Document deleted successfully",
}));

const updateDocument = mock(async () => ({
  id: documentId,
  name: "Updated contract.pdf",
  ownerId: "user-1",
}));

const getDocumentsByFolder = mock(async () => [
  {
    id: documentId,
    folderId,
    name: "contract.pdf",
    ownerId: "user-1",
  },
]);

mock.module("../../src/modules/documents/document.service.ts", () => ({
  documentService: {
    uploadDocument,
    getDocuments,
    getDocumentById,
    deleteDocument,
    updateDocument,
    getDocumentsByFolder,
  },
}));

const { documentController } = await import(
  "../../src/modules/documents/document.controller.ts"
);

describe("document endpoints", () => {
  beforeEach(() => {
    uploadDocument.mockClear();
    getDocuments.mockClear();
    getDocumentById.mockClear();
    deleteDocument.mockClear();
    updateDocument.mockClear();
    getDocumentsByFolder.mockClear();
  });

  it("POST /documents/upload uploads a document for the authenticated user", async () => {
    const response = createResponse();
    const file = {
      originalname: "contract.pdf",
      mimetype: "application/pdf",
      size: 100,
      buffer: Buffer.from("test-pdf-content"),
    };

    await documentController.uploadDocument(
      {
        body: { folderId },
        file,
        user: { userId: "user-1" },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.body).toMatchObject({
      success: true,
      data: { id: documentId, name: "contract.pdf" },
    });
    expect(uploadDocument).toHaveBeenCalledWith({ folderId }, file, "user-1");
  });

  it("GET /documents returns documents for the authenticated user", async () => {
    const response = createResponse();

    await documentController.getDocuments(
      {
        user: { userId: "user-1" },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.body).toMatchObject({
      success: true,
      data: [{ id: documentId, name: "contract.pdf" }],
    });
    expect(getDocuments).toHaveBeenCalledWith("user-1");
  });

  it("GET /documents/:id returns one document", async () => {
    const response = createResponse();

    await documentController.getDocumentById(
      {
        params: { id: documentId },
        user: { userId: "user-1" },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.body).toMatchObject({
      success: true,
      data: { id: documentId },
    });
    expect(getDocumentById).toHaveBeenCalledWith(documentId, "user-1");
  });

  it("DELETE /documents/:id deletes one document", async () => {
    const response = createResponse();

    await documentController.deleteDocument(
      {
        params: { id: documentId },
        user: { userId: "user-1" },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toEqual({
      success: true,
      message: "Document deleted successfully",
    });
    expect(deleteDocument).toHaveBeenCalledWith(documentId, "user-1");
  });

  it("PATCH /documents/:id updates document metadata", async () => {
    const response = createResponse();

    await documentController.updateDocumet(
      {
        params: { id: documentId },
        body: { name: "Updated contract.pdf" },
        user: { userId: "user-1" },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { id: documentId, name: "Updated contract.pdf" },
    });
    expect(updateDocument).toHaveBeenCalledWith(
      documentId,
      { name: "Updated contract.pdf" },
      "user-1",
    );
  });

  it("GET /documents/folder/:folderId returns documents inside a folder", async () => {
    const response = createResponse();

    await documentController.getDocumentsByFolder(
      {
        params: { folderId },
        user: { userId: "user-1" },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toMatchObject({
      success: true,
      data: [{ id: documentId, folderId }],
    });
    expect(getDocumentsByFolder).toHaveBeenCalledWith(folderId, "user-1");
  });
});
