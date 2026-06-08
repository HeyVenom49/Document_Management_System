import z from "zod";

export const documentIdParamSchema = z.object({
  documentId: z.uuid("Invalid document id"),
});

export const versionIdParamSchema = z.object({
  documentId: z.uuid("Invalid document id"),
  versionId: z.uuid("Invalid version id"),
});

export const restoreVersionParamSchema = z.object({
  id: z.uuid(),
  versionId: z.uuid(),
});
