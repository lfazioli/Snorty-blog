// api/auth/forgot.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";
import crypto from "crypto";

function normalizeDatabaseUrl(url?: string): string {
  if (!url) throw new Error("DATABASE_URL non impostata nelle variabili d'ambiente");
  try {
    const u = new URL(url);
    const params = u.searchParams;
    if (!params.get("sslmode")) params.set("sslmode", "require");
    if (params.get("channel_binding")) params.delete("channel_binding");
    u.search = params.toString();
    return u.toString();
  } catch {
    return url;
  }
}

const pool = new Pool({
  connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL),
  ssl: { rejectUnauthorized: false },
});

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
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
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Metodo non permesso" });

    const ct = req.headers["content-type"] || req.headers["Content-Type"];
    if (!ct || !String(ct).includes("application/json")) {
      return res.status(400).json({ error: "Content-Type application/json richiesto" });
    }

    const { email } = req.body ?? {};
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "email richiesto" });
    }

    // Test connessione
    try {
      await pool.query("SELECT 1");
    } catch (connErr: any) {
      console.error("FORGOT_CONN_ERROR:", connErr?.message || connErr);
      return res.status(500).json({ error: "Connessione al database fallita" });
    }

    await ensureTables();

    const users = await pool.query("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
    const user = users.rows[0];

    // Risposta privacy-preserving
    if (!user) {
      return res.status(200).json({ message: "Se l'email esiste, invieremo un link di reset" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await pool.query(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, token, expiresAt]
    );

    // Link compatibile con la tua route client /reset-password/:token
    return res.status(200).json({
      message: "Link di reset generato",
      resetToken: token,
      resetLink: `/reset-password/${token}`,
    });
  } catch (e: any) {
    console.error("FORGOT_ERROR:", e?.message || e, e?.stack);
    return res.status(500).json({ error: "Errore interno" });
  }
}
