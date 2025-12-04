// api/auth/health.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL!, ssl: { rejectUnauthorized: false } });
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const ping = await pool.query("SELECT 1 AS ok");
    await pool.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT NOW())`);
    const count = await pool.query("SELECT COUNT(*)::int AS n FROM users");
    res.status(200).json({ db: "ok", ping: ping.rows[0].ok, users: count.rows[0].n });
  } catch (e: any) {
    console.error("HEALTH_ERROR:", e?.message || e);
    res.status(500).json({ error: "db error", message: e?.message });
  }
}
