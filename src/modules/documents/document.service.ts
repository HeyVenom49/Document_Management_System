import { BadRequest } from "../../common/errors/bad-request.error.ts";
import { Forbidden } from "../../common/errors/forbidden.error.ts";
import { NotFound } from "../../common/errors/not-found.error.ts";
import { uploadToCloudinary } from "../../common/utils/cloudinary.ts";
import { folderRepository } from "../folders/folder.repository.ts";
import { documentRepository } from "./document.repository.ts";
import type { UploadDocumentInput } from "./document.schema.ts";

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

    const uploadFile = await uploadToCloudinary(
      file.buffer,
      file.mimetype,
    );

    const document = await documentRepository.create({
      name: file.originalname,
      ownerId: userId,
      folderId: data.folderId ?? null,
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

  async getDocumentById(documentId: string) {
    const document = await documentRepository.findById(documentId);

    if (!document) throw new NotFound("Document not found");

    return document;
  }
}

export const documentService = new DocumentService();
