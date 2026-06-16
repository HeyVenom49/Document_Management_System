import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createResponse } from "../helpers/http.ts";

const documentId = "11111111-1111-4111-8111-111111111111";
const tagId = "55555555-5555-4555-8555-555555555555";
const userId = "user-1";

const tagRecord = {
  id: tagId,
  name: "important",
  ownerId: userId,
};

const create = mock(async () => tagRecord);
const getTags = mock(async () => [tagRecord]);
const deleteTag = mock(async () => ({ message: "Tag deleted successfully" }));
const attachTagToDocument = mock(async () => ({
  documentId,
  tagId,
}));
const getDocumentTags = mock(async () => [tagRecord]);
const removeTagFromDocument = mock(async () => ({
  message: "Tag removed successfully ",
}));

mock.module("../../src/modules/tags/tags.services.ts", () => ({
  tagsService: {
    create,
    getTags,
    deleteTag,
    attachTagToDocument,
    getDocumentTags,
    removeTagFromDocument,
  },
}));

const { tagController } = await import(
  "../../src/modules/tags/tags.controller.ts"
);

describe("tag endpoints", () => {
  beforeEach(() => {
    create.mockClear();
    getTags.mockClear();
    deleteTag.mockClear();
    attachTagToDocument.mockClear();
    getDocumentTags.mockClear();
    removeTagFromDocument.mockClear();
  });

  it("POST /tags creates a tag", async () => {
    const response = createResponse();

    await tagController.create(
      {
        body: { name: "important" },
        user: { userId },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.body).toMatchObject({
      success: true,
      data: tagRecord,
    });
    expect(create).toHaveBeenCalledWith("important", userId);
  });

  it("GET /tags returns tags for the authenticated user", async () => {
    const response = createResponse();

    await tagController.getTags(
      {
        user: { userId },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toMatchObject({
      success: true,
      data: [tagRecord],
    });
    expect(getTags).toHaveBeenCalledWith(userId);
  });

  it("DELETE /tags/:tagId deletes a tag", async () => {
    const response = createResponse();

    await tagController.deleteTag(
      {
        params: { tagId },
        user: { userId },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toEqual({
      success: true,
      message: "Tag deleted successfully",
    });
    expect(deleteTag).toHaveBeenCalledWith(tagId, userId);
  });

  it("POST /documents/:documentId/tags attaches a tag", async () => {
    const response = createResponse();

    await tagController.attachTagToDocument(
      {
        params: { documentId },
        body: { tagId },
        user: { userId },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.body).toMatchObject({
      success: true,
      data: { documentId, tagId },
    });
    expect(attachTagToDocument).toHaveBeenCalledWith(
      documentId,
      tagId,
      userId,
    );
  });

  it("GET /documents/:documentId/tags returns document tags", async () => {
    const response = createResponse();

    await tagController.getDocumentTags(
      {
        params: { documentId },
        user: { userId },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toMatchObject({
      success: true,
      data: [tagRecord],
    });
    expect(getDocumentTags).toHaveBeenCalledWith(documentId, userId);
  });

  it("DELETE /documents/:documentId/tags/:tagId removes a tag", async () => {
    const response = createResponse();

    await tagController.removeTagFromDocument(
      {
        params: { documentId, tagId },
        user: { userId },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toEqual({
      success: true,
      message: "Tag removed successfully ",
    });
    expect(removeTagFromDocument).toHaveBeenCalledWith(
      documentId,
      tagId,
      userId,
    );
  });
});
