import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createResponse } from "../helpers/http.ts";

const documentId = "11111111-1111-4111-8111-111111111111";
const sharedUserId = "33333333-3333-4333-8333-333333333333";
const userId = "user-1";

const shareRecord = {
  id: "44444444-4444-4444-8444-444444444444",
  documentId,
  sharedWithUserId: sharedUserId,
  permission: "viewer" as const,
};

const shareDocument = mock(async () => shareRecord);
const removeShare = mock(async () => shareRecord);

mock.module("../../src/modules/share/document-share.service.ts", () => ({
  documentShareService: {
    shareDocument,
    removeShare,
  },
}));

const { documentShareController } = await import(
  "../../src/modules/share/document-share.controller.ts"
);

describe("document share endpoints", () => {
  beforeEach(() => {
    shareDocument.mockClear();
    removeShare.mockClear();
  });

  it("POST /documents/:documentId/share shares a document with another user", async () => {
    const response = createResponse();

    await documentShareController.shareDocument(
      {
        params: { documentId },
        body: { email: "collaborator@example.com", permission: "editor" },
        user: { userId },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.body).toMatchObject({
      success: true,
      data: shareRecord,
    });
    expect(shareDocument).toHaveBeenCalledWith(
      documentId,
      userId,
      "collaborator@example.com",
      "editor",
    );
  });

  it("DELETE /documents/:documentId/share/:sharedUserId removes a share", async () => {
    const response = createResponse();

    await documentShareController.removeShare(
      {
        params: { documentId, sharedUserId },
        user: { userId },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toMatchObject({
      success: true,
      data: shareRecord,
    });
    expect(removeShare).toHaveBeenCalledWith(
      documentId,
      userId,
      sharedUserId,
    );
  });
});
