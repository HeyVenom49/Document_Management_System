import path from "node:path";

export const buildVersionFileName = (
  documentName: string,
  versionNumber: number,
): string => {
  const extension = path.extname(documentName);
  const baseName = path.basename(documentName, extension);
  return `${baseName}-v${versionNumber}${extension}`;
};
