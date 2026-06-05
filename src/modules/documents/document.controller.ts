import type { Request, Response } from "express";
import {
  documentIdSchema,
  updateDocumentSchema,
  uploadDocumentSchema,
} from "./document.schema.ts";
import { documentService } from "./document.service.ts";
import { success } from "zod";

export class DocumentController {
  async uploadDocument(req: Request, res: Response) {
    const data = uploadDocumentSchema.parse(req.body);

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

    return res.status(201).json({
      success: true,
      data: document,
    });
  }

  async getDocumentById(req: Request<{ id: string }>, res: Response) {
    const id = documentIdSchema.parse(req.params.id);
    const document = await documentService.getDocumentById(
      id,
      req.user!.userId,
    );

    return res.status(201).json({
      success: true,
      data: document,
    });
  }

  async deleteDocument(req: Request<{ id: string }>, res: Response) {
    const id = documentIdSchema.parse(req.params.id);
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
    const { folderId } = req.params;

    const documents = await documentService.getDocumentsByFolder(
      folderId,
      req.user!.userId,
    );

    return res.status(200).json({
      success: true,
      data: documents,
    });
  }

  async updateDocumet(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    const data = updateDocumentSchema.parse(req.body);

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
}

export const documentController = new DocumentController();
