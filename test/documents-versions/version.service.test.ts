import { beforeEach, describe, expect, it, mock } from "bun:test";
import { NotFound } from "../../src/common/errors/not-found.error.ts";

const documentId = "11111111-1111-4111-8111-111111111111";

const findById = mock(async () => ({
  id: documentId,
  name: "contract.pdf",
  ownerId: "user-1",
  currentVersion: 1,
}));

const findShare = mock(async () => null);

const findLatestVersion = mock(async () => ({
  id: "version-1",
  documentId,
  versionNumber: 1,
}));

const createVersion = mock(async (data: { versionNumber: number }) => ({
  id: "version-2",
  documentId,
  ...data,
}));

const uploadToCloudinary = mock(async () => ({
  public_id: "dms/new-file",
  secure_url: "https://res.cloudinary.com/example/new-file.pdf",
}));

const updateVersionMetaData = mock(async () => ({
  id: documentId,
  currentVersion: 2,
}));

mock.module("../../src/modules/documents/document.repository.ts", () => ({
  documentRepository: { findById, updateVersionMetaData },
}));

const findVersionById = mock(async () => ({
  id: "version-1",
  documentId,
  versionNumber: 1,
  fileUrl: "https://res.cloudinary.com/example/v1.pdf",
  cloudinaryPublicId: "dms/v1",
  mimeType: "application/pdf",
  fileSize: 100,
}));

mock.module("../../src/modules/documents-versions/version.repository.ts", () => ({
  versionRepository: { findLatestVersion, createVersion, findVersionById },
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

const { versionService } = await import(
  "../../src/modules/documents-versions/version.service.ts"
);

const file = {
  originalname: "contract-v2.pdf",
  mimetype: "application/pdf",
  size: 200,
  buffer: Buffer.from("%PDF-1.4"),
} as Express.Multer.File;

describe("version service", () => {
  beforeEach(() => {
    findById.mockClear();
    findShare.mockClear();
    findLatestVersion.mockClear();
    createVersion.mockClear();
    uploadToCloudinary.mockClear();
    updateVersionMetaData.mockClear();
    findVersionById.mockClear();
    auditLog.mockClear();

    findById.mockImplementation(async () => ({
      id: documentId,
      name: "contract.pdf",
      ownerId: "user-1",
      currentVersion: 1,
    }));
    findShare.mockImplementation(async () => null);

    findLatestVersion.mockImplementation(async () => ({
      id: "version-1",
      documentId,
      versionNumber: 1,
    }));

    createVersion.mockImplementation(async (data: { versionNumber: number }) => ({
      id: "version-2",
      documentId,
      ...data,
    }));
  });

  it("uploadVersion creates the next version for the document owner", async () => {
    const version = await versionService.uploadVersion(
      documentId,
      file,
      "user-1",
    );

    expect(findById).toHaveBeenCalledWith(documentId);
    expect(findLatestVersion).toHaveBeenCalledWith(documentId);
    expect(uploadToCloudinary).toHaveBeenCalledWith(file.buffer, file.mimetype);
    expect(createVersion).toHaveBeenCalledWith({
      documentId,
      versionNumber: 2,
      cloudinaryPublicId: "dms/new-file",
      fileUrl: "https://res.cloudinary.com/example/new-file.pdf",
      mimeType: "application/pdf",
      fileSize: 200,
    });
    expect(updateVersionMetaData).toHaveBeenCalledWith(documentId, {
      currentVersion: 2,
      fileUrl: "https://res.cloudinary.com/example/new-file.pdf",
      cloudinaryPublicId: "dms/new-file",
      mimeType: "application/pdf",
      fileSize: 200,
    });
    expect(version.versionNumber).toBe(2);
  });

  it("uploadVersion throws NotFound when the document does not exist", async () => {
    findById.mockImplementation(async () => null);

    await expect(
      versionService.uploadVersion(documentId, file, "user-1"),
    ).rejects.toThrow(NotFound);
  });

  it("uploadVersion throws NotFound when the user is not the owner", async () => {
    findById.mockImplementation(async () => ({
      id: documentId,
      name: "contract.pdf",
      ownerId: "other-user",
      currentVersion: 1,
    }));

    await expect(
      versionService.uploadVersion(documentId, file, "user-1"),
    ).rejects.toThrow(NotFound);
  });

  it("uploadVersion starts at version 1 when no prior versions exist", async () => {
    findLatestVersion.mockImplementation(async () => null);

    await versionService.uploadVersion(documentId, file, "user-1");

    expect(createVersion).toHaveBeenCalledWith(
      expect.objectContaining({ versionNumber: 1 }),
    );
  });

  it("downloadVersion returns a signed download payload for the selected version", async () => {
    const download = await versionService.downloadVersion(
      documentId,
      "version-1",
      "user-1",
    );

    expect(findById).toHaveBeenCalledWith(documentId);
    expect(findVersionById).toHaveBeenCalledWith("version-1");
    expect(auditLog).toHaveBeenCalled();
    expect(download).toEqual({
      downloadUrl: "https://res.cloudinary.com/example/download/contract-v1.pdf",
      fileName: "contract-v1.pdf",
      mimeType: "application/pdf",
      fileSize: 100,
    });
  });

  it("restoreVersion updates document metadata to the selected version", async () => {
    updateVersionMetaData.mockImplementation(async () => ({
      id: documentId,
      currentVersion: 1,
    }));

    const document = await versionService.restoreVersion(
      documentId,
      "version-1",
      "user-1",
    );

    expect(updateVersionMetaData).toHaveBeenCalledWith(documentId, {
      currentVersion: 1,
      fileUrl: "https://res.cloudinary.com/example/v1.pdf",
      cloudinaryPublicId: "dms/v1",
      mimeType: "application/pdf",
      fileSize: 100,
    });
    expect(document).toMatchObject({ id: documentId, currentVersion: 1 });
  });
});
