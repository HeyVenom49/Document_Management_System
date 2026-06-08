import type { Request, Response } from "express";
import {
  documentIdParamSchema,
  restoreVersionParamSchema,
  versionIdParamSchema,
} from "./version.schema.ts";
import { versionService } from "./version.service.ts";

export class VersionController {
  async uploadVersion(req: Request, res: Response) {
    const { documentId } = documentIdParamSchema.parse(req.params);

    const version = await versionService.uploadVersion(
      documentId,
      req.file!,
      req.user!.userId,
    );

    return res.status(201).json({
      success: true,
      data: version,
    });
  }

  async getVersions(req: Request, res: Response) {
    const { documentId } = documentIdParamSchema.parse(req.params);

    const versions = await versionService.getVersions(
      documentId,
      req.user!.userId,
    );

    return res.status(200).json({
      success: true,
      data: versions,
    });
  }

  async getVersionById(req: Request, res: Response) {
    const { documentId, versionId } = versionIdParamSchema.parse(req.params);

    const version = await versionService.getVersionById(
      documentId,
      versionId,
      req.user!.userId,
    );

    return res.status(200).json({
      success: true,
      data: version,
    });
  }

  async restoreVersion(
    req: Request<{ id: string; versionId: string }>,
    res: Response,
  ) {
    const { id, versionId } = restoreVersionParamSchema.parse(req.params);

    const document = await versionService.restoreVersion(
      id,
      versionId,
      req.user!.userId,
    );

    res.status(200).json({
      success: true,
      data: document,
    });
  }
}

export const versionController = new VersionController();
