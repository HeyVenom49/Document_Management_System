import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createResponse } from "../helpers/http.ts";

const documentId = "11111111-1111-4111-8111-111111111111";
const versionId = "33333333-3333-4333-8333-333333333333";

const findById = mock(async () => ({
  id: documentId,
  name: "contract.pdf",
  ownerId: "user-1",
  currentVersion: 1,
}));

const findLatestVersion = mock(async () => ({
  id: "version-1",
  documentId,
  versionNumber: 1,
}));

const createVersion = mock(async () => ({
  id: versionId,
  documentId,
  versionNumber: 2,
}));

const findByDocumentId = mock(async () => [
  {
    id: versionId,
    documentId,
    versionNumber: 2,
  },
]);

const findVersionById = mock(async () => ({
  id: versionId,
  documentId,
  versionNumber: 2,
}));

const updateVersionMetaData = mock(async () => ({}));

const uploadToCloudinary = mock(async () => ({
  public_id: "dms/new-file",
  secure_url: "https://res.cloudinary.com/example/new-file.pdf",
}));

mock.module("../../src/modules/documents/document.repository.ts", () => ({
  documentRepository: { findById, updateVersionMetaData },
}));

mock.module("../../src/modules/documents-versions/version.repository.ts", () => ({
  versionRepository: {
    findLatestVersion,
    createVersion,
    findByDocumentId,
    findVersionById,
  },
}));

mock.module("../../src/common/utils/cloudinary.ts", () => ({
  uploadToCloudinary,
}));

const { versionController } = await import(
  "../../src/modules/documents-versions/version.controller.ts"
);

describe("version endpoints", () => {
  beforeEach(() => {
    findById.mockClear();
    findLatestVersion.mockClear();
    createVersion.mockClear();
    findByDocumentId.mockClear();
    findVersionById.mockClear();
    updateVersionMetaData.mockClear();
    uploadToCloudinary.mockClear();

    findById.mockImplementation(async () => ({
      id: documentId,
      name: "contract.pdf",
      ownerId: "user-1",
      currentVersion: 1,
    }));

    findLatestVersion.mockImplementation(async () => ({
      id: "version-1",
      documentId,
      versionNumber: 1,
    }));

    createVersion.mockImplementation(async () => ({
      id: versionId,
      documentId,
      versionNumber: 2,
    }));

    findByDocumentId.mockImplementation(async () => [
      {
        id: versionId,
        documentId,
        versionNumber: 2,
      },
    ]);

    findVersionById.mockImplementation(async () => ({
      id: versionId,
      documentId,
      versionNumber: 2,
    }));
  });

  it("POST /documents/:documentId/versions uploads a new version", async () => {
    const response = createResponse();
    const file = {
      originalname: "contract-v2.pdf",
      mimetype: "application/pdf",
      size: 200,
      buffer: Buffer.from("updated-pdf-content"),
    };

    await versionController.uploadVersion(
      {
        params: { documentId },
        file,
        user: { userId: "user-1" },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.body).toMatchObject({
      success: true,
      data: { id: versionId, versionNumber: 2 },
    });
    expect(createVersion).toHaveBeenCalled();
  });

  it("GET /documents/:documentId/versions returns all versions", async () => {
    const response = createResponse();

    await versionController.getVersions(
      {
        params: { documentId },
        user: { userId: "user-1" },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toMatchObject({
      success: true,
      data: [{ id: versionId, versionNumber: 2 }],
    });
    expect(findByDocumentId).toHaveBeenCalledWith(documentId);
  });

  it("GET /documents/:documentId/versions/:versionId returns one version", async () => {
    const response = createResponse();

    await versionController.getVersionById(
      {
        params: { documentId, versionId },
        user: { userId: "user-1" },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { id: versionId, versionNumber: 2 },
    });
    expect(findVersionById).toHaveBeenCalledWith(versionId);
  });
});
