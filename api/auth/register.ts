// api/auth/register.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../../src/db/client";
import bcrypt from "bcryptjs";

async function ensureUsers() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo non permesso" });

  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "email e password richiesti" });
  if (typeof email !== "string" || typeof password !== "string") return res.status(400).json({ error: "formato non valido" });
  if (password.length < 8) return res.status(400).json({ error: "Password troppo corta (>=8 caratteri)" });

  try {
    await ensureUsers();

    const existing = await query<{ id: number }>("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
    if (existing.length > 0) return res.status(409).json({ error: "Utente già registrato" });

    const hash = await bcrypt.hash(password, 12);
    const inserted = await query<{ id: number; email: string; created_at: string }>(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
      [email, hash]
    );

    return res.status(201).json({ user: inserted[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Errore interno" });
  }
}
