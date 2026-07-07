// api/auth/health.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { pool, ensureSchema } from "../../server/db";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    await ensureSchema();
    const ping = await pool.query("SELECT 1 AS ok");
    const users = await pool.query("SELECT COUNT(*)::int AS n FROM users");
    const posts = await pool.query("SELECT COUNT(*)::int AS n FROM posts");
    res.status(200).json({ db: "ok", ping: ping.rows[0].ok, users: users.rows[0].n, posts: posts.rows[0].n });
  } catch (e: any) {
    console.error("HEALTH_ERROR:", e?.message || e);
    res.status(500).json({ error: "db error", message: e?.message });
  }
}
