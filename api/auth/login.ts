// api/auth/login.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Valida env e normalizza la DATABASE_URL (rimuove channel_binding se presente)
function normalizeDatabaseUrl(url?: string): string {
  if (!url) throw new Error("DATABASE_URL non impostata nelle variabili d'ambiente");
  try {
    const u = new URL(url);
    // Garantisce sslmode=require
    const params = u.searchParams;
    if (!params.get("sslmode")) params.set("sslmode", "require");
    // Alcuni ambienti pg non supportano channel binding → rimuoviamolo
    if (params.get("channel_binding")) params.delete("channel_binding");
    u.search = params.toString();
    return u.toString();
  } catch {
    // Se non è una URL valida, ritorna com’è (pg accetta comunque connectionString raw)
    return url;
  }
}

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
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

// Opzionale: gestisce preflight CORS (utile se fai richieste da domini differenti)
function maybeHandleCors(req: VercelRequest, res: VercelResponse): boolean {
  // Consenti solo POST e OPTIONS
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  // Se vuoi limitare origin, sostituisci "*" con il tuo dominio
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (maybeHandleCors(req, res)) return;
    if (req.method !== "POST") return res.status(405).json({ error: "Metodo non permesso" });

    const contentType = req.headers["content-type"] || req.headers["Content-Type"];
    if (!contentType || (Array.isArray(contentType) ? !contentType.join("").includes("application/json") : !String(contentType).includes("application/json"))) {
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

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET as string, { expiresIn: "7d" });

    return res.status(200).json({ token });
  } catch (e: any) {
    console.error("LOGIN_ERROR:", e?.message || e, e?.stack);
    return res.status(500).json({ error: "Errore interno" });
  }
}
