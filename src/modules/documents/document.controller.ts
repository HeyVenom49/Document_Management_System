import type { Request, Response } from "express";
import { uploadDocumentSchema } from "./document.schema.ts";
import { documentService } from "./document.service.ts";

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
    const { id } = req.params;
    if (typeof id !== "string") throw new Error("Invalid id");
    const document = await documentService.getDocumentById(id);

    return res.status(201).json({
      success: true,
      data: document,
    });
  }
}

export const documentController = new DocumentController();
