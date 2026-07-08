// server/email.ts
// Sends the password reset email.
//
// If RESEND_API_KEY is not configured, the link is simply logged (visible in the
// function logs on Vercel) instead of being emailed. This keeps the flow testable
// in development WITHOUT ever exposing the token in the HTTP response to whoever
// calls /api/auth/forgot (see the security note there).
export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[DEV] No RESEND_API_KEY configured. Reset link for ${to}: ${resetLink}`);
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: "Reset your password",
        html: `<p>You requested a password reset.</p><p><a href="${resetLink}">Click here to set a new one</a></p><p>This link expires in one hour. If this wasn't you, you can ignore this email.</p>`,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("RESEND_ERROR:", response.status, text);
      // We don't block the response to the user for this: the error stays in the
      // logs, so the endpoint still replies in a generic, safe way.
    }
  } catch (err) {
    console.error("RESEND_FETCH_ERROR:", err);
  }
}
