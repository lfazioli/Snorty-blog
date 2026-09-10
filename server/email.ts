// server/email.ts
export function getPasswordResetSiteUrl(): string {
  const configured = process.env.SITE_URL?.trim();
  if (!configured) throw new Error("SITE_URL is not configured");
  const url = new URL(configured);
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("SITE_URL must be an HTTPS origin, such as https://snorty.space");
  }
  return url.origin;
}

export function isPasswordResetEmailConfigured(): boolean {
  try {
    getPasswordResetSiteUrl();
    return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim());
  } catch { return false; }
}

// Sends the password reset email through Resend. Both environment variables are
// required: a verified sender address is necessary for delivery to real users.
export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error("Password reset email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(10000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Reset your Snorty Blog password",
      text: `Reset your Snorty Blog password: ${resetLink}\nThis link expires in one hour. If you did not request this, ignore this email.`,
      html: `<p>You requested a password reset.</p><p><a href="${resetLink}">Click here to set a new one</a></p><p>This link expires in one hour. If this wasn't you, you can ignore this email.</p>`,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Resend rejected the email (${response.status}): ${text}`);
  }
}
