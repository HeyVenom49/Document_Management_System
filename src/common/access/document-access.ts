import { Forbidden } from "../errors/forbidden.error.ts";
import { NotFound } from "../errors/not-found.error.ts";
import { documentRepository } from "../../modules/documents/document.repository.ts";
import { documentShareRepository } from "../../modules/share/document-share.repository.ts";

export type SharePermission = "viewer" | "editor";

const PERMISSION_RANK: Record<SharePermission, number> = {
  viewer: 1,
  editor: 2,
};

export async function assertDocumentAccess(
  documentId: string,
  userId: string,
  requiredPermission: SharePermission = "viewer",
) {
  const document = await documentRepository.findById(documentId);

  if (!document) {
    throw new NotFound("Document not found");
  }

  if (document.ownerId === userId) {
    return document;
  }

  const share = await documentShareRepository.findShare(documentId, userId);

  if (!share) {
    throw new NotFound("Document not found");
  }

  if (
    PERMISSION_RANK[share.permission] < PERMISSION_RANK[requiredPermission]
  ) {
    throw new Forbidden("Access Denied");
  }

  return document;
}
