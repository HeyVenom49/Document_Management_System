import { AppError } from "../../common/errors/app.error.ts";
import { BadRequest } from "../../common/errors/bad-request.error.ts";
import {
  assertDocumentOwner,
  assertDocumentOwnerIncludingDeleted,
  assertFolderOwner,
} from "../../common/access/ownership.ts";
import { uploadToCloudinary } from "../../common/utils/cloudinary.ts";
import { requireUploadFile, toVersionFileFields } from "../../common/utils/upload.ts";
import { versionRepository } from "../documents-versions/version.repository.ts";
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

    return document;
  }

  async getDocuments(userId: string) {
    return await documentRepository.findByOwnerId(userId);
  }

  async getDocumentById(documentId: string, userId: string) {
    return await assertDocumentOwner(documentId, userId);
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
    return await documentRepository.findByFolderId(folderId);
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

    return updatedDocument;
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
      documents,
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

    return restored;
  }

  async getTrash(userId: string) {
    return await documentRepository.findTrashByOwnerId(userId);
  }
}

export const documentService = new DocumentService();
