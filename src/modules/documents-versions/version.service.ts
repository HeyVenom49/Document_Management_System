import { BadRequest } from "../../common/errors/bad-request.error.ts";
import { Forbidden } from "../../common/errors/forbidden.error.ts";
import { NotFound } from "../../common/errors/not-found.error.ts";
import { uploadToCloudinary } from "../../common/utils/cloudinary.ts";
import { documentRepository } from "../documents/document.repository.ts";
import { versionRepository } from "./version.repository.ts";

export class VersionService {
  private async assertDocumentOwner(documentId: string, userId: string) {
    const document = await documentRepository.findById(documentId);
    if (!document) throw new NotFound("Document not found");
    if (document.ownerId !== userId) throw new Forbidden("Access Denied");
    return document;
  }

  async uploadVersion(
    documentId: string,
    file: Express.Multer.File | undefined,
    userId: string,
  ) {
    if (!file) throw new BadRequest("File is required");

    await this.assertDocumentOwner(documentId, userId);

    const latest = await versionRepository.findLatestVersion(documentId);
    const nextVersion = (latest?.versionNumber ?? 0) + 1;

    const uploadFile = await uploadToCloudinary(file.buffer, file.mimetype);

    const version = await versionRepository.createVersion({
      documentId,
      versionNumber: nextVersion,
      cloudinaryPublicId: uploadFile.public_id,
      fileUrl: uploadFile.secure_url,
      mimeType: file.mimetype,
      fileSize: file.size,
    });

    await documentRepository.updateVersionMetaData(documentId, {
      currentVersion: nextVersion,
      fileUrl: uploadFile.secure_url,
      cloudinaryPublicId: uploadFile.public_id,
      mimeType: file.mimetype,
      fileSize: file.size,
    });

    return version;
  }

  async getVersions(documentId: string, userId: string) {
    await this.assertDocumentOwner(documentId, userId);
    return await versionRepository.findByDocumentId(documentId);
  }

  async getVersionById(documentId: string, versionId: string, userId: string) {
    await this.assertDocumentOwner(documentId, userId);

    const version = await versionRepository.findVersionById(versionId);
    if (!version || version.documentId !== documentId) {
      throw new NotFound("Version not found");
    }

    return version;
  }

  async restoreVersion(documentId: string, versionId: string, userId: string) {
    await this.assertDocumentOwner(documentId, userId);

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
