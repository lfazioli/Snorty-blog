// api/auth/forgot.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { pool, ensureSchema } from "../../server/db.js";
import { isPasswordResetEmailConfigured, sendPasswordResetEmail } from "../../server/email.js";

function getSiteUrl(req: VercelRequest): string {
  const envUrl = process.env.SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  return `${proto}://${host}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { email } = req.body ?? {};
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }
    const normalizedEmail = email.trim().toLowerCase();

    // Do this before checking the account so an unavailable mail service cannot
    // reveal whether a given email address is registered.
    if (!isPasswordResetEmailConfigured()) {
      console.error("FORGOT_EMAIL_NOT_CONFIGURED: missing RESEND_API_KEY or RESEND_FROM_EMAIL");
      return res.status(503).json({ error: "Password reset emails are temporarily unavailable. Please try again later." });
    }

    await ensureSchema();

    // Same response whether the user exists or not: we never reveal which emails are registered.
    const genericResponse = { message: "If that email exists, you'll receive a reset link." };

    const users = await pool.query("SELECT id FROM users WHERE email = $1 LIMIT 1", [normalizedEmail]);
    const user = users.rows[0];
    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await pool.query(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, token, expiresAt]
    );

    // The token is never returned in the HTTP response. BrowserRouter expects a
    // normal path (without #) when the recipient opens the email link.
    const resetLink = `${getSiteUrl(req)}/reset-password/${token}`;
    await sendPasswordResetEmail(normalizedEmail, resetLink);

    return res.status(200).json(genericResponse);
  } catch (e: any) {
    console.error("FORGOT_ERROR:", e?.message || e, e?.stack);
    return res.status(500).json({ error: "Internal error" });
  }
}
