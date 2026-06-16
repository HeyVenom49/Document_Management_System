import type { Request, Response } from "express";
import { documentIdParamSchema, type DocumentIdParamInput } from "../../common/schemas/params.ts";
import { getUserId } from "../../common/http/request.ts";
import {
  sendCreated,
  sendMessage,
  sendSuccess,
} from "../../common/http/response.ts";
import {
  attachTagSchema,
  createTagSchema,
  documentTagParamSchema,
  tagIdParamSchema,
  type AttachTagInput,
  type CreateTagInput,
  type DocumentTagParamInput,
  type TagIdParamInput,
} from "./tags.schema.ts";
import { tagsService } from "./tags.services.ts";

export class TagController {
  async create(req: Request, res: Response) {
    const data: CreateTagInput = createTagSchema.parse(req.body);
    const tag = await tagsService.create(data.name, getUserId(req));
    return sendCreated(res, tag);
  }

  async getTags(req: Request, res: Response) {
    const tags = await tagsService.getTags(getUserId(req));
    return sendSuccess(res, tags);
  }

  async deleteTag(req: Request, res: Response) {
    const { tagId }: TagIdParamInput = tagIdParamSchema.parse(req.params);
    const result = await tagsService.deleteTag(tagId, getUserId(req));
    return sendMessage(res, result.message);
  }

  async attachTagToDocument(req: Request, res: Response) {
    const { documentId }: DocumentIdParamInput = documentIdParamSchema.parse(
      req.params,
    );
    const data: AttachTagInput = attachTagSchema.parse(req.body);

    const relation = await tagsService.attachTagToDocument(
      documentId,
      data.tagId,
      getUserId(req),
    );

    return sendCreated(res, relation);
  }

  async getDocumentTags(req: Request, res: Response) {
    const { documentId }: DocumentIdParamInput = documentIdParamSchema.parse(
      req.params,
    );

    const tags = await tagsService.getDocumentTags(documentId, getUserId(req));
    return sendSuccess(res, tags);
  }

  async removeTagFromDocument(req: Request, res: Response) {
    const { documentId, tagId }: DocumentTagParamInput =
      documentTagParamSchema.parse(req.params);

    const result = await tagsService.removeTagFromDocument(
      documentId,
      tagId,
      getUserId(req),
    );

    return sendMessage(res, result.message);
  }
}

export const tagController = new TagController();
