import { z } from "zod";

export const shareDocumentSchema = z.object({
  email: z.email(),
  permission: z.enum(["viewer", "editor"]),
});

export const shareDocumentParamsSchema = z.object({
  id: z.uuid(),
});

export type ShareDocumentParams = z.infer<typeof shareDocumentParamsSchema>;
export type ShareDocumentInput = z.infer<typeof shareDocumentSchema>;
