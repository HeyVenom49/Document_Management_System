import { z } from "zod";
import { documentIdParamSchema, uuidSchema } from "../../common/schemas/params.ts";

export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
});

export const tagIdParamSchema = z.object({
  tagId: uuidSchema("tag id"),
});

export const documentTagParamSchema = documentIdParamSchema.extend({
  tagId: uuidSchema("tag id"),
});

export const attachTagSchema = z.object({
  tagId: uuidSchema("tag id"),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type TagIdParamInput = z.infer<typeof tagIdParamSchema>;
export type DocumentTagParamInput = z.infer<typeof documentTagParamSchema>;
export type AttachTagInput = z.infer<typeof attachTagSchema>;
