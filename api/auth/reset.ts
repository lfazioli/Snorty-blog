// api/auth/reset.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { pool, ensureSchema } from "../../server/db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { token, newPassword } = req.body ?? {};
    if (!token || !newPassword) return res.status(400).json({ error: "token and newPassword are required" });
    if (typeof token !== "string" || typeof newPassword !== "string") {
      return res.status(400).json({ error: "Invalid format" });
    }
    if (newPassword.length < 8) return res.status(400).json({ error: "Password too short (min 8 characters)" });

    await ensureSchema();

    const r = await pool.query(
      "SELECT id, user_id, expires_at, used FROM password_resets WHERE token = $1 LIMIT 1",
      [token]
    );
    const reset = r.rows[0];
    if (!reset || reset.used) return res.status(400).json({ error: "Invalid token" });
    if (new Date(reset.expires_at).getTime() < Date.now()) return res.status(400).json({ error: "This token has expired" });

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [hash, reset.user_id]);
    await pool.query("UPDATE password_resets SET used = TRUE WHERE id = $1", [reset.id]);

    return res.status(200).json({ message: "Password updated" });
  } catch (e: any) {
    console.error("RESET_ERROR:", e?.message || e);
    return res.status(500).json({ error: "Internal error" });
  }
}
