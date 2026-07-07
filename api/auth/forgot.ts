// api/auth/forgot.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { pool, ensureSchema } from "../../server/db.js";
import { sendPasswordResetEmail } from "../../server/email.js";

function getSiteUrl(req: VercelRequest): string {
  const envUrl = process.env.SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  return `${proto}://${host}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Metodo non permesso" });

    const { email } = req.body ?? {};
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "email richiesta" });
    }
    const normalizedEmail = email.trim().toLowerCase();

    await ensureSchema();

    // Risposta identica sia che l'utente esista o meno: non riveliamo quali email sono registrate.
    const genericResponse = { message: "Se l'email esiste, riceverai un link di reset." };

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

    // IMPORTANTE: il token NON viene mai restituito in questa risposta HTTP.
    // Prima veniva incluso nel JSON (resetToken/resetLink): chiunque conoscesse
    // l'email di un utente poteva così resettargli la password senza accedere
    // alla sua casella email. Ora l'unico modo per ottenere il link è riceverlo
    // via email (o leggerlo nei log della function, se non hai ancora configurato
    // RESEND_API_KEY — vedi server/email.ts).
    // Usa l'hash (#) perché il sito usa HashRouter: un link "reale" cliccato da
    // un client email deve contenere #/... per essere riconosciuto da React Router.
    const resetLink = `${getSiteUrl(req)}/#/reset-password/${token}`;
    await sendPasswordResetEmail(normalizedEmail, resetLink);

    return res.status(200).json(genericResponse);
  } catch (e: any) {
    console.error("FORGOT_ERROR:", e?.message || e, e?.stack);
    return res.status(500).json({ error: "Errore interno" });
  }
}
