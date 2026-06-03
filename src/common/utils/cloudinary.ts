import type { UploadApiResponse } from "cloudinary";

import cloudinary, {
  cloudinaryCredentials,
} from "../../config/cloudinary.ts";

export const uploadToCloudinary = (
  buffer: Buffer,
  mimeType: string,
  folder = "dms",
): Promise<UploadApiResponse> => {
  const dataUri = `data:${mimeType || "application/octet-stream"};base64,${buffer.toString("base64")}`;

  return cloudinary.uploader.upload(dataUri, {
    ...cloudinaryCredentials,
    folder,
    resource_type: "auto",
  });
};
