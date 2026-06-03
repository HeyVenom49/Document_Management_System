import { folderRepository } from "./folder.repository.ts";
import type { CreateFolderInput } from "./folder.schema.ts";

export class FolderService {
  async createFolder(data: CreateFolderInput, userId: string) {
    if (data.parentId) {
      const parentFolder = await folderRepository.findById(data.parentId);

      if (!parentFolder) {
        throw new Error("Parent folder not found");
      }

      if (parentFolder.ownerId !== userId) {
        throw new Error("Access Denied");
      }
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
