import type { UploadApiResponse } from "cloudinary";
import { BadRequest } from "../errors/bad-request.error.ts";

export const requireUploadFile = (
  file: Express.Multer.File | undefined,
): Express.Multer.File => {
  if (!file) throw new BadRequest("File is required");
  return file;
};

export const toVersionFileFields = (
  uploadFile: UploadApiResponse,
  file: Express.Multer.File,
) => ({
  cloudinaryPublicId: uploadFile.public_id,
  fileUrl: uploadFile.secure_url,
  mimeType: file.mimetype,
  fileSize: file.size,
});
