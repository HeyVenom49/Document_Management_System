import type { Request, Response } from "express";
import { getUserId } from "../../common/http/request.ts";
import { sendCreated, sendSuccess } from "../../common/http/response.ts";
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
      getUserId(req),
      data.email,
      data.permission,
    );

    return sendCreated(res, share);
  }

  async removeShare(req: Request, res: Response) {
    const { documentId, sharedUserId }: RemoveShareParamInput =
      removeShareParamSchema.parse(req.params);

    const share = await documentShareService.removeShare(
      documentId,
      getUserId(req),
      sharedUserId,
    );

    return sendSuccess(res, share);
  }
}

export const documentShareController = new DocumentShareController();
