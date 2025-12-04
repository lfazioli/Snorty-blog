// api/auth/register.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

// Inizializza il pool qui per vedere subito errori di connessione nei logs
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL non impostata nelle variabili d'ambiente");
}
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

async function ensureUsersTable() {
  await pool.query(`
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

  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: "email e password richiesti" });
    if (typeof email !== "string" || typeof password !== "string")
      return res.status(400).json({ error: "formato non valido" });
    if (password.length < 8) return res.status(400).json({ error: "Password troppo corta (>=8 caratteri)" });

    // Test connessione (log utile)
    try {
      await pool.query("SELECT 1");
    } catch (connErr: any) {
      console.error("REGISTER_CONN_ERROR:", connErr?.message || connErr);
      return res.status(500).json({ error: "Connessione al database fallita" });
    }

    await ensureUsersTable();

    const existing = await pool.query("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Utente già registrato" });
    }

    const hash = await bcrypt.hash(password, 12);
    const inserted = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
      [email, hash]
    );

    return res.status(201).json({ user: inserted.rows[0] });
  } catch (e: any) {
    console.error("REGISTER_ERROR:", e?.message || e, e?.stack);
    return res.status(500).json({ error: "Errore interno" });
  }
}
