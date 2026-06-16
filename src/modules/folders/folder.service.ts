import { assertFolderOwner } from "../../common/access/ownership.ts";
import { folderRepository } from "./folder.repository.ts";
import type { CreateFolderInput } from "./folder.schema.ts";

export class FolderService {
  async createFolder(data: CreateFolderInput, userId: string) {
    if (data.parentId) {
      await assertFolderOwner(
        data.parentId,
        userId,
        "Parent folder not found",
      );
    }

    const folder = await folderRepository.create({
      name: data.name,
      ownerId: userId,
      parentId: data.parentId ?? null,
    });
    return folder;
  }

  async getFolder(userId: string) {
    return await folderRepository.findByOwnerId(userId);
  }
}

export const folderService = new FolderService();
