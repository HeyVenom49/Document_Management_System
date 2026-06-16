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

const updateVersionMetaData = mock(async () => ({
  id: documentId,
  name: "contract.pdf",
  ownerId: "user-1",
  currentVersion: 1,
}));

const findShare = mock(async () => null);

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

mock.module("../../src/modules/share/document-share.repository.ts", () => ({
  documentShareRepository: { findShare },
}));

mock.module("../../src/common/utils/cloudinary.ts", () => ({
  uploadToCloudinary,
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
    findShare.mockClear();
    auditLog.mockClear();

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
      mimeType: "application/pdf",
      fileSize: 100,
      cloudinaryPublicId: "dms/v2",
      fileUrl: "https://res.cloudinary.com/example/v2.pdf",
    }));

    updateVersionMetaData.mockImplementation(async () => ({
      id: documentId,
      name: "contract.pdf",
      ownerId: "user-1",
      currentVersion: 1,
    }));
  });

  it("POST /documents/:documentId/versions uploads a new version", async () => {
    const response = createResponse();
    const file = {
      originalname: "contract-v2.pdf",
      mimetype: "application/pdf",
      size: 200,
      buffer: Buffer.from("%PDF-1.4"),
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

  it("GET /documents/:documentId/versions/:versionId/download redirects to the signed download url", async () => {
    const response = createResponse();

    await versionController.downloadVersion(
      {
        params: { documentId, versionId },
        user: { userId: "user-1" },
      } as never,
      response as never,
    );

    expect(response.redirect).toHaveBeenCalledWith(
      302,
      "https://res.cloudinary.com/example/download/contract-v2.pdf",
    );
    expect(findVersionById).toHaveBeenCalledWith(versionId);
    expect(auditLog).toHaveBeenCalled();
  });

  it("POST /documents/:documentId/versions/:versionId/restore restores a version", async () => {
    findVersionById.mockImplementation(async () => ({
      id: versionId,
      documentId,
      versionNumber: 1,
      fileUrl: "https://res.cloudinary.com/example/v1.pdf",
      cloudinaryPublicId: "dms/v1",
      mimeType: "application/pdf",
      fileSize: 100,
    }));

    const response = createResponse();

    await versionController.restoreVersion(
      {
        params: { documentId, versionId },
        user: { userId: "user-1" },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { id: documentId, currentVersion: 1 },
    });
    expect(updateVersionMetaData).toHaveBeenCalledWith(documentId, {
      currentVersion: 1,
      fileUrl: "https://res.cloudinary.com/example/v1.pdf",
      cloudinaryPublicId: "dms/v1",
      mimeType: "application/pdf",
      fileSize: 100,
    });
  });
});
