import "server-only";

const API_BASE = process.env.MAILGUN_API_BASE ?? "https://api.mailgun.net/v3";
const DOMAIN = process.env.MAILGUN_DOMAIN;
const FROM = process.env.MAILGUN_FROM ?? "hngshop <no-reply@mg.hngshop.dev>";

function isConfigured(): boolean {
  return Boolean(process.env.MAILGUN_API_KEY && DOMAIN);
}

export type OrderEmailItem = {
  name: string;
  quantity: number;
  price: string; // formatted per line at purchase price
};

/** Escape user-provided values before embedding them in HTML email bodies. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const BRAND = {
  name: "hngshop",
  primary: "#0f172a",
  accent: "#2563eb",
  muted: "#64748b",
  border: "#e2e8f0",
  background: "#f1f5f9",
};

/**
 * Production-ready order confirmation email.
 * Table-based layout with inline styles only — the only approach that renders
 * reliably across Gmail, Outlook, Apple Mail, etc.
 */
function renderOrderConfirmationHtml(params: {
  fullName: string;
  orderId: string;
  total: string;
  items: OrderEmailItem[];
}): string {
  const { fullName, orderId, total, items } = params;

  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};font-size:14px;color:${BRAND.primary};">
            ${escapeHtml(item.name)}
            <span style="color:${BRAND.muted};"> &times; ${item.quantity}</span>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};font-size:14px;color:${BRAND.primary};text-align:right;white-space:nowrap;">
            ${escapeHtml(item.price)}
          </td>
        </tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:${BRAND.background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.background};padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${BRAND.border};">

            <!-- Header -->
            <tr>
              <td style="background-color:${BRAND.primary};padding:28px 32px;">
                <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">${BRAND.name}</span>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 8px;font-size:22px;line-height:1.3;color:${BRAND.primary};">Thanks for your order, ${escapeHtml(fullName)}!</h1>
                <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:${BRAND.muted};">
                  We've received your order and it's being processed. You'll get another email when it ships.
                </p>

                <!-- Order meta -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr>
                    <td style="background-color:${BRAND.background};border-radius:8px;padding:14px 16px;font-size:14px;color:${BRAND.primary};">
                      <strong>Order number:</strong> ${escapeHtml(orderId)}
                    </td>
                  </tr>
                </table>

                <!-- Items -->
                <p style="margin:0 0 8px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${BRAND.muted};">Order summary</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${itemRows}
                  <tr>
                    <td style="padding:16px 0 0;font-size:15px;font-weight:700;color:${BRAND.primary};">Total</td>
                    <td style="padding:16px 0 0;font-size:15px;font-weight:700;color:${BRAND.primary};text-align:right;white-space:nowrap;">${escapeHtml(total)}</td>
                  </tr>
                </table>

                <!-- CTA -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
                  <tr>
                    <td align="center">
                      <a href="#" style="display:inline-block;background-color:${BRAND.accent};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;">
                        View order status
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px;border-top:1px solid ${BRAND.border};font-size:12px;line-height:1.6;color:${BRAND.muted};text-align:center;">
                Questions? Just reply to this email.<br>
                &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Plain-text alternative — improves deliverability and spam scoring. */
function renderOrderConfirmationText(params: {
  fullName: string;
  orderId: string;
  total: string;
  items: OrderEmailItem[];
}): string {
  const lines = [
    `Thanks for your order, ${params.fullName}!`,
    "",
    `Order number: ${params.orderId}`,
    "",
    "Order summary:",
    ...params.items.map((i) => `  - ${i.name} x${i.quantity}: ${i.price}`),
    "",
    `Total: ${params.total}`,
    "",
    "We'll email you when it ships.",
  ];
  return lines.join("\r\n");
}

/**
 * Send the order confirmation email via the Mailgun API.
 * Returns true on success, false on any failure — callers log but never fail the order.
 */
export async function sendOrderConfirmationEmail(params: {
  to: string;
  fullName: string;
  orderId: string;
  total: string;
  items: OrderEmailItem[];
}): Promise<boolean> {
  if (!isConfigured()) {
    console.warn("[mailgun] MAILGUN_API_KEY / MAILGUN_DOMAIN not set — skipping confirmation email");
    return false;
  }

  const body = new URLSearchParams({
    from: FROM,
    to: params.to,
    subject: `Order confirmation — ${params.orderId.slice(0, 8)}`,
    html: renderOrderConfirmationHtml(params),
    text: renderOrderConfirmationText(params),
  });

  try {
    const response = await fetch(`${API_BASE}/${DOMAIN}/messages`, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      console.error(
        `[mailgun] send failed: ${response.status} ${await response.text()}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error("[mailgun] send error:", error);
    return false;
  }
}

/**
 * Notify a customer that their order status changed.
 * Returns true on success, false on any failure — never blocks the update.
 */
export async function sendOrderStatusEmail(params: {
  to: string;
  fullName: string;
  orderId: string;
  status: string;
}): Promise<boolean> {
  if (!isConfigured()) {
    console.warn("[mailgun] not configured — skipping status email");
    return false;
  }

  const body = new URLSearchParams({
    from: FROM,
    to: params.to,
    subject: `Order ${params.orderId.slice(0, 8)} update — ${params.status}`,
    html: `
      <p>Hi ${escapeHtml(params.fullName)},</p>
      <p>Your order <strong>${escapeHtml(params.orderId)}</strong> is now:
      <strong>${escapeHtml(params.status)}</strong>.</p>
      <p>Thanks for shopping with us!</p>
    `,
  });

  try {
    const response = await fetch(`${API_BASE}/${DOMAIN}/messages`, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    if (!response.ok) {
      console.error(
        `[mailgun] status email failed: ${response.status} ${await response.text()}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error("[mailgun] status email error:", error);
    return false;
  }
}
