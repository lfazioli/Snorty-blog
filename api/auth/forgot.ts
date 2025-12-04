// api/auth/forgot.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../../src/db/client";
import crypto from "crypto";

async function ensureTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo non permesso" });

  const { email } = req.body ?? {};
  if (!email) return res.status(400).json({ error: "email richiesto" });

  try {
    await ensureTables();

    const users = await query<{ id: number }>("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
    const user = users[0];

    if (!user) return res.status(200).json({ message: "Se l'email esiste, invieremo un link di reset" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await query("INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)", [
      user.id,
      token,
      expiresAt,
    ]);

    return res.status(200).json({
      message: "Link di reset generato. Controlla la tua email (in dev usa il link qui sotto).",
      resetToken: token,
      resetLink: `/reset-password/${token}`,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Errore interno" });
  }
}
