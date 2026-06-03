import { z } from "zod";

export const createFolderSchema = z.object({
  name: z.string().trim().min(1).max(255),
  parentId: z.uuid().nullable().optional(),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
