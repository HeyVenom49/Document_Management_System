import { v2 as cloudinary } from "cloudinary";
import { AppError } from "../common/errors/app.error.ts";

import "./env.ts";

function readCloudinaryCredentials() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const missing = [
    !cloudName && "CLOUDINARY_CLOUD_NAME",
    !apiKey && "CLOUDINARY_API_KEY",
    !apiSecret && "CLOUDINARY_API_SECRET",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new AppError(
      `Missing Cloudinary env vars: ${missing.join(", ")}. Add them to .env and restart the server.`,
      500,
    );
  }

  return {
    cloud_name: cloudName!,
    api_key: apiKey!,
    api_secret: apiSecret!,
  };
}

export const cloudinaryCredentials = readCloudinaryCredentials();

cloudinary.config(cloudinaryCredentials);

export default cloudinary;
