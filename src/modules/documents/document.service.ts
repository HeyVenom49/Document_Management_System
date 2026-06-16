import { AppError } from "../../common/errors/app.error.ts";
import { BadRequest } from "../../common/errors/bad-request.error.ts";
import { assertDocumentAccess } from "../../common/access/document-access.ts";
import {
  assertDocumentOwner,
  assertDocumentOwnerIncludingDeleted,
  assertFolderOwner,
} from "../../common/access/ownership.ts";
import { AuditAction } from "../../common/constants/audit-action.ts";
import {
  uploadToCloudinary,
  toDownloadPayload,
  deleteFromCloudinary,
  withSignedFileUrl,
  withSignedFileUrls,
} from "../../common/utils/cloudinary.ts";
import { validateUploadFile } from "../../common/utils/file-validation.ts";
import { requireUploadFile, toVersionFileFields } from "../../common/utils/upload.ts";
import { auditService } from "../audit/audit.services.ts";
import { versionRepository } from "../documents-versions/version.repository.ts";
import { documentShareRepository } from "../share/document-share.repository.ts";
import { documentRepository } from "./document.repository.ts";
import type {
  GetDocumentInput,
  UpdateDocumentInput,
  UploadDocumentInput,
} from "./document.schema.ts";

export class DocumentService {
  async uploadDocument(
    data: UploadDocumentInput,
    file: Express.Multer.File,
    userId: string,
  ) {
    const uploadFile = requireUploadFile(file);
    validateUploadFile(uploadFile);

    if (data.folderId) {
      await assertFolderOwner(data.folderId, userId);
    }

    const cloudinaryFile = await uploadToCloudinary(
      uploadFile.buffer,
      uploadFile.mimetype,
    );
    const versionFields = toVersionFileFields(cloudinaryFile, uploadFile);

    const document = await documentRepository.create({
      name: uploadFile.originalname,
      ownerId: userId,
      folderId: data.folderId ?? null,
      cloudinaryResourceType: cloudinaryFile.resource_type,
      ...versionFields,
    });

    if (!document) throw new BadRequest("Failed to create document");

    await versionRepository.createVersion({
      documentId: document.id,
      versionNumber: 1,
      ...versionFields,
    });

    await auditService.log({
      userId,
      documentId: document.id,
      action: AuditAction.DOCUMENT_UPLOADED,
      metadata: {
        fileName: document.name,
        mimeType: document.mimeType,
      },
    });

    return withSignedFileUrl(document);
  }

  async getDocuments(userId: string) {
    const documents = await documentRepository.findByOwnerId(userId);
    return withSignedFileUrls(documents);
  }

  async getSharedDocuments(userId: string) {
    const sharedDocuments =
      await documentShareRepository.findSharedWithUser(userId);

    return sharedDocuments.map(({ document, permission, sharedAt }) => ({
      ...withSignedFileUrl(document),
      sharePermission: permission,
      sharedAt,
    }));
  }

  async getDocumentById(documentId: string, userId: string) {
    const document = await assertDocumentAccess(documentId, userId, "viewer");
    return withSignedFileUrl(document);
  }

  async downloadDocument(documentId: string, userId: string) {
    const document = await assertDocumentAccess(documentId, userId, "viewer");

    await auditService.log({
      userId,
      documentId,
      action: AuditAction.DOCUMENT_DOWNLOADED,
      metadata: {
        fileName: document.name,
        versionNumber: document.currentVersion,
      },
    });

    return toDownloadPayload(document, document.name);
  }

  async deleteDocument(documentId: string, userId: string) {
    await assertDocumentOwner(documentId, userId);

    const deleted = await documentRepository.softDelete(documentId);

    if (!deleted) {
      throw new AppError("Failed to delete document record", 500);
    }

    return {
      message: "Document deleted successfully",
    };
  }

  async getDocumentsByFolder(folderId: string, userId: string) {
    await assertFolderOwner(folderId, userId);
    const documents = await documentRepository.findByFolderId(folderId);
    return withSignedFileUrls(documents);
  }

  async updateDocument(
    documentId: string,
    data: UpdateDocumentInput,
    userId: string,
  ) {
    await assertDocumentOwner(documentId, userId);

    if (data.folderId) {
      await assertFolderOwner(data.folderId, userId);
    }

    const updateData: {
      name?: string;
      folderId?: string | null;
    } = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.folderId !== undefined) updateData.folderId = data.folderId;

    if (Object.keys(updateData).length === 0) {
      throw new BadRequest("No update fields provided");
    }

    const updatedDocument = await documentRepository.updateById(
      documentId,
      updateData,
    );

    if (!updatedDocument) {
      throw new AppError("Failed to update document", 500);
    }

    return withSignedFileUrl(updatedDocument);
  }

  async searchDocuments(userId: string, query: GetDocumentInput) {
    const { search, page, limit } = query;
    const documents = await documentRepository.findDocuments(
      userId,
      search,
      page,
      limit,
    );

    const total = await documentRepository.countDocuments(userId, search);

    return {
      documents: withSignedFileUrls(documents),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async restoreDocument(documentId: string, userId: string) {
    const document = await assertDocumentOwnerIncludingDeleted(
      documentId,
      userId,
    );

    if (!document.deletedAt) {
      throw new BadRequest("Document is not in trash");
    }

    const restored = await documentRepository.restore(documentId);

    if (!restored) {
      throw new AppError("Failed to restore document", 500);
    }

    return withSignedFileUrl(restored);
  }

  async getTrash(userId: string) {
    const documents = await documentRepository.findTrashByOwnerId(userId);
    return withSignedFileUrls(documents);
  }

  async permanentlyDeleteDocument(documentId: string, userId: string) {
    const document = await assertDocumentOwnerIncludingDeleted(
      documentId,
      userId,
    );

    if (!document.deletedAt) {
      throw new BadRequest("Document must be in trash before permanent deletion");
    }

    const versions = await versionRepository.findByDocumentId(documentId);
    const cloudinaryAssets = new Map<string, string | null | undefined>();

    for (const version of versions) {
      cloudinaryAssets.set(version.cloudinaryPublicId, document.cloudinaryResourceType);
    }

    cloudinaryAssets.set(
      document.cloudinaryPublicId,
      document.cloudinaryResourceType,
    );

    for (const [publicId, resourceType] of cloudinaryAssets) {
      await deleteFromCloudinary(publicId, resourceType);
    }

    await documentShareRepository.removeAllSharesForDocument(documentId);

    const deleted = await documentRepository.hardDelete(documentId);

    if (!deleted) {
      throw new AppError("Failed to permanently delete document", 500);
    }

    await auditService.log({
      userId,
      documentId,
      action: AuditAction.DOCUMENT_PERMANENTLY_DELETED,
      metadata: { fileName: document.name },
    });

    return {
      message: "Document permanently deleted",
    };
  }
}

export const documentService = new DocumentService();
