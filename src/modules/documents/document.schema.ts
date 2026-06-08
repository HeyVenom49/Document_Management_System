import z from "zod";

export const uploadDocumentSchema = z.object({
  folderId: z.uuid().nullable().optional(),
});

export const updateDocumentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  folderId: z.uuid().nullable().optional(),
});

export const getDocumentSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const documentIdSchema = z.uuid("Invalid document id");

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type GetDocumentInput = z.infer<typeof getDocumentSchema>;
