"use server";

import { sendSupportMessageCore } from "@/lib/services/support";
import type { SupportMessageResult } from "@/lib/validations/review";

/**
 * Public contact form. Validates with Zod and forwards the message to the
 * support inbox via Mailgun. Never leaks Mailgun errors to the client.
 */
export async function sendSupportMessage(
  formData: FormData
): Promise<SupportMessageResult> {
  return sendSupportMessageCore({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
}
