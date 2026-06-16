import type { Request, Response } from "express";
import { getUserId } from "../../common/http/request.ts";
import { sendCreated, sendSuccess } from "../../common/http/response.ts";
import {
  createFolderSchema,
  type CreateFolderInput,
} from "./folder.schema.ts";
import { folderService } from "./folder.service.ts";

export class FolderController {
  async createFolder(req: Request, res: Response) {
    const data: CreateFolderInput = createFolderSchema.parse(req.body);
    const folder = await folderService.createFolder(data, getUserId(req));
    return sendCreated(res, folder);
  }

  async getFolder(req: Request, res: Response) {
    const folders = await folderService.getFolder(getUserId(req));
    return sendSuccess(res, folders);
  }
}

export const folderController = new FolderController();
