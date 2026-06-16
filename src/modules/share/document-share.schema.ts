import { z } from "zod";
import {
  documentIdParamSchema,
  documentIdSchema,
  uuidSchema,
} from "../../common/schemas/params.ts";

export { documentIdParamSchema };
export type { DocumentIdParamInput } from "../../common/schemas/params.ts";

export const removeShareParamSchema = z.object({
  documentId: documentIdSchema,
  sharedUserId: uuidSchema("user id"),
});

export const shareDocumentSchema = z.object({
  email: z.email(),
  permission: z.enum(["viewer", "editor"]).default("viewer"),
});

export type RemoveShareParamInput = z.infer<typeof removeShareParamSchema>;
export type ShareDocumentInput = z.infer<typeof shareDocumentSchema>;
