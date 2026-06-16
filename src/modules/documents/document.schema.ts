import z from "zod";
import {
  documentIdSchema,
  folderIdParamSchema,
  optionalFolderIdSchema,
  type DocumentIdInput,
  type FolderIdParamInput,
} from "../../common/schemas/params.ts";

export const uploadDocumentSchema = z.object({
  folderId: optionalFolderIdSchema,
});

export const updateDocumentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  folderId: optionalFolderIdSchema,
});

export const getDocumentSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export { documentIdSchema, folderIdParamSchema };
export type { DocumentIdInput, FolderIdParamInput };

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type GetDocumentInput = z.infer<typeof getDocumentSchema>;
