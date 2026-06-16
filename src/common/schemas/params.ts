import { z } from "zod";

export const uuidSchema = (label: string) => z.uuid(`Invalid ${label}`);

export const documentIdSchema = uuidSchema("document id");

export const documentIdParamSchema = z.object({
  documentId: documentIdSchema,
});

export const folderIdParamSchema = z.object({
  folderId: uuidSchema("folder id"),
});

export const versionIdParamSchema = z.object({
  documentId: documentIdSchema,
  versionId: uuidSchema("version id"),
});

export const optionalFolderIdSchema = z.uuid().nullable().optional();

export type DocumentIdInput = z.infer<typeof documentIdSchema>;
export type DocumentIdParamInput = z.infer<typeof documentIdParamSchema>;
export type FolderIdParamInput = z.infer<typeof folderIdParamSchema>;
export type VersionIdParamInput = z.infer<typeof versionIdParamSchema>;
