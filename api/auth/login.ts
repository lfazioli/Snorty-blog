// api/auth/login.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL non impostata nelle variabili d'ambiente");
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET non impostata nelle variabili d'ambiente");
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
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("application/json")) {
      return res.status(400).json({ error: "Content-Type application/json richiesto" });
    }

    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: "email e password richiesti" });
    if (typeof email !== "string" || typeof password !== "string") return res.status(400).json({ error: "formato non valido" });

    // Test connessione
    try {
      await pool.query("SELECT 1");
    } catch (connErr: any) {
      console.error("LOGIN_CONN_ERROR:", connErr?.message || connErr);
      return res.status(500).json({ error: "Connessione al database fallita" });
    }

    await ensureUsersTable();

    const result = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1 LIMIT 1",
      [email]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET!, { expiresIn: "7d" });

    return res.status(200).json({ token });
  } catch (e: any) {
    console.error("LOGIN_ERROR:", e?.message || e, e?.stack);
    return res.status(500).json({ error: "Errore interno" });
  }
}
