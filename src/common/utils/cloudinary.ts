import type { UploadApiResponse } from "cloudinary";

import cloudinary, { cloudinaryCredentials } from "../../config/cloudinary.ts";

const CLOUDINARY_RESOURCE_TYPES = ["image", "raw", "video"] as const;
const SIGNED_URL_TTL_SECONDS = 60 * 60;
const DOWNLOAD_URL_TTL_SECONDS = 15 * 60;

type CloudinaryResourceType = (typeof CLOUDINARY_RESOURCE_TYPES)[number];

const sanitizeDownloadFileName = (fileName: string) =>
  fileName.replace(/[^\w.\-() ]/g, "_");

const buildSignedUrl = (
  publicId: string,
  resourceType: string | null | undefined,
  expiresInSeconds: number,
  flags?: string,
) =>
  cloudinary.url(publicId, {
    resource_type: (resourceType as CloudinaryResourceType | undefined) ?? "raw",
    type: "authenticated",
    sign_url: true,
    secure: true,
    ...(flags ? { flags } : {}),
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
  });

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
    type: "authenticated",
  });
};

export const getSignedFileUrl = (
  publicId: string,
  resourceType?: string | null,
  expiresInSeconds = SIGNED_URL_TTL_SECONDS,
): string => buildSignedUrl(publicId, resourceType, expiresInSeconds);

export const getSignedDownloadUrl = (
  publicId: string,
  fileName: string,
  resourceType?: string | null,
  expiresInSeconds = DOWNLOAD_URL_TTL_SECONDS,
): string =>
  buildSignedUrl(
    publicId,
    resourceType,
    expiresInSeconds,
    `attachment:${sanitizeDownloadFileName(fileName)}`,
  );

export type DownloadPayload = {
  downloadUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
};

export const toDownloadPayload = (
  resource: FileResource & { mimeType: string; fileSize: number },
  fileName: string,
): DownloadPayload => ({
  downloadUrl: getSignedDownloadUrl(
    resource.cloudinaryPublicId,
    fileName,
    resource.cloudinaryResourceType,
  ),
  fileName,
  mimeType: resource.mimeType,
  fileSize: resource.fileSize,
});

type FileResource = {
  cloudinaryPublicId: string;
  cloudinaryResourceType?: string | null;
  fileUrl: string;
};

export const withSignedFileUrl = <T extends FileResource>(resource: T): T => ({
  ...resource,
  fileUrl: getSignedFileUrl(
    resource.cloudinaryPublicId,
    resource.cloudinaryResourceType,
  ),
});

export const withSignedFileUrls = <T extends FileResource>(resources: T[]): T[] =>
  resources.map(withSignedFileUrl);

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
      type: "authenticated",
    });

    if (result.result === "ok") {
      return;
    }
  }
};
