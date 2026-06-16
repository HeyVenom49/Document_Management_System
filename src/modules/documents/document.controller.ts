import type { Request, Response } from "express";
import { getUserId } from "../../common/http/request.ts";
import {
  sendCreated,
  sendMessage,
  sendPaginated,
  sendSuccess,
} from "../../common/http/response.ts";
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
      getUserId(req),
    );

    return sendCreated(res, document);
  }

  async getDocuments(req: Request, res: Response) {
    const documents = await documentService.getDocuments(getUserId(req));
    return sendSuccess(res, documents);
  }

  async getDocumentById(req: Request<{ id: string }>, res: Response) {
    const id: DocumentIdInput = documentIdSchema.parse(req.params.id);
    const document = await documentService.getDocumentById(id, getUserId(req));
    return sendSuccess(res, document);
  }

  async deleteDocument(req: Request<{ id: string }>, res: Response) {
    const id: DocumentIdInput = documentIdSchema.parse(req.params.id);
    const result = await documentService.deleteDocument(id, getUserId(req));
    return sendMessage(res, result.message);
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
      getUserId(req),
    );

    return sendSuccess(res, documents);
  }

  async updateDocument(req: Request<{ id: string }>, res: Response) {
    const id: DocumentIdInput = documentIdSchema.parse(req.params.id);
    const data: UpdateDocumentInput = updateDocumentSchema.parse(req.body);

    const document = await documentService.updateDocument(
      id,
      data,
      getUserId(req),
    );

    return sendSuccess(res, document);
  }

  async searchDocuments(req: Request, res: Response) {
    const query: GetDocumentInput = getDocumentSchema.parse(req.query);
    const result = await documentService.searchDocuments(getUserId(req), query);
    return sendPaginated(res, result.documents, result.pagination);
  }

  async getTrash(req: Request, res: Response) {
    const documents = await documentService.getTrash(getUserId(req));
    return sendSuccess(res, documents);
  }

  async restoreDocument(req: Request<{ id: string }>, res: Response) {
    const id: DocumentIdInput = documentIdSchema.parse(req.params.id);
    const document = await documentService.restoreDocument(id, getUserId(req));
    return sendSuccess(res, document);
  }
}

export const documentController = new DocumentController();
