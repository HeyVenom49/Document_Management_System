import { NotFound } from "../../common/errors/not-found.error.ts";
import { assertDocumentAccess } from "../../common/access/document-access.ts";
import { AuditAction } from "../../common/constants/audit-action.ts";
import {
  uploadToCloudinary,
  toDownloadPayload,
  withSignedFileUrl,
  withSignedFileUrls,
} from "../../common/utils/cloudinary.ts";
import { buildVersionFileName } from "../../common/utils/download.ts";
import { validateUploadFile } from "../../common/utils/file-validation.ts";
import { requireUploadFile, toVersionFileFields } from "../../common/utils/upload.ts";
import { auditService } from "../audit/audit.services.ts";
import { documentRepository } from "../documents/document.repository.ts";
import { versionRepository } from "./version.repository.ts";

export class VersionService {
  async uploadVersion(
    documentId: string,
    file: Express.Multer.File | undefined,
    userId: string,
  ) {
    const uploadFile = requireUploadFile(file);
    validateUploadFile(uploadFile);

    await assertDocumentAccess(documentId, userId, "editor");

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

    if (!version) {
      throw new NotFound("Version not found");
    }

    await auditService.log({
      userId,
      documentId,
      action: AuditAction.VERSION_CREATED,
      metadata: { versionNumber: nextVersion },
    });

    return withSignedFileUrl(version);
  }

  async getVersions(documentId: string, userId: string) {
    await assertDocumentAccess(documentId, userId, "viewer");
    const versions = await versionRepository.findByDocumentId(documentId);
    return withSignedFileUrls(versions);
  }

  async getVersionById(documentId: string, versionId: string, userId: string) {
    await assertDocumentAccess(documentId, userId, "viewer");

    const version = await versionRepository.findVersionById(versionId);
    if (!version || version.documentId !== documentId) {
      throw new NotFound("Version not found");
    }

    return withSignedFileUrl(version);
  }

  async downloadVersion(
    documentId: string,
    versionId: string,
    userId: string,
  ) {
    const document = await assertDocumentAccess(documentId, userId, "viewer");

    const version = await versionRepository.findVersionById(versionId);
    if (!version || version.documentId !== documentId) {
      throw new NotFound("Version not found");
    }

    const fileName = buildVersionFileName(
      document.name,
      version.versionNumber,
    );

    await auditService.log({
      userId,
      documentId,
      action: AuditAction.VERSION_DOWNLOADED,
      metadata: {
        versionId,
        versionNumber: version.versionNumber,
        fileName,
      },
    });

    return toDownloadPayload(version, fileName);
  }

  async restoreVersion(documentId: string, versionId: string, userId: string) {
    await assertDocumentAccess(documentId, userId, "editor");

    const version = await versionRepository.findVersionById(versionId);

    if (!version || version.documentId !== documentId)
      throw new NotFound("Version not found");

    const document = await documentRepository.updateVersionMetaData(documentId, {
      currentVersion: version.versionNumber,
      fileUrl: version.fileUrl,
      cloudinaryPublicId: version.cloudinaryPublicId,
      fileSize: version.fileSize,
      mimeType: version.mimeType,
    });

    if (!document) {
      throw new NotFound("Document not found");
    }

    await auditService.log({
      userId,
      documentId,
      action: AuditAction.VERSION_RESTORED,
      metadata: {
        versionId,
        versionNumber: version.versionNumber,
      },
    });

    return withSignedFileUrl(document);
  }
}

export const versionService = new VersionService();
