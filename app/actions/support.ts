"use server";

import {
  supportMessageSchema,
  type SupportMessageResult,
} from "@/lib/validations/review";
import { sendSupportEmail } from "@/lib/mailgun";

/**
 * Public contact form. Validates with Zod and forwards the message to the
 * support inbox via Mailgun. Never leaks Mailgun errors to the client.
 */
export async function sendSupportMessage(
  formData: FormData
): Promise<SupportMessageResult> {
  const parsed = supportMessageSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid message.",
    };
  }

  const sent = await sendSupportEmail(parsed.data);
  if (!sent) {
    return {
      success: false,
      message:
        "We could not send your message right now. Please try again shortly.",
    };
  }
  return { success: true };
}
