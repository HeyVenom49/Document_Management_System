import type { Request, Response } from "express";
import { documentIdParamSchema, type DocumentIdParamInput } from "../../common/schemas/params.ts";
import { getUserId } from "../../common/http/request.ts";
import { sendSuccess } from "../../common/http/response.ts";
import { auditService } from "./audit.services.ts";

export class AuditController {
  async getDocumentActivity(req: Request, res: Response) {
    const { documentId }: DocumentIdParamInput = documentIdParamSchema.parse(
      req.params,
    );

    const activity = await auditService.getDocumentActivity(
      documentId,
      getUserId(req),
    );

    return sendSuccess(res, activity);
  }
}

export const auditController = new AuditController();
