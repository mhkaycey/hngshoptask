"use server";

import { requireAdmin } from "@/lib/auth";
import { createUploadSignature, isCloudinaryConfigured } from "@/lib/cloudinary";

export type UploadSignature = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
};

/** Admin-only: hand the browser a short-lived signed-upload payload. */
export async function getUploadSignature(): Promise<
  { success: true; data: UploadSignature } | { success: false; message: string }
> {
  await requireAdmin();

  if (!isCloudinaryConfigured()) {
    return {
      success: false,
      message: "Image uploads are not configured (missing CLOUDINARY_* env vars).",
    };
  }

  const data = createUploadSignature(Math.floor(Date.now() / 1000));
  return { success: true, data };
}
