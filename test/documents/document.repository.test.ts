import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repositoryPath = join(
  import.meta.dir,
  "../../src/modules/documents/document.repository.ts",
);

describe("document repository trash and soft delete", () => {
  it("excludes soft-deleted documents from active lookups", () => {
    const source = readFileSync(repositoryPath, "utf8");

    expect(source).toContain("isNull(documents.deletedAt)");
    expect(source).toMatch(/async findById[\s\S]*?isNull\(documents\.deletedAt\)/);
    expect(source).toMatch(
      /async findByOwnerId[\s\S]*?isNull\(documents\.deletedAt\)/,
    );
  });

  it("softDelete sets deletedAt on the document", () => {
    const source = readFileSync(repositoryPath, "utf8");

    const softDeleteBlock = source.slice(
      source.indexOf("async softDelete"),
      source.indexOf("async restore"),
    );

    expect(softDeleteBlock).toContain("deletedAt: new Date()");
  });

  it("restore clears deletedAt on the document", () => {
    const source = readFileSync(repositoryPath, "utf8");

    const restoreBlock = source.slice(
      source.indexOf("async restore"),
      source.indexOf("async findTrashByOwnerId"),
    );

    expect(restoreBlock).toContain("deletedAt: null");
  });

  it("findTrashByOwnerId returns only soft-deleted documents for the owner", () => {
    const source = readFileSync(repositoryPath, "utf8");

    const trashBlock = source.slice(
      source.indexOf("async findTrashByOwnerId"),
      source.indexOf("async findDocumentsIncludingDeleted"),
    );

    expect(trashBlock).toContain("eq(documents.ownerId, ownerId)");
    expect(trashBlock).toContain("isNotNull(documents.deletedAt)");
  });
});
