import "server-only";
import {
  supportMessageSchema,
  type SupportMessageResult,
} from "@/lib/validations/review";
import { sendSupportEmail } from "@/lib/mailgun";

/**
 * Public contact form core shared by the web Server Action and /api/v1.
 * Never leaks Mailgun errors to the client.
 */
export async function sendSupportMessageCore(
  input: Record<string, unknown>
): Promise<SupportMessageResult> {
  const parsed = supportMessageSchema.safeParse(input);
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
