// api/auth/reset.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../../src/db/client";
import bcrypt from "bcryptjs";

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

  const { token, newPassword } = req.body ?? {};
  if (!token || !newPassword) return res.status(400).json({ error: "token e newPassword richiesti" });
  if (newPassword.length < 8) return res.status(400).json({ error: "Password troppo corta (>=8 caratteri)" });

  try {
    await ensureTables();

    const resets = await query<{ id: number; user_id: number; expires_at: string; used: boolean }>(
      "SELECT id, user_id, expires_at, used FROM password_resets WHERE token = $1 LIMIT 1",
      [token]
    );
    const reset = resets[0];
    if (!reset || reset.used) return res.status(400).json({ error: "Token non valido" });
    if (new Date(reset.expires_at).getTime() < Date.now()) return res.status(400).json({ error: "Token scaduto" });

    const hash = await bcrypt.hash(newPassword, 12);
    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [hash, reset.user_id]);
    await query("UPDATE password_resets SET used = TRUE WHERE id = $1", [reset.id]);

    return res.status(200).json({ message: "Password aggiornata con successo" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Errore interno" });
  }
}
