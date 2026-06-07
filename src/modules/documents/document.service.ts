import { AppError } from "../../common/errors/app.error.ts";
import { BadRequest } from "../../common/errors/bad-request.error.ts";
import { Forbidden } from "../../common/errors/forbidden.error.ts";
import { NotFound } from "../../common/errors/not-found.error.ts";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../common/utils/cloudinary.ts";
import { versionRepository } from "../documents-versions/version.repository.ts";
import { folderRepository } from "../folders/folder.repository.ts";
import { documentRepository } from "./document.repository.ts";
import type {
  UpdateDocumentInput,
  UploadDocumentInput,
} from "./document.schema.ts";

export class DocumentService {
  async uploadDocument(
    data: UploadDocumentInput,
    file: Express.Multer.File,
    userId: string,
  ) {
    if (!file) {
      throw new BadRequest("File is required");
    }

    if (data.folderId) {
      const folder = await folderRepository.findById(data.folderId);

      if (!folder) {
        throw new NotFound("Folder not found");
      }

      if (folder.ownerId !== userId) {
        throw new Forbidden();
      }
    }

    const uploadFile = await uploadToCloudinary(file.buffer, file.mimetype);

    const document = await documentRepository.create({
      name: file.originalname,
      ownerId: userId,
      folderId: data.folderId ?? null,
      cloudinaryPublicId: uploadFile.public_id,
      cloudinaryResourceType: uploadFile.resource_type,
      fileUrl: uploadFile.secure_url,
      mimeType: file.mimetype,
      fileSize: file.size,
    });

    if (!document) throw new NotFound("Document not found");

    await versionRepository.createVersion({
      documentId: document.id,
      versionNumber: 1,
      cloudinaryPublicId: uploadFile.public_id,
      fileUrl: uploadFile.secure_url,
      mimeType: file.mimetype,
      fileSize: file.size,
    });

    return document;
  }

  async getDocuments(userId: string) {
    return await documentRepository.findByOwnerId(userId);
  }

  async getDocumentById(documentId: string, userId: string) {
    const document = await documentRepository.findById(documentId);

    if (!document) throw new NotFound("Document not found");

    if (document.ownerId !== userId) throw new Forbidden("Access Denied");

    return document;
  }

  async deleteDocument(documentId: string, userId: string) {
    const document = await documentRepository.findById(documentId);

    if (!document) throw new NotFound("Document not found");

    if (document.ownerId !== userId) throw new Forbidden("Access Denied");

    const versions = await versionRepository.findByDocumentId(documentId);
    const publicIds = new Set([
      document.cloudinaryPublicId,
      ...versions.map((version) => version.cloudinaryPublicId),
    ]);

    for (const publicId of publicIds) {
      await deleteFromCloudinary(
        publicId,
        document.cloudinaryResourceType,
      );
    }

    const deleted = await documentRepository.deleteById(documentId);

    if (!deleted) {
      throw new AppError("Failed to delete document record", 500);
    }

    return {
      message: "Document deleted successfully",
    };
  }

  async getDocumentsByFolder(folderId: string, userId: string) {
    const folder = await folderRepository.findById(folderId);

    if (!folder) throw new NotFound("Folder not found");

    if (folder.ownerId !== userId) throw new Forbidden("Access Denied");

    return await documentRepository.findByFolderId(folderId);
  }

  async updateDocument(
    documentId: string,
    data: UpdateDocumentInput,
    userId: string,
  ) {
    const document = await documentRepository.findById(documentId);

    if (!document) throw new NotFound("Document not found");

    if (document.ownerId !== userId) throw new Forbidden("Access Denied");

    if (data.folderId) {
      const folder = await folderRepository.findById(data.folderId);

      if (!folder) throw new NotFound("Folder not found");

      if (folder.ownerId !== userId) throw new Forbidden("Access Denied");
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
}

export const documentService = new DocumentService();
