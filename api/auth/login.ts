// api/auth/login.ts
// removed @vercel/node types to avoid missing-module errors
import { db } from "../../src/db/client";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signSession } from "../../src/lib/jwt";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo non permesso" });

  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "email e password richiesti" });

  try {
    const users = await db.execute(sql`SELECT id, email, password_hash FROM users WHERE email = ${email} LIMIT 1`);
    const user = users[0];
    if (!user) return res.status(401).json({ error: "Credenziali non valide" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenziali non valide" });

    const token = signSession({ userId: user.id, email: user.email });

    res.setHeader(
      "Set-Cookie",
      `session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
    );

    return res.status(200).json({ message: "Login ok" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Errore interno" });
  }
}
