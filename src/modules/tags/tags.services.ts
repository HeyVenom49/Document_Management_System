import {
  assertDocumentOwner,
  assertTagOwner,
} from "../../common/access/ownership.ts";
import { tagRepository } from "./tags.repository.ts";

export class TagsServices {
  async create(name: string, userId: string) {
    return await tagRepository.create(name, userId);
  }

  async getTags(userId: string) {
    return await tagRepository.findByOwnerId(userId);
  }

  async deleteTag(tagId: string, userId: string) {
    await assertTagOwner(tagId, userId);
    await tagRepository.delete(tagId);

    return { message: "Tag deleted successfully" };
  }

  async attachTagToDocument(documentId: string, tagId: string, userId: string) {
    await assertDocumentOwner(documentId, userId);
    await assertTagOwner(tagId, userId);

    return await tagRepository.attachToDocument(documentId, tagId);
  }

  async getDocumentTags(documentId: string, userId: string) {
    await assertDocumentOwner(documentId, userId);
    return await tagRepository.getDocumentTags(documentId);
  }

  async removeTagFromDocument(
    documentId: string,
    tagId: string,
    userId: string,
  ) {
    await assertDocumentOwner(documentId, userId);
    await assertTagOwner(tagId, userId);

    await tagRepository.removeFromDocument(documentId, tagId);

    return { message: "Tag removed successfully " };
  }
}

export const tagsService = new TagsServices();
