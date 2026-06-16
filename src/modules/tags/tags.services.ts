import {
  assertDocumentAccess,
} from "../../common/access/document-access.ts";
import { assertDocumentOwner, assertTagOwner } from "../../common/access/ownership.ts";
import { AuditAction } from "../../common/constants/audit-action.ts";
import { auditService } from "../audit/audit.services.ts";
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
    await assertDocumentAccess(documentId, userId, "editor");
    await assertTagOwner(tagId, userId);

    const relation = await tagRepository.attachToDocument(documentId, tagId);

    await auditService.log({
      userId,
      documentId,
      action: AuditAction.TAG_ADDED,
      metadata: { tagId },
    });

    return relation;
  }

  async getDocumentTags(documentId: string, userId: string) {
    await assertDocumentAccess(documentId, userId, "viewer");
    return await tagRepository.getDocumentTags(documentId);
  }

  async removeTagFromDocument(
    documentId: string,
    tagId: string,
    userId: string,
  ) {
    await assertDocumentAccess(documentId, userId, "editor");
    await assertTagOwner(tagId, userId);

    await tagRepository.removeFromDocument(documentId, tagId);

    await auditService.log({
      userId,
      documentId,
      action: AuditAction.TAG_REMOVED,
      metadata: { tagId },
    });

    return { message: "Tag removed successfully " };
  }
}

export const tagsService = new TagsServices();
