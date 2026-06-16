import path from "node:path";
import { BadRequest } from "../errors/bad-request.error.ts";

type FileRule = {
  extensions: string[];
  mimeTypes: string[];
  magic: number[][];
};

const FILE_RULES: FileRule[] = [
  {
    extensions: [".pdf"],
    mimeTypes: ["application/pdf"],
    magic: [[0x25, 0x50, 0x44, 0x46]],
  },
  {
    extensions: [".png"],
    mimeTypes: ["image/png"],
    magic: [[0x89, 0x50, 0x4e, 0x47]],
  },
  {
    extensions: [".jpg", ".jpeg"],
    mimeTypes: ["image/jpeg"],
    magic: [[0xff, 0xd8, 0xff]],
  },
  {
    extensions: [".doc"],
    mimeTypes: ["application/msword"],
    magic: [[0xd0, 0xcf, 0x11, 0xe0]],
  },
  {
    extensions: [".docx"],
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    magic: [[0x50, 0x4b, 0x03, 0x04]],
  },
];

const matchesMagic = (buffer: Buffer, signature: number[]) =>
  signature.every((byte, index) => buffer[index] === byte);

const findRuleByExtension = (extension: string) =>
  FILE_RULES.find((rule) => rule.extensions.includes(extension));

export const validateUploadFile = (file: Express.Multer.File): void => {
  const extension = path.extname(file.originalname).toLowerCase();
  const rule = findRuleByExtension(extension);

  if (!rule) {
    throw new BadRequest("Unsupported file type");
  }

  if (!rule.mimeTypes.includes(file.mimetype)) {
    throw new BadRequest("File content does not match the declared type");
  }

  const hasValidMagic = rule.magic.some((signature) =>
    matchesMagic(file.buffer, signature),
  );

  if (!hasValidMagic) {
    throw new BadRequest("File content does not match the declared type");
  }
};
