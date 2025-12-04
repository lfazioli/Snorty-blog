// api/auth/reset.ts
// Minimal local types to avoid depending on @vercel/node
type VercelRequest = {
  method?: string;
  body?: any;
};
type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: any) => VercelResponse;
};
import { db } from "../../src/db/client";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo non permesso" });

  const { token, newPassword } = req.body ?? {};
  if (!token || !newPassword) return res.status(400).json({ error: "token e newPassword richiesti" });
  if (newPassword.length < 8) return res.status(400).json({ error: "password troppo corta (>=8)" });

  try {
    const rows = await db.execute(sql`
      SELECT pr.id, pr.user_id, pr.expires_at, pr.used
      FROM password_resets pr
      WHERE pr.token = ${token}
      LIMIT 1
    `);
    const reset = rows[0];
    if (!reset || reset.used) return res.status(400).json({ error: "Token non valido" });
    if (new Date(reset.expires_at).getTime() < Date.now()) return res.status(400).json({ error: "Token scaduto" });

    const hash = await bcrypt.hash(newPassword, 12);

    await db.execute(sql`UPDATE users SET password_hash = ${hash} WHERE id = ${reset.user_id}`);
    await db.execute(sql`UPDATE password_resets SET used = TRUE WHERE id = ${reset.id}`);

    return res.status(200).json({ message: "Password aggiornata" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Errore interno" });
  }
}
