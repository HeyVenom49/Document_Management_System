import type { UploadApiResponse } from "cloudinary";

import cloudinary, { cloudinaryCredentials } from "../../config/cloudinary.ts";

const CLOUDINARY_RESOURCE_TYPES = ["image", "raw", "video"] as const;

type CloudinaryResourceType = (typeof CLOUDINARY_RESOURCE_TYPES)[number];

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

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType?: string | null,
): Promise<void> => {
  const primaryType = resourceType as CloudinaryResourceType | undefined;
  const typesToTry: CloudinaryResourceType[] = primaryType
    ? [
        primaryType,
        ...CLOUDINARY_RESOURCE_TYPES.filter((type) => type !== primaryType),
      ]
    : [...CLOUDINARY_RESOURCE_TYPES];

  for (const type of typesToTry) {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: type,
    });

    if (result.result === "ok") {
      return;
    }
  }
};
