import { BadRequest } from "../../common/errors/bad-request.error.ts";
import { Conflict } from "../../common/errors/conflict.error.ts";
import { Forbidden } from "../../common/errors/forbidden.error.ts";
import { NotFound } from "../../common/errors/not-found.error.ts";
import { documentRepository } from "../documents/document.repository.ts";
import { userRepository } from "../users/user.repository.ts";
import { documentShareRepository } from "./document-share.repository.ts";

export class DocumentShareService {
  async shareDocument(
    documentId: string,
    ownerId: string,
    email: string,
    permission: "viewer" | "editor",
  ) {
    const document = await documentRepository.findById(documentId);

    if (!document) throw new NotFound("Document not found");

    if (document.ownerId !== ownerId) throw new Forbidden("Access Denied");

    const user = await userRepository.findByEmail(email);

    if (!user) throw new NotFound("User not found");

    if (user.id === ownerId) {
      throw new BadRequest("Cannot share document with yourself");
    }

    const existShare = await documentShareRepository.findShare(
      documentId,
      user.id,
    );

    if (existShare) throw new Conflict("Document already shared with user");

    return await documentShareRepository.shareDocument({
      documentId,
      sharedWithUserId: user.id,
      permission,
    });
  }

  async removeShare(documentId: string, userId: string, sharedUserId: string) {
    const document = await documentRepository.findById(documentId);

    if (!document) throw new NotFound("Document not found");

    if (document.ownerId !== userId) throw new Forbidden("Access Denied");

    const share = await documentShareRepository.findShare(
      documentId,
      sharedUserId,
    );

    if (!share) throw new NotFound("Share not found");

    return await documentShareRepository.removeShare(documentId, sharedUserId);
  }
}

export const documentShareService = new DocumentShareService();
