import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createResponse } from "../helpers/http.ts";

const documentId = "11111111-1111-4111-8111-111111111111";
const userId = "user-1";

const activity = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    userId,
    documentId,
    action: "DOCUMENT_UPLOADED",
    metadata: { fileName: "contract.pdf" },
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  },
];

const getDocumentActivity = mock(async () => activity);

mock.module("../../src/modules/audit/audit.services.ts", () => ({
  auditService: { getDocumentActivity },
}));

const { auditController } = await import(
  "../../src/modules/audit/audit.controller.ts"
);

describe("audit endpoints", () => {
  beforeEach(() => {
    getDocumentActivity.mockClear();
  });

  it("GET /documents/:documentId/activity returns document activity", async () => {
    const response = createResponse();

    await auditController.getDocumentActivity(
      {
        params: { documentId },
        user: { userId },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toMatchObject({
      success: true,
      data: activity,
    });
    expect(getDocumentActivity).toHaveBeenCalledWith(documentId, userId);
  });
});
