// api/auth/login.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../../src/db/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET non impostata nelle variabili d'ambiente");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo non permesso" });

  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "email e password richiesti" });

  try {
    const users = await query<{ id: number; email: string; password_hash: string }>(
      "SELECT id, email, password_hash FROM users WHERE email = $1 LIMIT 1",
      [email]
    );
    const user = users[0];
    if (!user) return res.status(401).json({ error: "Credenziali non valide" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenziali non valide" });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    return res.status(200).json({ token });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Errore interno" });
  }
}
