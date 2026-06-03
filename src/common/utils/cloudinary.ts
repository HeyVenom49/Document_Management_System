import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";

import cloudinary from "../../config/cloudinary.ts";

export const uploadToCloudinary = (
  buffer: Buffer,
  folder = "dms",
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined,
      ) => {
        if (error) return reject(error);

        if (!result) return reject(new Error("Cloudinary upload failed"));

        resolve(result);
      },
    );
    stream.end();
  });
};
