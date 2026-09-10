// api/auth/login.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { pool, ensureSchema } from "../../server/db.js";
import { signSession } from "../../server/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { email, password } = req.body ?? {};
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const normalizedEmail = email.trim().toLowerCase();

    const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    if (!adminEmail) {
      console.error("LOGIN_NOT_CONFIGURED: ADMIN_EMAIL is missing");
      return res.status(503).json({ error: "Administrator login is unavailable" });
    }
    if (normalizedEmail !== adminEmail) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    await ensureSchema();

    const result = await pool.query(
      "SELECT id, email, password_hash, role FROM users WHERE email = $1 LIMIT 1",
      [normalizedEmail]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.role !== "admin") {
      await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [user.id]);
    }
    const token = signSession({ userId: user.id, email: user.email, role: "admin" });
    return res.status(200).json({ token });
  } catch (error) {
    console.error("LOGIN_ERROR:", error);
    return res.status(500).json({ error: "Internal error" });
  }
}
