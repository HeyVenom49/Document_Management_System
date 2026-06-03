import type { Request, Response } from "express";
import { createFolderSchema } from "./folder.schema.ts";
import { folderService } from "./folder.service.ts";

export class FolderController {
  async createFolder(req: Request, res: Response) {
    const data = createFolderSchema.parse(req.body);

    const user = await folderService.createFolder(data, req.user!.userId);

    return res.status(201).json({
      success: true,
      data: user,
    });
  }

  async getFolder(req: Request, res: Response) {
    const folder = await folderService.getFolder(req.user!.userId);

    return res.status(201).json({
      success: true,
      data: folder,
    });
  }
}

export const folderController = new FolderController();
