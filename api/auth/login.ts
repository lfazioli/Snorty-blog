// api/auth/login.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { pool, ensureSchema } from "../../server/db.js";
import { signSession } from "../../server/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { email, password } = req.body ?? {};
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const normalizedEmail = email.trim().toLowerCase();

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

    let role: "admin" | "reader" = user.role === "admin" ? "admin" : "reader";

    // If you set ADMIN_EMAIL after this account was already created, it gets
    // promoted automatically on the next login, no manual SQL needed.
    const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    if (adminEmail && normalizedEmail === adminEmail && role !== "admin") {
      await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [user.id]);
      role = "admin";
    }

    const token = signSession({ userId: user.id, email: user.email, role });
    return res.status(200).json({ token });
  } catch (e: any) {
    console.error("LOGIN_ERROR:", e?.message || e, e?.stack);
    return res.status(500).json({ error: "Internal error" });
  }
}
