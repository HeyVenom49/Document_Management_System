import type { Request, Response } from "express";
import {
  documentIdParamSchema,
  removeShareParamSchema,
  shareDocumentSchema,
  type DocumentIdParamInput,
  type RemoveShareParamInput,
  type ShareDocumentInput,
} from "./document-share.schema.ts";
import { documentShareService } from "./document-share.service.ts";

export class DocumentShareController {
  async shareDocument(req: Request, res: Response) {
    const { documentId }: DocumentIdParamInput = documentIdParamSchema.parse(
      req.params,
    );
    const data: ShareDocumentInput = shareDocumentSchema.parse(req.body);

    const share = await documentShareService.shareDocument(
      documentId,
      req.user!.userId,
      data.email,
      data.permission,
    );

    return res.status(201).json({
      success: true,
      data: share,
    });
  }

  async removeShare(req: Request, res: Response) {
    const { documentId, sharedUserId }: RemoveShareParamInput =
      removeShareParamSchema.parse(req.params);

    const share = await documentShareService.removeShare(
      documentId,
      req.user!.userId,
      sharedUserId,
    );

    return res.status(200).json({
      success: true,
      data: share,
    });
  }
}

export const documentShareController = new DocumentShareController();
