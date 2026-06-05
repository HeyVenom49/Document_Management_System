import z from "zod";

export const uploadDocumentSchema = z.object({
  folderId: z.uuid().nullable().optional(),
});

export const documentIdSchema = z.uuid("Invalid document id");

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
