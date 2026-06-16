import { describe, expect, it } from "bun:test";
import { buildVersionFileName } from "../../src/common/utils/download.ts";

describe("buildVersionFileName", () => {
  it("appends the version number before the file extension", () => {
    expect(buildVersionFileName("contract.pdf", 2)).toBe("contract-v2.pdf");
  });
});
