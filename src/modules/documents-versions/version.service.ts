import { NotFound } from "../../common/errors/not-found.error.ts";
import { assertDocumentOwner } from "../../common/access/ownership.ts";
import { uploadToCloudinary } from "../../common/utils/cloudinary.ts";
import { requireUploadFile, toVersionFileFields } from "../../common/utils/upload.ts";
import { documentRepository } from "../documents/document.repository.ts";
import { versionRepository } from "./version.repository.ts";

export class VersionService {
  async uploadVersion(
    documentId: string,
    file: Express.Multer.File | undefined,
    userId: string,
  ) {
    const uploadFile = requireUploadFile(file);

    await assertDocumentOwner(documentId, userId);

    const latest = await versionRepository.findLatestVersion(documentId);
    const nextVersion = (latest?.versionNumber ?? 0) + 1;

    const cloudinaryFile = await uploadToCloudinary(
      uploadFile.buffer,
      uploadFile.mimetype,
    );
    const versionFields = toVersionFileFields(cloudinaryFile, uploadFile);

    const version = await versionRepository.createVersion({
      documentId,
      versionNumber: nextVersion,
      ...versionFields,
    });

    await documentRepository.updateVersionMetaData(documentId, {
      currentVersion: nextVersion,
      ...versionFields,
    });

    return version;
  }

  async getVersions(documentId: string, userId: string) {
    await assertDocumentOwner(documentId, userId);
    return await versionRepository.findByDocumentId(documentId);
  }

  async getVersionById(documentId: string, versionId: string, userId: string) {
    await assertDocumentOwner(documentId, userId);

    const version = await versionRepository.findVersionById(versionId);
    if (!version || version.documentId !== documentId) {
      throw new NotFound("Version not found");
    }

    return version;
  }

  async restoreVersion(documentId: string, versionId: string, userId: string) {
    await assertDocumentOwner(documentId, userId);

    const version = await versionRepository.findVersionById(versionId);

    if (!version || version.documentId !== documentId)
      throw new NotFound("Version not found");

    return await documentRepository.updateVersionMetaData(documentId, {
      currentVersion: version.versionNumber,
      fileUrl: version.fileUrl,
      cloudinaryPublicId: version.cloudinaryPublicId,
      fileSize: version.fileSize,
      mimeType: version.mimeType,
    });
  }
}

export const versionService = new VersionService();
