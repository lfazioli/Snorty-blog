// api/auth/forgot.ts
import type { IncomingMessage, ServerResponse } from "http";

type VercelRequest = IncomingMessage & { body?: any; query?: any; cookies?: Record<string, string> };
type VercelResponse = ServerResponse & { status: (code: number) => VercelResponse; json: (body: any) => VercelResponse };

import { db } from "../../src/db/client";
import { sql } from "drizzle-orm";
import crypto from "crypto";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo non permesso" });

  const { email } = req.body ?? {};
  if (!email) return res.status(400).json({ error: "email richiesto" });

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    const users = await db.execute(sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`);
    const user = users[0];

    // Risposta generica per privacy
    if (!user) return res.status(200).json({ message: "Se l'email esiste, invieremo un link di reset" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h

    await db.execute(sql`
      INSERT INTO password_resets (user_id, token, expires_at) VALUES (${user.id}, ${token}, ${expiresAt})
    `);

    // In produzione: invia email con link https://tuodominio/reset?token=XYZ
    return res.status(200).json({ message: "Link di reset generato", resetToken: token });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Errore interno" });
  }
}
