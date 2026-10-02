import "server-only";
import { createHash } from "node:crypto";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const FOLDER = process.env.CLOUDINARY_FOLDER ?? "hngshop";

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && API_KEY && API_SECRET);
}

/**
 * Create a signed-upload signature for direct browser uploads.
 * Cloudinary signs the alphabetized `key=value` params (excluding file,
 * api_key, and resource_type) concatenated with the API secret, SHA-1 hex.
 */
export function createUploadSignature(timestamp: number): {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
} {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }

  const params = { folder: FOLDER, timestamp: String(timestamp) };
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key as keyof typeof params]}`)
    .join("&");

  const signature = createHash("sha1")
    .update(toSign + API_SECRET)
    .digest("hex");

  return { signature, timestamp, apiKey: API_KEY!, cloudName: CLOUD_NAME!, folder: FOLDER };
}

/** Validate that a URL belongs to this app's Cloudinary cloud. */
export function isCloudinaryUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "res.cloudinary.com" &&
      parsed.pathname.startsWith(`/${CLOUD_NAME}/`)
    );
  } catch {
    return false;
  }
}
