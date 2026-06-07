import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("version repository ordering", () => {
  it("findLatestVersion orders by versionNumber descending", () => {
    const source = readFileSync(
      join(
        import.meta.dir,
        "../../src/modules/documents-versions/version.repository.ts",
      ),
      "utf8",
    );

    const findLatestVersionBlock = source.slice(
      source.indexOf("async findLatestVersion"),
      source.indexOf("async findVersionById"),
    );

    expect(findLatestVersionBlock).toContain(
      "orderBy(desc(documentVersions.versionNumber))",
    );
  });
});
