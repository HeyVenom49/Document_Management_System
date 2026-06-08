import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createResponse } from "../helpers/http.ts";

const createFolder = mock(async () => ({
  id: "folder-1",
  name: "Contracts",
  ownerId: "user-1",
  parentId: null,
}));

const getFolder = mock(async () => [
  {
    id: "folder-1",
    name: "Contracts",
    ownerId: "user-1",
    parentId: null,
  },
]);

mock.module("../../src/modules/folders/folder.service.ts", () => ({
  folderService: { createFolder, getFolder },
}));

const { folderController } = await import(
  "../../src/modules/folders/folder.controller.ts"
);

describe("folder endpoints", () => {
  beforeEach(() => {
    createFolder.mockClear();
    getFolder.mockClear();
  });

  it("POST /folder creates a folder for the authenticated user", async () => {
    const response = createResponse();

    await folderController.createFolder(
      {
        body: { name: "Contracts" },
        user: { userId: "user-1" },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.body).toMatchObject({
      success: true,
      data: { name: "Contracts" },
    });
    expect(createFolder).toHaveBeenCalledWith({ name: "Contracts" }, "user-1");
  });

  it("GET /folder returns folders for the authenticated user", async () => {
    const response = createResponse();

    await folderController.getFolder(
      {
        user: { userId: "user-1" },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.body).toMatchObject({
      success: true,
      data: [{ id: "folder-1", name: "Contracts" }],
    });
    expect(getFolder).toHaveBeenCalledWith("user-1");
  });
});
