import z from "zod";

export const uploadDocumentSchema = z.object({
  folderId: z.uuid().nullable().optional(),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
