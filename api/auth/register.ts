// api/auth/register.ts
// Define lightweight local types to avoid depending on '@vercel/node' type package
type VercelRequest = {
  method?: string;
  body?: any;
};
type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: any) => void;
};

import { db } from "../../src/db/client";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo non permesso" });

  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "email e password richiesti" });
  if (typeof email !== "string" || typeof password !== "string") return res.status(400).json({ error: "formato non valido" });
  if (password.length < 8) return res.status(400).json({ error: "password troppo corta (>=8)" });

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    const existing = await db.execute(sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`);
    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(409).json({ error: "Utente già registrato" });
    }

    const hash = await bcrypt.hash(password, 12);
    const inserted = await db.execute(sql`
      INSERT INTO users (email, password_hash) VALUES (${email}, ${hash}) RETURNING id, email, created_at
    `);

    return res.status(201).json({ user: inserted[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Errore interno" });
  }
}
