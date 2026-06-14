import { z } from "zod";

export const documentIdParamSchema = z.object({
  documentId: z.uuid("Invalid document id"),
});

export const removeShareParamSchema = z.object({
  documentId: z.uuid("Invalid document id"),
  sharedUserId: z.uuid("Invalid user id"),
});

export const shareDocumentSchema = z.object({
  email: z.email(),
  permission: z.enum(["viewer", "editor"]).default("viewer"),
});

export type DocumentIdParamInput = z.infer<typeof documentIdParamSchema>;
export type RemoveShareParamInput = z.infer<typeof removeShareParamSchema>;
export type ShareDocumentInput = z.infer<typeof shareDocumentSchema>;
