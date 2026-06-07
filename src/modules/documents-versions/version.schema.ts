import z from "zod";

export const documentIdParamSchema = z.object({
  documentId: z.uuid("Invalid document id"),
});

export const versionIdParamSchema = z.object({
  documentId: z.uuid("Invalid document id"),
  versionId: z.uuid("Invalid version id"),
});
