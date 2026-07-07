// api/auth/register.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { pool, ensureSchema } from "../../server/db";
import { signSession } from "../../server/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Metodo non permesso" });

    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: "email e password richiesti" });
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "formato non valido" });
    }
    if (password.length < 8) return res.status(400).json({ error: "Password troppo corta (>=8 caratteri)" });

    const normalizedEmail = email.trim().toLowerCase();

    await ensureSchema();

    const existing = await pool.query("SELECT id FROM users WHERE email = $1 LIMIT 1", [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Utente già registrato" });
    }

    // L'account con questa email diventa automaticamente "scrittore" del blog.
    // Vedi server/db.ts e api/auth/login.ts per gli altri punti in cui viene applicato.
    const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const role: "admin" | "reader" = adminEmail && normalizedEmail === adminEmail ? "admin" : "reader";

    const hash = await bcrypt.hash(password, 12);
    const inserted = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [normalizedEmail, hash, role]
    );

    const user = inserted.rows[0];
    // Login automatico dopo la registrazione, cosi' non serve un passaggio in piu'.
    const token = signSession({ userId: user.id, email: user.email, role: user.role });

    return res.status(201).json({ token });
  } catch (e: any) {
    console.error("REGISTER_ERROR:", e?.message || e, e?.stack);
    return res.status(500).json({ error: "Errore interno" });
  }
}
