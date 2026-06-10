import type { Request, Response } from "express";
import {
  createFolderSchema,
  type CreateFolderInput,
} from "./folder.schema.ts";
import { folderService } from "./folder.service.ts";

export class FolderController {
  async createFolder(req: Request, res: Response) {
    const data: CreateFolderInput = createFolderSchema.parse(req.body);

    const user = await folderService.createFolder(data, req.user!.userId);

    return res.status(201).json({
      success: true,
      data: user,
    });
  }

  async getFolder(req: Request, res: Response) {
    const folder = await folderService.getFolder(req.user!.userId);

    return res.status(200).json({
      success: true,
      data: folder,
    });
  }
}

export const folderController = new FolderController();
