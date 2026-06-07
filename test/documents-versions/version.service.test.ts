import { beforeEach, describe, expect, it, mock } from "bun:test";
import { Forbidden } from "../../src/common/errors/forbidden.error.ts";
import { NotFound } from "../../src/common/errors/not-found.error.ts";

const documentId = "11111111-1111-4111-8111-111111111111";

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

const createVersion = mock(async (data: { versionNumber: number }) => ({
  id: "version-2",
  documentId,
  ...data,
}));

const uploadToCloudinary = mock(async () => ({
  public_id: "dms/new-file",
  secure_url: "https://res.cloudinary.com/example/new-file.pdf",
}));

const updateVersionMetaData = mock(async () => ({}));

mock.module("../../src/modules/documents/document.repository.ts", () => ({
  documentRepository: { findById, updateVersionMetaData },
}));

mock.module("../../src/modules/documents-versions/version.repository.ts", () => ({
  versionRepository: { findLatestVersion, createVersion },
}));

mock.module("../../src/common/utils/cloudinary.ts", () => ({
  uploadToCloudinary,
}));

const { versionService } = await import(
  "../../src/modules/documents-versions/version.service.ts"
);

const file = {
  originalname: "contract-v2.pdf",
  mimetype: "application/pdf",
  size: 200,
  buffer: Buffer.from("updated-pdf-content"),
} as Express.Multer.File;

describe("version service", () => {
  beforeEach(() => {
    findById.mockClear();
    findLatestVersion.mockClear();
    createVersion.mockClear();
    uploadToCloudinary.mockClear();
    updateVersionMetaData.mockClear();

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

  it("uploadVersion throws Forbidden when the user is not the owner", async () => {
    findById.mockImplementation(async () => ({
      id: documentId,
      name: "contract.pdf",
      ownerId: "other-user",
      currentVersion: 1,
    }));

    await expect(
      versionService.uploadVersion(documentId, file, "user-1"),
    ).rejects.toThrow(Forbidden);
  });

  it("uploadVersion starts at version 1 when no prior versions exist", async () => {
    findLatestVersion.mockImplementation(async () => null);

    await versionService.uploadVersion(documentId, file, "user-1");

    expect(createVersion).toHaveBeenCalledWith(
      expect.objectContaining({ versionNumber: 1 }),
    );
  });
});
