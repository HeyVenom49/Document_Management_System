import type { Request, Response } from "express";
import { getUserId } from "../../common/http/request.ts";
import { sendCreated, sendSuccess, sendDownloadRedirect } from "../../common/http/response.ts";
import {
  documentIdParamSchema,
  versionIdParamSchema,
  type DocumentIdParamInput,
  type VersionIdParamInput,
} from "./version.schema.ts";
import { versionService } from "./version.service.ts";

export class VersionController {
  async uploadVersion(req: Request, res: Response) {
    const { documentId }: DocumentIdParamInput = documentIdParamSchema.parse(
      req.params,
    );

    const version = await versionService.uploadVersion(
      documentId,
      req.file,
      getUserId(req),
    );

    return sendCreated(res, version);
  }

  async getVersions(req: Request, res: Response) {
    const { documentId }: DocumentIdParamInput = documentIdParamSchema.parse(
      req.params,
    );

    const versions = await versionService.getVersions(documentId, getUserId(req));
    return sendSuccess(res, versions);
  }

  async getVersionById(req: Request, res: Response) {
    const { documentId, versionId }: VersionIdParamInput =
      versionIdParamSchema.parse(req.params);

    const version = await versionService.getVersionById(
      documentId,
      versionId,
      getUserId(req),
    );

    return sendSuccess(res, version);
  }

  async downloadVersion(req: Request, res: Response) {
    const { documentId, versionId }: VersionIdParamInput =
      versionIdParamSchema.parse(req.params);

    const download = await versionService.downloadVersion(
      documentId,
      versionId,
      getUserId(req),
    );

    return sendDownloadRedirect(res, download.downloadUrl);
  }

  async restoreVersion(req: Request, res: Response) {
    const { documentId, versionId }: VersionIdParamInput =
      versionIdParamSchema.parse(req.params);

    const document = await versionService.restoreVersion(
      documentId,
      versionId,
      getUserId(req),
    );

    return sendSuccess(res, document);
  }
}

export const versionController = new VersionController();
