import type { Request, Response } from "express";
import {
  documentIdSchema,
  folderIdParamSchema,
  getDocumentSchema,
  updateDocumentSchema,
  uploadDocumentSchema,
  type DocumentIdInput,
  type FolderIdParamInput,
  type GetDocumentInput,
  type UpdateDocumentInput,
  type UploadDocumentInput,
} from "./document.schema.ts";
import { documentService } from "./document.service.ts";

export class DocumentController {
  async uploadDocument(req: Request, res: Response) {
    const data: UploadDocumentInput = uploadDocumentSchema.parse(req.body);

    const document = await documentService.uploadDocument(
      data,
      req.file!,
      req.user!.userId,
    );

    return res.status(201).json({
      success: true,
      data: document,
    });
  }

  async getDocuments(req: Request, res: Response) {
    const document = await documentService.getDocuments(req.user!.userId);

    return res.status(200).json({
      success: true,
      data: document,
    });
  }

  async getDocumentById(req: Request<{ id: string }>, res: Response) {
    const id: DocumentIdInput = documentIdSchema.parse(req.params.id);
    const document = await documentService.getDocumentById(
      id,
      req.user!.userId,
    );

    return res.status(200).json({
      success: true,
      data: document,
    });
  }

  async deleteDocument(req: Request<{ id: string }>, res: Response) {
    const id: DocumentIdInput = documentIdSchema.parse(req.params.id);
    const result = await documentService.deleteDocument(id, req.user!.userId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  }

  async getDocumentsByFolder(
    req: Request<{ folderId: string }>,
    res: Response,
  ) {
    const { folderId }: FolderIdParamInput = folderIdParamSchema.parse(
      req.params,
    );

    const documents = await documentService.getDocumentsByFolder(
      folderId,
      req.user!.userId,
    );

    return res.status(200).json({
      success: true,
      data: documents,
    });
  }

  async updateDocument(req: Request<{ id: string }>, res: Response) {
    const id: DocumentIdInput = documentIdSchema.parse(req.params.id);
    const data: UpdateDocumentInput = updateDocumentSchema.parse(req.body);

    const document = await documentService.updateDocument(
      id,
      data,
      req.user!.userId,
    );

    return res.status(200).json({
      success: true,
      data: document,
    });
  }

  async searchDocuments(req: Request, res: Response) {
    const query: GetDocumentInput = getDocumentSchema.parse(req.query);

    const result = await documentService.searchDocuments(
      req.user!.userId,
      query,
    );

    return res.status(200).json({
      success: true,
      data: result.documents,
      pagination: result.pagination,
    });
  }

  async getTrash(req: Request, res: Response) {
    const documents = await documentService.getTrash(req.user!.userId);

    return res.status(200).json({
      success: true,
      data: documents,
    });
  }

  async restoreDocument(req: Request<{ id: string }>, res: Response) {
    const id: DocumentIdInput = documentIdSchema.parse(req.params.id);
    const document = await documentService.restoreDocument(
      id,
      req.user!.userId,
    );

    return res.status(200).json({
      success: true,
      data: document,
    });
  }
}

export const documentController = new DocumentController();
