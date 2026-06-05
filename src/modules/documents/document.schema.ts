import z from "zod";

export const uploadDocumentSchema = z.object({
  folderId: z.uuid().nullable().optional(),
});

export const updateDocumentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  folderId: z.uuid().nullable().optional(),
});

export const documentIdSchema = z.uuid("Invalid document id");

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
