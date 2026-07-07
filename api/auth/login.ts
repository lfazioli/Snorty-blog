// api/auth/login.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { pool, ensureSchema } from "../../server/db";
import { signSession } from "../../server/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Metodo non permesso" });

    const { email, password } = req.body ?? {};
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "email e password richiesti" });
    }
    const normalizedEmail = email.trim().toLowerCase();

    await ensureSchema();

    const result = await pool.query(
      "SELECT id, email, password_hash, role FROM users WHERE email = $1 LIMIT 1",
      [normalizedEmail]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }

    let role: "admin" | "reader" = user.role === "admin" ? "admin" : "reader";

    // Se hai impostato ADMIN_EMAIL dopo aver gia' creato questo account, viene
    // promosso automaticamente al prossimo login, senza bisogno di SQL manuale.
    const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    if (adminEmail && normalizedEmail === adminEmail && role !== "admin") {
      await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [user.id]);
      role = "admin";
    }

    const token = signSession({ userId: user.id, email: user.email, role });
    return res.status(200).json({ token });
  } catch (e: any) {
    console.error("LOGIN_ERROR:", e?.message || e, e?.stack);
    return res.status(500).json({ error: "Errore interno" });
  }
}
